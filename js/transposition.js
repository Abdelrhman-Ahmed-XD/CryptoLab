// /* ============================================================
//    transposition.js — Row Transposition Cipher
//    Plaintext written in rows; columns read in key order.
//    ============================================================ */

/**
 * Validate that a key array is a permutation of [1..N].
 * @param {number[]} key
 * @returns {boolean}
 */
function isValidTransKey(key) {
  if (!key.length || key.some(isNaN)) return false;
  const sorted = [...key].sort((a, b) => a - b);
  for (let i = 0; i < key.length; i++) {
    if (sorted[i] !== i + 1) return false;
  }
  return true;
}

/**
 * Encrypt using Row Transposition.
 * @param {string}   text
 * @param {number[]} key  - e.g. [3,1,4,2]
 * @returns {string}
 */
function rowTranspositionEncrypt(text, key) {
  const numCols = key.length;
  const numRows = Math.ceil(text.length / numCols);
  const grid    = Array(numRows).fill(null).map(() => Array(numCols).fill(' '));

  // Fill grid row by row
  let idx = 0;
  for (let r = 0; r < numRows; r++)
    for (let c = 0; c < numCols && idx < text.length; c++)
      grid[r][c] = text[idx++];

  // Display grid visualization
  const colHeader = key.join('  ');
  let gridHtml = `<span style="color:var(--accent)">Key: ${colHeader}</span><br>`;
  for (const row of grid) {
    gridHtml += row.map(c => `<span style="color:var(--text-muted);margin-right:6px">${c}</span>`).join(' ') + '<br>';
  }
  document.getElementById('transposition-grid').innerHTML = gridHtml;
  document.getElementById('transposition-grid-area').style.display = 'block';

  // Read columns in key order (column labeled 1 first, then 2, etc.)
  let result = '';
  for (let i = 1; i <= numCols; i++) {
    const col = key.indexOf(i);
    for (let r = 0; r < numRows; r++) {
      if (grid[r][col] !== ' ') result += grid[r][col];
    }
  }
  return result;
}

/**
 * Decrypt using Row Transposition.
 * @param {string}   text
 * @param {number[]} key
 * @returns {string}
 */
function rowTranspositionDecrypt(text, key) {
  const numCols = key.length;
  const numRows = Math.ceil(text.length / numCols);
  const grid    = Array(numRows).fill(null).map(() => Array(numCols).fill(' '));

  // Determine exact length of each column (last row may be incomplete)
  const colLengths = Array(numCols).fill(0);
  for (let i = 0; i < numCols; i++) {
    colLengths[i] = Math.floor(text.length / numCols) + (i < text.length % numCols ? 1 : 0);
  }

  // Re-fill columns in key order
  let idx = 0;
  for (let i = 1; i <= numCols; i++) {
    const col = key.indexOf(i);
    for (let r = 0; r < colLengths[col] && idx < text.length; r++) {
      grid[r][col] = text[idx++];
    }
  }

  // Read grid row by row
  return grid.map(r => r.filter(c => c !== ' ').join('')).join('');
}

/** Encrypt handler */
function transpositionEncrypt() {
  clearError('transposition');
  const text = document.getElementById('transposition-text').value.trim();
  const key  = document.getElementById('transposition-key').value.split(',').map(Number);
  if (!text)               { showError('transposition', 'Enter a message.'); return; }
  if (!isValidTransKey(key)) { showError('transposition', 'Key must be consecutive numbers from 1 to N, e.g. 3,1,4,2'); return; }
  setResult('transposition-result', rowTranspositionEncrypt(text, key));
}

/** Decrypt handler */
function transpositionDecrypt() {
  clearError('transposition');
  const text = document.getElementById('transposition-text').value.trim();
  const key  = document.getElementById('transposition-key').value.split(',').map(Number);
  if (!text)               { showError('transposition', 'Enter a message.'); return; }
  if (!isValidTransKey(key)) { showError('transposition', 'Key must be consecutive numbers from 1 to N, e.g. 3,1,4,2'); return; }
  document.getElementById('transposition-grid-area').style.display = 'none';
  setResult('transposition-result', rowTranspositionDecrypt(text, key));
}
