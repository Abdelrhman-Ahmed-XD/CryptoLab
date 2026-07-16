// /* ============================================================
//    rc4.js — RC4 Stream Cipher
//    KSA initializes 256-byte state; PRGA generates keystream.
//    Symmetric: same operation encrypts and decrypts.
//    ============================================================ */

/**
 * RC4 core — Key Scheduling Algorithm (KSA) + PRGA.
 * @param {number[]} input - Array of byte values
 * @param {string}   key   - Secret key string
 * @returns {number[]} XOR'd byte array
 */
function rc4Core(input, key) {
  // KSA — initialize state array
  const s = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    [s[i], s[j]] = [s[j], s[i]];
  }

  // PRGA — generate keystream and XOR with input
  let i = 0; j = 0;
  return input.map(byte => {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    [s[i], s[j]] = [s[j], s[i]];
    return byte ^ s[(s[i] + s[j]) % 256];
  });
}

/**
 * Encrypt or decrypt using RC4.
 * Encrypting: plaintext → hex output.
 * Decrypting: hex input → plaintext string.
 * @param {boolean} encrypt
 */
function rc4Process(encrypt) {
  clearError('rc4');
  const key = document.getElementById('rc4-key').value;
  const raw = document.getElementById('rc4-text').value;

  if (!raw) { showError('rc4', 'Enter a message.'); return; }
  if (!key) { showError('rc4', 'Enter a key.'); return; }

  if (encrypt) {
    // String → bytes → RC4 → hex string
    const bytes = Array.from(raw).map(c => c.charCodeAt(0));
    const out   = rc4Core(bytes, key);
    setResult('rc4-result', out.map(b => b.toString(16).padStart(2, '0')).join(''));
  } else {
    // Validate hex input
    if (!/^[0-9a-fA-F]+$/.test(raw) || raw.length % 2 !== 0) {
      showError('rc4', 'Input must be a valid hex string for decryption.');
      return;
    }
    // Hex → bytes → RC4 → string
    const bytes = [];
    for (let i = 0; i < raw.length; i += 2) {
      bytes.push(parseInt(raw.slice(i, i + 2), 16));
    }
    const out = rc4Core(bytes, key);
    setResult('rc4-result', out.map(b => String.fromCharCode(b)).join(''));
  }
}
