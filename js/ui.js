// /* ============================================================
//    ui.js — Navigation, DOM helpers, shared utilities
//    ============================================================ */

/**
 * Show a named panel and activate the corresponding nav tab.
 * @param {string} name - Panel name: 'home' | 'classical' | 'transposition' | 'modern' | 'asymmetric'
 */
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  document.getElementById('panel-' + name).classList.add('active');

  const tabKeywords = {
    home:          'home',
    classical:     'class',
    transposition: 'trans',
    modern:        'mod',
    asymmetric:    'rsa',
  };

  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.textContent.toLowerCase().includes(tabKeywords[name])) {
      t.classList.add('active');
    }
  });
}

/**
 * Copy the text content of a result element to the clipboard.
 * @param {string} id - The element id to copy from
 */
function copyResult(id) {
  const el = document.getElementById(id);
  if (el && el.textContent.trim()) {
    navigator.clipboard.writeText(el.textContent.trim()).catch(() => {});
  }
}

/**
 * Display an error message for a given cipher prefix.
 * @param {string} prefix - Cipher prefix (e.g. 'caesar', 'mono')
 * @param {string} msg    - Error message to display
 */
function showError(prefix, msg) {
  const el = document.getElementById(prefix + '-err');
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

/**
 * Clear the error message for a given cipher prefix.
 * @param {string} prefix - Cipher prefix
 */
function clearError(prefix) {
  const el = document.getElementById(prefix + '-err');
  if (el) { el.textContent = ''; el.classList.remove('show'); }
}

/**
 * Set the result text for a given result element.
 * @param {string}  id      - Element id
 * @param {string}  val     - Result value
 * @param {boolean} isError - If true, apply error styling
 */
function setResult(id, val, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = val;
  el.className = 'result-text' + (isError ? ' error' : '');
}

/**
 * Clear inputs and result for a cipher card.
 * @param {string} prefix - Cipher prefix
 */
function clearCipher(prefix) {
  clearError(prefix);
  ['text', 'key', 'key2', 'rounds'].forEach(suffix => {
    const el = document.getElementById(prefix + '-' + suffix);
    if (el) el.value = '';
  });
  setResult(prefix + '-result', '');

  // Hide optional display areas
  ['matrix-area', 'grid-area', 'steps-area'].forEach(area => {
    const el = document.getElementById(prefix + '-' + area);
    if (el) el.style.display = 'none';
  });
}
