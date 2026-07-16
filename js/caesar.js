// /* ============================================================
//    E(x) = (x + k) mod 26
//    ============================================================ */

/**
 * Shift all alphabetic characters in text by the given amount.
 * Non-alpha characters pass through unchanged.
 * @param {string} text
 * @param {number} shift - Positive to encrypt, negative to decrypt
 * @returns {string}
 */
function caesarShift(text, shift) {
  return text.split('').map(c => {
    if (/[a-z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97);
    if (/[A-Z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
    return c;
  }).join('');
}

/** Encrypt using the Caesar cipher. */
function caesarEncrypt() {
  clearError('caesar');
  const text  = document.getElementById('caesar-text').value;
  const shift = parseInt(document.getElementById('caesar-key').value);
  if (!text)      { showError('caesar', 'Enter a message.'); return; }
  if (isNaN(shift)) { showError('caesar', 'Enter a valid shift number.'); return; }
  setResult('caesar-result', caesarShift(text, shift));
}

/** Decrypt using the Caesar cipher (reverse shift). */
function caesarDecrypt() {
  clearError('caesar');
  const text  = document.getElementById('caesar-text').value;
  const shift = parseInt(document.getElementById('caesar-key').value);
  if (!text)      { showError('caesar', 'Enter a message.'); return; }
  if (isNaN(shift)) { showError('caesar', 'Enter a valid shift number.'); return; }
  setResult('caesar-result', caesarShift(text, -shift));
}
