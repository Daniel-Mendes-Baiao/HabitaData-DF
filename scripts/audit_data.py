import requests
import json

res = requests.get('http://127.0.0.1:8000/api/analysis/regional-comparison')
data = res.json()
print(json.dumps(data['data'][:3], indent=2))
