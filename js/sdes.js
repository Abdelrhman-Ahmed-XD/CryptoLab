// /* ============================================================
//    sdes.js — Simplified DES (S-DES)
//    8-bit block cipher with a 10-bit key.
//    Uses IP, IP⁻¹, two Feistel-like fK rounds, SW swap.
//    Sub-keys K1, K2 derived via P10 → LS-1 → P8 / LS-2 → P8.
//    ============================================================ */

const SDES = {
  // Permutation tables (1-indexed positions)
  IP:  [2, 6, 3, 1, 4, 8, 5, 7],   // Initial Permutation
  IPI: [4, 1, 3, 5, 7, 2, 8, 6],   // Inverse Initial Permutation
  EP:  [4, 1, 2, 3, 2, 3, 4, 1],   // Expansion / Permutation
  P4:  [2, 4, 3, 1],                // P4 permutation
  P8:  [6, 3, 7, 4, 8, 5, 10, 9],  // P8 — selects 8 of 10 key bits
  P10: [3, 5, 2, 7, 4, 10, 1, 9, 8, 6], // P10

  // S-Boxes
  S0: [[1, 0, 3, 2], [3, 2, 1, 0], [0, 2, 1, 3], [3, 1, 3, 2]],
  S1: [[0, 1, 2, 3], [2, 0, 1, 3], [3, 0, 1, 0], [2, 1, 0, 3]],

  /**
   * Apply a permutation table to a bits array.
   * @param {number[]} bits
   * @param {number[]} table
   * @returns {number[]}
   */
  perm(bits, table) {
    return table.map(i => bits[i - 1]);
  },

  /**
   * Circular left shift a bit array by n positions.
   * @param {number[]} bits
   * @param {number}   n
   * @returns {number[]}
   */
  leftShift(bits, n) {
    return [...bits.slice(n), ...bits.slice(0, n)];
  },

  /**
   * XOR two bit arrays element-wise.
   */
  xor(a, b) {
    return a.map((v, i) => v ^ b[i]);
  },

  /**
   * Generate sub-keys K1 and K2 from a 10-bit key.
   * @param {number[]} keyBits
   * @returns {{ k1, k2, k10, ls1, ls2 }}
   */
  generateKeys(keyBits) {
    const k10 = this.perm(keyBits, this.P10);
    const ls1 = [
      ...this.leftShift(k10.slice(0, 5), 1),
      ...this.leftShift(k10.slice(5), 1),
    ];
    const k1  = this.perm(ls1, this.P8);
    const ls2 = [
      ...this.leftShift(ls1.slice(0, 5), 2),
      ...this.leftShift(ls1.slice(5), 2),
    ];
    const k2  = this.perm(ls2, this.P8);
    return { k1, k2, k10, ls1, ls2 };
  },

  /**
   * S-Box lookup: outer bits select row, inner bits select column.
   * @param {number[]} bits - 4-bit array [b0,b1,b2,b3]
   * @param {number[][]} box
   * @returns {number[]} 2-bit output
   */
  sbox(bits, box) {
    const row = bits[0] * 2 + bits[3];
    const col = bits[1] * 2 + bits[2];
    const val = box[row][col];
    return [(val >> 1) & 1, val & 1];
  },

  /**
   * Feistel-like fK function.
   * @param {number[]} bits    - 8-bit input
   * @param {number[]} subkey  - 8-bit sub-key
   * @returns {number[]} 8-bit output
   */
  fk(bits, subkey) {
    const L  = bits.slice(0, 4);
    const R  = bits.slice(4);
    const ep = this.perm(R, this.EP);
    const x  = this.xor(ep, subkey);

    const s0out = this.sbox(x.slice(0, 4), this.S0);
    const s1out = this.sbox(x.slice(4),    this.S1);
    const p4    = this.perm([...s0out, ...s1out], this.P4);

    return [...this.xor(L, p4), ...R];
  },

  /**
   * Encrypt an 8-bit plaintext with a 10-bit key.
   * Flow: IP → fK(K1) → SW → fK(K2) → IP⁻¹
   */
  encrypt(plainBits, keyBits) {
    const { k1, k2 } = this.generateKeys(keyBits);
    const ip = this.perm(plainBits, this.IP);
    const r1 = this.fk(ip, k1);
    const sw = [...r1.slice(4), ...r1.slice(0, 4)]; // SW swap
    const r2 = this.fk(sw, k2);
    return this.perm(r2, this.IPI);
  },

  /**
   * Decrypt an 8-bit ciphertext with a 10-bit key.
   * Flow: IP → fK(K2) → SW → fK(K1) → IP⁻¹  (keys reversed)
   */
  decrypt(cipherBits, keyBits) {
    const { k1, k2 } = this.generateKeys(keyBits);
    const ip = this.perm(cipherBits, this.IP);
    const r1 = this.fk(ip, k2);
    const sw = [...r1.slice(4), ...r1.slice(0, 4)];
    const r2 = this.fk(sw, k1);
    return this.perm(r2, this.IPI);
  },
};

/**
 * Shared encrypt/decrypt runner — validates inputs, runs S-DES, shows step trace.
 * @param {boolean} encrypt
 */
function sdesRun(encrypt) {
  const prefix  = 'sdes';
  clearError(prefix);

  const textStr = document.getElementById('sdes-text').value.trim();
  const keyStr  = document.getElementById('sdes-key').value.trim();

  if (!/^[01]{8}$/.test(textStr))  { showError(prefix, 'Message must be exactly 8 binary digits (0s and 1s).'); return; }
  if (!/^[01]{10}$/.test(keyStr))  { showError(prefix, 'Key must be exactly 10 binary digits (0s and 1s).'); return; }

  const plainBits = textStr.split('').map(Number);
  const keyBits   = keyStr.split('').map(Number);
  const { k1, k2, k10, ls1, ls2 } = SDES.generateKeys(keyBits);
  const result    = encrypt ? SDES.encrypt(plainBits, keyBits) : SDES.decrypt(plainBits, keyBits);
  const resultStr = result.join('');

  setResult('sdes-result', resultStr);

  // Build and display step trace
  const ipOut  = SDES.perm(plainBits, SDES.IP);
  const fk1Out = SDES.fk(ipOut, encrypt ? k1 : k2);

  document.getElementById('sdes-steps').innerHTML = [
    `<div class="step-line"><span class="k">P10(key):</span><span class="v">${k10.join('')}</span></div>`,
    `<div class="step-line"><span class="k">LS-1 + P8 → K1:</span><span class="v">${k1.join('')}</span></div>`,
    `<div class="step-line"><span class="k">LS-2 + P8 → K2:</span><span class="v">${k2.join('')}</span></div>`,
    `<div class="step-line"><span class="k">IP(input):</span><span class="v">${ipOut.join('')}</span></div>`,
    `<div class="step-line"><span class="k">${encrypt ? 'fK(IP, K1)' : 'fK(IP, K2)'}:</span><span class="v">${fk1Out.join('')}</span></div>`,
    `<div class="step-line"><span class="k">Result:</span><span class="v" style="color:var(--accent3)">${resultStr}</span></div>`,
  ].join('');

  document.getElementById('sdes-steps-area').style.display = 'block';
}

/** Encrypt handler */
function sdesEncrypt() { sdesRun(true); }

/** Decrypt handler */
function sdesDecrypt() { sdesRun(false); }
