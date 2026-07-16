# CryptoLab: Interactive Cryptography Toolkit

A browser-based cryptography toolkit built for a Computer Security course, implementing seven classical and modern ciphers with live encryption/decryption, key generation, and step-by-step algorithm visualization. Built entirely in vanilla JavaScript with no external libraries.

**Live demo:** https://abdelrhman-ahmed-xd.github.io/CryptoLab/

## Implemented Ciphers

### Classical
- **Caesar Cipher** — modular shift substitution: `E(x) = (x + k) mod 26`
- **Monoalphabetic Substitution** — custom 26-letter key mapping
- **Playfair Cipher** — 5x5 digraph substitution matrix with row, column, and rectangle rules

### Transposition
- **Row Transposition Cipher** — includes a visual grid representation of the encryption process

### Stream / Block
- **RC4** — stream cipher with a full KSA (Key Scheduling Algorithm) and PRGA (Pseudo-Random Generation Algorithm) implementation
- **Simplified DES (S-DES)** — 8-bit block cipher with Feistel network rounds, sub-key generation (P10/P8, circular shifts), and S-Box substitution

### Asymmetric
- **RSA** — full public-key cryptosystem using BigInt for arbitrary-precision arithmetic, including primality testing, modular inverse via the Extended Euclidean Algorithm, and fast modular exponentiation

## Features
- Real-time, step-by-step trace of each algorithm's internal computation (e.g. RSA key generation steps, S-DES sub-key derivation, the Playfair key matrix)
- Input validation with clear error messaging for each cipher
- Clean, custom-built dark-mode UI with tabbed navigation across cipher categories

## Tech Stack
HTML, CSS, JavaScript (no frameworks or external libraries)

## Getting Started

Just open `index.html` in a browser, or visit the [live demo](https://abdelrhman-ahmed-xd.github.io/CryptoLab/).

## Project Structure

```
├── index.html
├── css/
│   ├── base.css
│   ├── components.css
│   └── layout.css
└── js/
    ├── ui.js
    ├── caesar.js
    ├── monoalphabetic.js
    ├── playfair.js
    ├── transposition.js
    ├── rc4.js
    ├── sdes.js
    └── rsa.js
```
