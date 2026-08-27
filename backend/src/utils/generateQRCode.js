const QRCode = require('qrcode');

// Generates a QR code as a base64 data URL encoding ONLY the opaque qrToken
// (never booking/user PII) so scanning it reveals nothing sensitive on its own.
async function generateQRCode(qrToken) {
  const payload = JSON.stringify({ token: qrToken });
  return QRCode.toDataURL(payload, { margin: 1, width: 300 });
}

module.exports = generateQRCode;
