<?php
$translation = '';
$error = '';
$text = $_POST['text'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (trim($text) === '') {
        $error = 'Please enter some text.';
    } else {
        $url = getenv('TRANSLATOR_API_URL') ?: 'http://localhost:8082/api/translator/translate';
        $user = getenv('TRANSLATOR_BASIC_USER') ?: 'student';
        $password = getenv('TRANSLATOR_BASIC_PASSWORD') ?: 'translator';
        $payload = json_encode(['text' => $text, 'sourceLanguage' => 'English',
            'targetLanguage' => 'Darija', 'style' => 'natural']);
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 70,
            CURLOPT_HTTPAUTH => CURLAUTH_BASIC, CURLOPT_USERPWD => "$user:$password",
            CURLOPT_HTTPHEADER => ['Content-Type: application/json']]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        if ($body === false) {
            $error = "Connection error: $curlError";
        } else {
            $data = json_decode($body, true);
            if ($status >= 200 && $status < 300 && isset($data['translatedText'])) {
                $translation = $data['translatedText'];
            } else {
                $error = 'Translation failed (HTTP ' . $status . '): ' .
                    ($data['message'] ?? $data['error'] ?? substr($body, 0, 250));
            }
        }
    }
}
function safe($value) { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Darija Translator — PHP</title>
<style>body{font:16px system-ui;background:#f4f5fb;color:#20233b;max-width:700px;margin:60px auto;padding:20px}main{background:white;padding:28px;border-radius:16px;box-shadow:0 8px 25px #20233b18}textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid #bbb;border-radius:8px}button{background:#5844bb;color:white;border:0;border-radius:8px;padding:12px 24px;margin-top:14px;cursor:pointer}.result{white-space:pre-wrap;background:#f2efff;padding:15px;border-radius:8px}.error{color:#a31e30}</style></head>
<body><main><h1>English → Darija</h1><p>PHP client connected to the Java REST API</p>
<form method="post"><label for="text">English text</label><textarea id="text" name="text" rows="5" required><?=safe($text)?></textarea><button type="submit">Translate</button></form>
<?php if ($error): ?><p class="error"><?=safe($error)?></p><?php endif; ?>
<?php if ($translation): ?><h2>Darija translation</h2><div class="result"><?=safe($translation)?></div><?php endif; ?>
</main></body></html>
