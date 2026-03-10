import requests
import json
from requests.exceptions import ConnectionError, Timeout, HTTPError

URL = 'http://127.0.0.1:8000/api/analysis/regional-comparison'

try:
	res = requests.get(URL, timeout=5)
	res.raise_for_status()
	data = res.json()
	print(json.dumps(data.get('data', [])[:3], indent=2))
except ConnectionError:
	print(f"Connection failed: could not connect to {URL}. Is the backend running on port 8000?")
except Timeout:
	print(f"Request timed out when connecting to {URL}.")
except HTTPError as e:
	print(f"HTTP error: {e} (status code: {getattr(e.response, 'status_code', 'unknown')})")
except ValueError:
	print("Response did not contain valid JSON.")
