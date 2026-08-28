/**
 * RFC 6238 TOTP (Time-based One-Time Password) Implementation for Google Authenticator
 */

// Base32 decoding
function base32ToHex(base32: string): string {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';

  const cleanBase32 = base32.replace(/=+$/, '').toUpperCase();

  for (let i = 0; i < cleanBase32.length; i++) {
    const val = base32chars.indexOf(cleanBase32.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex += parseInt(chunk, 2).toString(16);
  }

  return hex;
}

// Pure JS SHA1 and HMAC-SHA1 implementation
function sha1(bytes: Uint8Array): Uint8Array {
  function rotl(n: number, s: number) { return (n << s) | (n >>> (32 - s)); }
  
  const blocks: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    blocks[i >> 2] = (blocks[i >> 2] || 0) | (bytes[i] << (24 - (i % 4) * 8));
  }
  
  const bitLength = bytes.length * 8;
  blocks[bitLength >> 5] = (blocks[bitLength >> 5] || 0) | (0x80 << (24 - (bitLength % 32)));
  blocks[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;

  let H0 = 0x67452301;
  let H1 = 0xefcdab89;
  let H2 = 0x98badcfe;
  let H3 = 0x10325476;
  let H4 = 0xc3d2e1f0;

  const w = new Int32Array(80);

  for (let i = 0; i < blocks.length; i += 16) {
    for (let t = 0; t < 16; t++) {
      w[t] = blocks[i + t] || 0;
    }
    for (let t = 16; t < 80; t++) {
      w[t] = rotl(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
    }

    let a = H0, b = H1, c = H2, d = H3, e = H4;

    for (let t = 0; t < 80; t++) {
      let f, k;
      if (t < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (rotl(a, 5) + f + e + k + w[t]) | 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }

    H0 = (H0 + a) | 0;
    H1 = (H1 + b) | 0;
    H2 = (H2 + c) | 0;
    H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0;
  }

  const result = new Uint8Array(20);
  const hWords = [H0, H1, H2, H3, H4];
  for (let i = 0; i < 5; i++) {
    result[i * 4] = (hWords[i] >>> 24) & 0xff;
    result[i * 4 + 1] = (hWords[i] >>> 16) & 0xff;
    result[i * 4 + 2] = (hWords[i] >>> 8) & 0xff;
    result[i * 4 + 3] = hWords[i] & 0xff;
  }
  return result;
}

function hmacSha1(keyBytes: Uint8Array, messageBytes: Uint8Array): Uint8Array {
  const blockSize = 64;
  let k = new Uint8Array(blockSize);
  if (keyBytes.length > blockSize) {
    const hash = sha1(keyBytes);
    k.set(hash);
  } else {
    k.set(keyBytes);
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = k[i] ^ 0x5c;
    iKeyPad[i] = k[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(blockSize + messageBytes.length);
  innerMsg.set(iKeyPad, 0);
  innerMsg.set(messageBytes, blockSize);
  const innerHash = sha1(innerMsg);

  const outerMsg = new Uint8Array(blockSize + 20);
  outerMsg.set(oKeyPad, 0);
  outerMsg.set(innerHash, blockSize);
  return sha1(outerMsg);
}

export const ADMIN_2FA_SECRET = 'JBSWY3DPEHPK3PXP'; // Standard TOTP Base32 Key
export const ADMIN_2FA_LABEL = 'CampusFix:admin@campusfix.edu';
export const ADMIN_2FA_ISSUER = 'CampusFix';

export const totpService = {
  getSecret(): string {
    return ADMIN_2FA_SECRET;
  },

  getOtpAuthUrl(): string {
    return `otpauth://totp/${encodeURIComponent(ADMIN_2FA_LABEL)}?secret=${ADMIN_2FA_SECRET}&issuer=${encodeURIComponent(ADMIN_2FA_ISSUER)}`;
  },

  getQRCodeUrl(): string {
    // High-resolution scannable QR code using SVG QR endpoint for Google Authenticator
    const otpAuth = this.getOtpAuthUrl();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuth)}&margin=10`;
  },

  generateCode(epochSeconds = Math.floor(Date.now() / 1000)): string {
    const timeStep = Math.floor(epochSeconds / 30);
    
    // 8-byte big-endian time counter
    const timeBytes = new Uint8Array(8);
    let temp = timeStep;
    for (let i = 7; i >= 0; i--) {
      timeBytes[i] = temp & 0xff;
      temp = Math.floor(temp / 256);
    }

    // Key bytes from Base32
    const hexKey = base32ToHex(ADMIN_2FA_SECRET);
    const keyBytes = new Uint8Array(hexKey.length / 2);
    for (let i = 0; i < hexKey.length; i += 2) {
      keyBytes[i / 2] = parseInt(hexKey.substr(i, 2), 16);
    }

    const hmac = hmacSha1(keyBytes, timeBytes);

    // Dynamic truncation
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary = 
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  },

  getSecondsRemaining(): number {
    return 30 - (Math.floor(Date.now() / 1000) % 30);
  },

  verify(inputCode: string): boolean {
    const clean = inputCode.replace(/\s+/g, '');
    if (clean.length !== 6) return false;

    const currentEpoch = Math.floor(Date.now() / 1000);
    
    // Verify against current, previous (-30s), and next (+30s) windows to handle clock drift
    const validCodes = [
      this.generateCode(currentEpoch - 30),
      this.generateCode(currentEpoch),
      this.generateCode(currentEpoch + 30)
    ];

    return validCodes.includes(clean);
  }
};
