import sys
import os
sys.path.append(os.getcwd())
from analytics.db import query
import pandas as pd

df = query("SELECT * FROM historico_valor_imovel LIMIT 5")
print(df.to_string())

df_infra = query("SELECT * FROM infraestrutura_regional LIMIT 5")
print(df_infra.to_string())
