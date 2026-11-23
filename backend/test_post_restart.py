import urllib.request
import json

def post(url, d):
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/v1{url}', data=json.dumps(d).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

with urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health') as resp:
    print('Health response:', json.loads(resp.read().decode('utf-8')))

test_accs = [
    ('admin@agrimitra.gov.in', 'Admin@123', 'admin'),
    ('kavana.farmer@example.com', 'KavanaFarmer@2026', 'farmer'),
    ('vijay.buyer@example.com', 'VijayBuyer@2026', 'buyer'),
    ('ravi.extension@agrimitra.gov.in', 'RaviOfficer@2026', 'staff/expert')
]

for email, pwd, role in test_accs:
    res = post('/auth/login', {'identifier': email, 'password': pwd})
    u = res['user']
    print(f"Persistence OK: {u['full_name']} ({u['email']}) | ID: {u['id']} | Role: {u['role']}")
