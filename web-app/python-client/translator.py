"""Command-line Python client for the Darija REST service (standard library only)."""
import argparse
import base64
import json
import os
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

def translate(text, source="English", style="natural"):
    url = os.getenv("TRANSLATOR_API_URL", "http://localhost:8082/api/translator/translate")
    user = os.getenv("TRANSLATOR_BASIC_USER", "student")
    password = os.getenv("TRANSLATOR_BASIC_PASSWORD", "translator")
    auth = base64.b64encode(f"{user}:{password}".encode()).decode()
    payload = json.dumps({"text": text, "sourceLanguage": source,
                          "targetLanguage": "Darija", "style": style}).encode()
    req = Request(url, data=payload, method="POST", headers={
        "Content-Type": "application/json", "Authorization": f"Basic {auth}"})
    with urlopen(req, timeout=70) as response:
        return json.load(response)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="English to Moroccan Darija")
    parser.add_argument("text", nargs="?", help="Text to translate; prompted if absent")
    parser.add_argument("--source", default="English")
    parser.add_argument("--style", default="natural")
    args = parser.parse_args()
    try:
        result = translate(args.text or input("Enter text: "), args.source, args.style)
        print(result.get("translatedText", result))
    except HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode(errors='replace')}")
        raise SystemExit(1)
    except (URLError, TimeoutError) as e:
        print(f"Connection error: {e}")
        raise SystemExit(1)
