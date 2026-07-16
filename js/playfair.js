// /* ============================================================
//    playfair.js — Playfair Cipher
//    Digraph substitution using a 5×5 key matrix. J merged with I.
//    ============================================================ */

/**
 * Build a 5×5 Playfair matrix from a keyword.
 * J is treated as I. Duplicate letters are removed.
 * @param {string} key
 * @returns {string[][]} 5×5 matrix
 */
function buildPlayfairMatrix(key) {
  const alpha   = 'abcdefghiklmnopqrstuvwxyz'; // no 'j'
  const cleaned = (key + alpha).toLowerCase().replace(/j/g, 'i').replace(/[^a-z]/g, '');
  const seen    = new Set();
  const order   = [];
  for (const c of cleaned) {
    if (!seen.has(c)) { seen.add(c); order.push(c); }
  }
  const matrix = [];
  for (let i = 0; i < 5; i++) matrix.push(order.slice(i * 5, i * 5 + 5));
  return matrix;
}

/**
 * Find the row and column of a character in the Playfair matrix.
 * @param {string[][]} matrix
 * @param {string} ch
 * @returns {[number, number]}
 */
function playfairFind(matrix, ch) {
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++)
      if (matrix[r][c] === ch) return [r, c];
  return null;
}

/**
 * Core Playfair encrypt/decrypt logic.
 * @param {string}     text
 * @param {string}     key
 * @param {boolean}    enc - true = encrypt, false = decrypt
 * @returns {string}
 */
function playfairProcess(text, key, enc) {
  const matrix = buildPlayfairMatrix(key);

  // Display the key matrix in the UI
  document.getElementById('playfair-matrix').innerHTML =
    matrix.map(row => row.join(' · ')).join('<br>');
  document.getElementById('playfair-matrix-area').style.display = 'block';

  // Prepare digraphs — remove non-alpha, replace j→i, insert 'x' between repeated pairs
  let clean = text.toLowerCase().replace(/j/g, 'i').replace(/[^a-z]/g, '');
  const pairs = [];
  let i = 0;
  while (i < clean.length) {
    let a = clean[i];
    let b = clean[i + 1] || 'x';
    if (a === b) { b = 'x'; i++; } else { i += 2; }
    pairs.push([a, b]);
  }

  // Encode / decode each digraph
  const shift = enc ? 1 : 4; // +1 encrypt, +4 (≡ -1 mod 5) decrypt
  let result = '';
  for (const [a, b] of pairs) {
    const [r1, c1] = playfairFind(matrix, a);
    const [r2, c2] = playfairFind(matrix, b);

    if (r1 === r2) {
      // Same row → shift columns
      result += matrix[r1][(c1 + shift) % 5] + matrix[r2][(c2 + shift) % 5];
    } else if (c1 === c2) {
      // Same column → shift rows
      result += matrix[(r1 + shift) % 5][c1] + matrix[(r2 + shift) % 5][c2];
    } else {
      // Rectangle → swap corners
      result += matrix[r1][c2] + matrix[r2][c1];
    }
  }
  return result;
}

/** Encrypt using the Playfair cipher. */
function playfairEncrypt() {
  clearError('playfair');
  const text = document.getElementById('playfair-text').value;
  const key  = document.getElementById('playfair-key').value;
  if (!text || !key) { showError('playfair', 'Enter both message and keyword.'); return; }
  setResult('playfair-result', playfairProcess(text, key, true));
}

/** Decrypt using the Playfair cipher. */
function playfairDecrypt() {
  clearError('playfair');
  const text = document.getElementById('playfair-text').value;
  const key  = document.getElementById('playfair-key').value;
  if (!text || !key) { showError('playfair', 'Enter both message and keyword.'); return; }
  setResult('playfair-result', playfairProcess(text, key, false));
}
