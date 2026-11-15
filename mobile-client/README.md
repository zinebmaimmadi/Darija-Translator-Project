# React Native mobile client (Expo)

Requires Node.js 20+, npm, and Expo Go / Android emulator. Run `npm install` then `npm start`.

Before testing, edit `API_URL` in `App.js`:
- Android emulator: `http://10.0.2.2:8082/api/translator/translate`
- iOS simulator: `http://localhost:8082/api/translator/translate`
- Physical phone: `http://YOUR_COMPUTER_LAN_IP:8082/api/translator/translate` (same Wi-Fi, allow port 8082 in firewall)

Set `USER` and `PASSWORD` to match backend demo credentials. This is an educational local-only client: Basic Auth over HTTP and embedded credentials are not suitable for public deployment. Use HTTPS and secure user sign-in in production.
