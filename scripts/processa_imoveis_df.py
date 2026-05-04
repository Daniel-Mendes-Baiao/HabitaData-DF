import pandas as pd
import numpy as np
from pathlib import Path

def main():
    base_dir = Path(__file__).parent.parent
    dataset_dir = base_dir / "dataset"
    csv_path = dataset_dir / "imoveis-df.csv"
    
    print(f"Lendo {csv_path}...")
    df = pd.read_csv(csv_path, sep=';', dtype=str)
    
    # 1. regioes.csv
    bairros = df['bairro'].str.lower().str.strip().dropna().unique()
    regioes = pd.DataFrame({'nome_regiao': bairros})
    regioes['id_regiao'] = range(1, len(regioes) + 1)
    np.random.seed(42)
    regioes['indice_desenvolvimento'] = np.random.uniform(0.65, 0.95, len(regioes))
    regioes[['id_regiao', 'nome_regiao', 'indice_desenvolvimento']].to_csv(dataset_dir / 'regioes.csv', index=False)
    print("regioes.csv gerado.")
    
    # 2. imoveis.csv
    df['id_imovel'] = range(1, len(df) + 1)
    
    bairro_id_map = dict(zip(regioes['nome_regiao'], regioes['id_regiao']))
    df['id_regiao'] = df['bairro'].str.lower().str.strip().map(bairro_id_map)
    df.dropna(subset=['id_regiao'], inplace=True)
    df['id_regiao'] = df['id_regiao'].astype(int)
    
    # Clean up area (replace ',' with '.' if any, convert to float)
    df['area'] = df['area'].astype(str).str.replace(',', '.')
    df['metragem'] = pd.to_numeric(df['area'], errors='coerce').fillna(40.0)
    df.loc[df['metragem'] <= 0, 'metragem'] = 40.0
    
    df['quartos'] = pd.to_numeric(df['quartos'], errors='coerce').fillna(1).astype(int)
    df.loc[df['quartos'] <= 0, 'quartos'] = 1
    df['banheiros'] = 1
    
    df['ano_entrega'] = np.random.randint(1990, 2015, len(df))
    
    # preco (rent -> value)
    df['preco'] = df['preco'].astype(str).str.replace(',', '.')
    df['preco_rent'] = pd.to_numeric(df['preco'], errors='coerce').fillna(1000.0)
    df.loc[df['preco_rent'] <= 0, 'preco_rent'] = 1000.0
    
    # Value in 2024 = rent * 200
    df['valor_atual_2024'] = df['preco_rent'] * 200.0
    
    # Assumed average CAGR %
    cagr_medio = 0.04
    df['valor_inicial'] = df['valor_atual_2024'] / ((1 + cagr_medio) ** (2024 - df['ano_entrega']))
    
    imoveis_columns = ['id_imovel', 'id_regiao', 'metragem', 'quartos', 'banheiros', 'ano_entrega', 'valor_inicial']
    df[imoveis_columns].to_csv(dataset_dir / 'imoveis.csv', index=False)
    print("imoveis.csv gerado.")
    
    # 3. historico_valor_imovel.csv
    print("Gerando historico...")
    hist_records = []
    for _, row in df.iterrows():
        ano_inicio = int(row['ano_entrega'])
        v_ini = row['valor_inicial']
        id_imv = int(row['id_imovel'])
        v_atual = row['valor_atual_2024']
        
        anos = list(range(ano_inicio, 2025))
        n_anos = len(anos)
        if n_anos <= 1:
            hist_records.append({'id_imovel': id_imv, 'ano': 2024, 'valor_estimado': v_atual})
            continue
        
        rate = (v_atual / v_ini) ** (1 / (n_anos - 1))
        
        val = v_ini
        for i, ano in enumerate(anos):
            # No noise on the last year so it matches strictly what the rent value says
            noise = 1.0 if ano == 2024 else np.random.normal(1.0, 0.02)
            hist_records.append({'id_imovel': id_imv, 'ano': ano, 'valor_estimado': val * noise})
            val = val * rate
            
    hist_df = pd.DataFrame(hist_records)
    hist_df.to_csv(dataset_dir / 'historico_valor_imovel.csv', index=False)
    print(f"historico_valor_imovel.csv gerado com {len(hist_df)} registros.")
    
    # 4. custo_m2_regional.csv
    print("Gerando custo_m2_regional...")
    merged = hist_df.merge(df[['id_imovel', 'id_regiao', 'metragem']], on='id_imovel')
    merged['custo_m2'] = merged['valor_estimado'] / merged['metragem']
    custo_regional = merged.groupby(['id_regiao', 'ano'])['custo_m2'].mean().reset_index()
    custo_regional.to_csv(dataset_dir / 'custo_m2_regional.csv', index=False)
    print("custo_m2_regional.csv gerado.")
    
    # 5. infraestrutura_regional.csv
    print("Gerando infraestrutura...")
    infra_records = []
    for reg_id in regioes['id_regiao']:
        base_dist = np.random.uniform(0.5, 15.0)
        base_esc = np.random.randint(2, 12)
        base_hosp = np.random.randint(1, 6)
        base_com = np.random.randint(5, 25)
        base_crim = np.random.uniform(0.1, 0.9)
        
        # We need data from earliest year to 2024
        for ano in range(1990, 2025):
            infra_records.append({
                'id_regiao': int(reg_id),
                'ano': ano,
                'distancia_metro_km': max(0.1, base_dist - (2024 - ano)*0.08),  # Distance to subway gets closer over time as city expands
                'escolas_1km': max(0, int(base_esc - (2024 - ano)*0.15)),
                'hospitais_3km': max(0, int(base_hosp - (2024 - ano)*0.08)),
                'comercio_1km': max(0, int(base_com - (2024 - ano)*0.3)),
                'indice_criminalidade': max(0.01, min(0.99, base_crim + np.random.normal(0, 0.03)))
            })
    infra_df = pd.DataFrame(infra_records)
    infra_df.to_csv(dataset_dir / 'infraestrutura_regional.csv', index=False)
    print("infraestrutura_regional.csv gerado.")
    
    print("Todas as bases geradas com sucesso!")

if __name__ == "__main__":
    main()
