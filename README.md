# HabitaData-DF

## Inteligência de Dados para o Mercado Imobiliário do Distrito Federal

**HabitaData-DF** é uma solução analítica inovadora projetada para mapear, acompanhar e compreender a valorização imobiliária no Distrito Federal. O projeto cruza dados históricos do mercado habitacional com indicadores de infraestrutura urbana, entregando inteligência estratégica e dados claros para a tomada de decisões.

---

## 🛠 Stack Tecnológico
- **Frontend**: Next.js, React, Tailwind CSS, Deck.gl/MapLibre (Mapas Interativos), Plotly.
- **Backend**: Python, FastAPI, Uvicorn, Pandas, SQLModel/SQLAlchemy.
- **Banco de Dados**: SQLite (`habitadata_df.db`).

---

## 🚀 Como Iniciar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (versão 18+)
- [Python](https://www.python.org/) 3.9 ou superior

### 1. Configurando o Backend (API FastAPI)

Dependendo do seu sistema operacional, inicialize o backend da seguinte maneira a partir da raiz do repositório:

```bash
# Crie e ative um ambiente virtual
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/MacOS
# source .venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Inicialize o banco de dados (processa o dataset dataset/imoveis-df.csv)
python setup_db.py

# Inicie o servidor em modo de desenvolvimento
uvicorn backend.main:app --reload
```
A API ficará disponível em http://localhost:8000. 
Para acessar a documentação interativa baseada em Swagger, acesse **http://localhost:8000/docs**.

### 2. Configurando o Frontend (Next.js)

Em uma nova janela do terminal, vá para o diretório `frontend` e inicialize a aplicação Node.js:

```bash
cd frontend

# Instale os pacotes e dependências
npm install

# Inicie o sistema para desenvolvimento
npm run dev
```

A interface web estará acessível em **http://localhost:3000**.

---

## 🏗 Estrutura do Repositório
- `/backend/`: Onde fica toda a lógica da API, processamento dos dados demográficos e de habitação, utilitários geoespaciais e endpoints (ex: `main.py`).
- `/frontend/`: Painel de visualização com componentes interativos em React/Next.js.
- `/dataset/`: Diretórios onde localizam dados de origem como CSVs (ex: `imoveis-df.csv`).
- `/scripts/`: Rotinas utilitárias diversas de migração e manutenção em data/DB.
- `Apresentacao_Projeto.md`: O conceito e documento descritivo sobre as inovações que a plataforma visa solucionar.
- `setup_db.py`: Utilitário para a primeira configuração e o "seed" do banco de dados a partir dos dados do dataset.
- `requirements.txt`: Dependências do Backend.
- `schema.sql`: Definição estrutural básica do modelo relacional.

---

## 💡 O Problema & A Solução

O valor de um imóvel no Distrito Federal e o seu potencial de rentabilidade futura são afetados dezenas de fatores: localização em expansão (RAs), proximidade a escolas e infraestrutura como o Metrô-DF, taxas de criminalidade, etc.

Por meio de cruzamento visual e estatística, o **HabitaData-DF** traduz esses fatores de precificação em **modelos facilmente visíveis**, auxiliando investidores imobiliários, incorporadoras, gestores públicos (na formulação de políticas habitacionais e infraestrutura urbana) e os próprios cidadãos na sua busca pela casa ideal.