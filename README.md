# Darija Translator — Project 2
**Student:** Zineb Maimmadi  
**Project:** LLM-powered RESTful Web Service (English → Moroccan Darija)

This package expands the original submission while preserving its Java/Jersey backend, Gemini integration, Chrome Manifest V3 extension, and browser web UI.

## Project layout
- `translator-service/`: Maven Java 17, Jakarta REST/Jersey, embedded Grizzly HTTP server
- `chrome-extension/`: Manifest V3 side panel, selection context menu, speech features in original UI
- `web-app/`: original browser client
- `python-client/`: working Python CLI client
- `php-client/`: working PHP web client
- `mobile-client/`: React Native / Expo client
- `docs/uml/`: PlantUML class and deployment diagrams
- `tests/smoke_test.py`: authentication and translation HTTP smoke test

## Start the Java backend
Requires Java 17+, Maven 3.9+, and an active Gemini API key.

Windows PowerShell:
```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
$env:GEMINI_MODEL="gemini-2.5-flash"
cd translator-service
mvn clean compile exec:java
```
Linux/macOS:
```bash
export GEMINI_API_KEY="YOUR_KEY"
export GEMINI_MODEL="gemini-2.5-flash"
cd translator-service && mvn clean compile exec:java
```
Service endpoint: `POST http://localhost:8082/api/translator/translate`

Demo Basic credentials default to `student` / `translator`. Override with `TRANSLATOR_BASIC_USER` and `TRANSLATOR_BASIC_PASSWORD` environment variables. Keep all client credentials consistent. Never commit your real API key.

## HTTP request example
```bash
curl -u student:translator -H "Content-Type: application/json"   -d '{"text":"Hello, how are you?","sourceLanguage":"English","targetLanguage":"Darija","style":"natural"}'   http://localhost:8082/api/translator/translate
```
Expected JSON has `originalText`, `translatedText`, `sourceLanguage`, `targetLanguage`, `model`, `status`. Exact translation wording varies with LLM output.

## Run each client
1. Chrome: open `chrome://extensions`, enable Developer mode, **Load unpacked** → `chrome-extension`. Select webpage text, right-click **Translate selection to Darija**, or click extension icon.
2. Web: open `web-app/index.html` in a browser while Java service runs.
3. Python: `python python-client/translator.py "Thank you"`.
4. PHP: `cd php-client && php -S localhost:8000`, then visit `http://localhost:8000`.
5. React Native: `cd mobile-client && npm install && npm start`. Follow `mobile-client/README.md` to set the correct backend address.

## Test
With the backend running and Gemini configured, run `python tests/smoke_test.py`. Test all client interfaces manually as well. API requests require internet connectivity for Gemini.

## Architecture
See `docs/uml/class-diagram.puml` and `docs/uml/deployment-diagram.puml`. Render with PlantUML. The backend uses the Jakarta RESTful Web Services API with Jersey on an embedded Grizzly server.

## Security and scope
The backend currently uses a **custom HTTP Basic authentication guard**, not a full Jakarta Authentication (JASPIC) provider. A fully specification-compliant Jakarta Authentication implementation would require additional container integration. For a production deployment, replace demo credentials and HTTP with HTTPS and proper authentication. Do not expose the local demonstration server publicly.

## Submission items requiring manual completion
- GitHub repository URL and real commit history: create/push your own repository.
- 5-minute recorded demo: record and submit separately.
- Real API key: supply via environment variable, never in the ZIP.

No demo script is included.
