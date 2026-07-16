// /* ============================================================
//    rsa.js — RSA Public-Key Cipher
//    Key gen: n = p·q, φ(n) = (p-1)(q-1), d = e⁻¹ mod φ(n)
//    Encrypt: C = M^e mod n  |  Decrypt: M = C^d mod n
//    Uses BigInt for arbitrary-precision arithmetic.
//    ============================================================ */

/** Shared RSA key state — populated after key generation. */
let rsaState = { n: null, e: null, d: null, phi: null, p: null, q: null };

// ---- Math Helpers -----------------------------------------------

/**
 * Primality test (trial division, BigInt).
 * @param {BigInt} n
 * @returns {boolean}
 */
function isPrime(n) {
  if (n < 2n) return false;
  if (n < 4n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;
  for (let i = 5n; i * i <= n; i += 6n) {
    if (n % i === 0n || n % (i + 2n) === 0n) return false;
  }
  return true;
}

/**
 * Greatest common divisor (BigInt).
 * @param {BigInt} a
 * @param {BigInt} b
 * @returns {BigInt}
 */
function gcd(a, b) {
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

/**
 * Modular inverse via Extended Euclidean Algorithm (BigInt).
 * Returns null if no inverse exists.
 * @param {BigInt} e
 * @param {BigInt} phi
 * @returns {BigInt|null}
 */
function modInverse(e, phi) {
  let [old_r, r]   = [e, phi];
  let [old_s, s]   = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1n) return null;
  return ((old_s % phi) + phi) % phi;
}

/**
 * Fast modular exponentiation — square-and-multiply (BigInt).
 * @param {BigInt} base
 * @param {BigInt} exp
 * @param {BigInt} mod
 * @returns {BigInt}
 */
function modPow(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = result * base % mod;
    exp  = exp / 2n;
    base = base * base % mod;
  }
  return result;
}

// ---- UI Handlers -----------------------------------------------

/**
 * Generate RSA key pair from user-supplied p, q, e.
 * Validates primality, computes n, φ(n), d, and displays results.
 */
function rsaGenerateKeys() {
  clearError('rsa-gen');
  clearError('rsa');

  const pVal = document.getElementById('rsa-p').value.trim();
  const qVal = document.getElementById('rsa-q').value.trim();
  const eVal = document.getElementById('rsa-e').value.trim();

  if (!pVal || !qVal || !eVal) { showError('rsa-gen', 'Fill in p, q, and e.'); return; }

  const p = BigInt(pVal), q = BigInt(qVal), e = BigInt(eVal);

  if (!isPrime(p)) { showError('rsa-gen', `p = ${p} is not prime.`); return; }
  if (!isPrime(q)) { showError('rsa-gen', `q = ${q} is not prime.`); return; }
  if (p === q)     { showError('rsa-gen', 'p and q must be different primes.'); return; }

  const n   = p * q;
  const phi = (p - 1n) * (q - 1n);

  if (e <= 1n || e >= phi) { showError('rsa-gen', `e must satisfy 1 < e < φ(n) = ${phi}.`); return; }
  if (gcd(e, phi) !== 1n)  { showError('rsa-gen', `gcd(e, φ(n)) = ${gcd(e, phi)} ≠ 1. Choose a different e.`); return; }

  const d = modInverse(e, phi);
  if (d === null) { showError('rsa-gen', 'Could not compute modular inverse. Choose different values.'); return; }

  rsaState = { n, e, d, phi, p, q };

  // Display key pair
  document.getElementById('rsa-pub').textContent  = `e = ${e}, n = ${n}`;
  document.getElementById('rsa-priv').textContent = `d = ${d}, n = ${n}`;

  // Display key generation steps
  document.getElementById('rsa-keygen-steps').innerHTML = [
    `<div class="step-line"><span class="k">p, q:</span><span class="v">${p}, ${q}</span></div>`,
    `<div class="step-line"><span class="k">n = p·q:</span><span class="v">${n}</span></div>`,
    `<div class="step-line"><span class="k">φ(n) = (p-1)(q-1):</span><span class="v">${phi}</span></div>`,
    `<div class="step-line"><span class="k">e (chosen):</span><span class="v">${e}  [gcd(${e},${phi}) = 1 ✓]</span></div>`,
    `<div class="step-line"><span class="k">d = e⁻¹ mod φ(n):</span><span class="v">${d}  [${e}·${d} mod ${phi} = ${(e * d) % phi} ✓]</span></div>`,
  ].join('');

  document.getElementById('rsa-keys-area').style.display = 'block';
}

/**
 * Encrypt a numeric message M using the public key: C = M^e mod n.
 */
function rsaEncrypt() {
  clearError('rsa');
  if (!rsaState.n) { showError('rsa', 'Generate keys first (Step 1).'); return; }

  const mVal = document.getElementById('rsa-message').value.trim();
  if (!mVal) { showError('rsa', 'Enter a numeric message M.'); return; }

  const M = BigInt(mVal);
  if (M >= rsaState.n) { showError('rsa', `M must be less than n = ${rsaState.n}.`); return; }

  const C       = modPow(M, rsaState.e, rsaState.n);
  const stepsEl = document.getElementById('rsa-op-steps');

  setResult('rsa-result', String(C));
  stepsEl.innerHTML      = `<div class="step-line"><span class="k">C = M^e mod n:</span><span class="v">${M}^${rsaState.e} mod ${rsaState.n} = ${C}</span></div>`;
  stepsEl.style.display  = 'flex';
  stepsEl.style.flexDirection = 'column';
  stepsEl.style.gap      = '4px';
}

/**
 * Decrypt a numeric ciphertext C using the private key: M = C^d mod n.
 */
function rsaDecrypt() {
  clearError('rsa');
  if (!rsaState.n) { showError('rsa', 'Generate keys first (Step 1).'); return; }

  const cVal = document.getElementById('rsa-message').value.trim();
  if (!cVal) { showError('rsa', 'Enter the ciphertext C to decrypt.'); return; }

  const C       = BigInt(cVal);
  const M       = modPow(C, rsaState.d, rsaState.n);
  const stepsEl = document.getElementById('rsa-op-steps');

  setResult('rsa-result', String(M));
  stepsEl.innerHTML      = `<div class="step-line"><span class="k">M = C^d mod n:</span><span class="v">${C}^${rsaState.d} mod ${rsaState.n} = ${M}</span></div>`;
  stepsEl.style.display  = 'flex';
  stepsEl.style.flexDirection = 'column';
  stepsEl.style.gap      = '4px';
}

/** Reset RSA state and clear all inputs/outputs. */
function clearRSA() {
  rsaState = { n: null, e: null, d: null, phi: null, p: null, q: null };
  ['rsa-p', 'rsa-q', 'rsa-e', 'rsa-message'].forEach(id => {
    document.getElementById(id).value = '';
  });
  setResult('rsa-result', '');
  document.getElementById('rsa-keys-area').style.display  = 'none';
  document.getElementById('rsa-op-steps').style.display   = 'none';
  clearError('rsa-gen');
  clearError('rsa');
}
