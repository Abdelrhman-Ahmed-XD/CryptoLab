// /* ============================================================
//    monoalphabetic.js — Monoalphabetic Substitution Cipher
//    ============================================================ */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Encrypt using a 26-letter substitution key.
 * Each letter a-z maps to the corresponding letter in the key.
 */
function monoEncrypt() {
  clearError('mono');
  const text = document.getElementById('mono-text').value.toLowerCase();
  const key  = document.getElementById('mono-key').value.toLowerCase();

  if (!text) { showError('mono', 'Enter a message.'); return; }
  if (key.length !== 26) { showError('mono', 'Key must be exactly 26 letters.'); return; }
  if (new Set(key).size !== 26) { showError('mono', 'Key must contain 26 unique letters (a-z).'); return; }

  const result = text.split('').map(c =>
    ALPHABET.includes(c) ? key[ALPHABET.indexOf(c)] : c
  ).join('');

  setResult('mono-result', result);
}

/**
 * Decrypt by reversing the substitution key mapping.
 */
function monoDecrypt() {
  clearError('mono');
  const text = document.getElementById('mono-text').value.toLowerCase();
  const key  = document.getElementById('mono-key').value.toLowerCase();

  if (!text) { showError('mono', 'Enter a message.'); return; }
  if (key.length !== 26) { showError('mono', 'Key must be exactly 26 letters.'); return; }

  const result = text.split('').map(c =>
    key.includes(c) ? ALPHABET[key.indexOf(c)] : c
  ).join('');

  setResult('mono-result', result);
}
