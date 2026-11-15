# Web App Prototype

Chat-style interface for the Darija translation client.

Use a simple local server to preview it, for example:

```bash
cd web-app
python3 -m http.server 4173
```

The page expects the backend at `http://127.0.0.1:8082/api`, and the backend expects `GEMINI_API_KEY`.
