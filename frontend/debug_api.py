import requests
import json

try:
    res = requests.get('http://127.0.0.1:8000/api/geospatial/map/regions3d?ano=2021')
    data = res.json()
    print(f"Count: {len(data)}")
    if data:
        print(json.dumps(data[0], indent=2))
except Exception as e:
    print(f"Error: {e}")
