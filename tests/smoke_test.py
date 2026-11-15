"""HTTP integration smoke test. Requires a running Java server and Gemini API key."""
import base64
import json
import os
from urllib.request import Request, urlopen
from urllib.error import HTTPError

url = os.getenv('TRANSLATOR_API_URL', 'http://localhost:8082/api/translator/translate')
payload = json.dumps({'text':'Good morning', 'sourceLanguage':'English','targetLanguage':'Darija','style':'natural'}).encode()
def post(auth=None):
    headers = {'Content-Type':'application/json'}
    if auth: headers['Authorization'] = auth
    return urlopen(Request(url, data=payload, headers=headers, method='POST'), timeout=75)
try:
    post()
    raise AssertionError('Unauthenticated call was accepted')
except HTTPError as e:
    assert e.code == 401, f'Expected 401, got {e.code}'
print('PASS: unauthenticated request denied (401)')
user = os.getenv('TRANSLATOR_BASIC_USER','student')
pwd = os.getenv('TRANSLATOR_BASIC_PASSWORD','translator')
auth = 'Basic ' + base64.b64encode(f'{user}:{pwd}'.encode()).decode()
with post(auth) as response:
    result = json.load(response)
assert result.get('translatedText'), f'Empty translation: {result}'
print('PASS: authenticated translation returned:', result['translatedText'])
