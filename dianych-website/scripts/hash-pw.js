#!/usr/bin/env node
/*
 Standalone script to generate a bcrypt hash and write it to pw.txt
 Usage examples (PowerShell on Windows):
   node scripts/hash-pw.js "yourPasswordHere"
   # Or without argument, it will prompt:
   node scripts/hash-pw.js

 The script writes the hash to pw.txt at the project root (dianych-website/pw.txt)
 and also prints the hash to the console.
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bcrypt = require('bcryptjs');

const PW_FILE = path.join(process.cwd(), 'pw.txt');
const SALT_ROUNDS = 10; // Sufficient for small projects; increase for stronger hashing if needed.

function expandIfShort(pass) {
  if (!pass) return pass;
  return pass.length >= 32 ? pass : `${pass}.${pass}.${pass}`;
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

async function main() {
  // Prefer password from first arg; fall back to prompt
  const argPassword = process.argv[2];
  let password = argPassword;

  if (!password) {
    password = await prompt('Enter password to hash (visible input): ');
  }

  if (!password || password.trim() === '') {
    console.error('Error: Password is required.');
    process.exit(1);
  }

  // Apply the same expansion rule used at login so pw.txt aligns.
  const toHash = expandIfShort(password);

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(toHash, salt);

    // Ensure directory exists (project root should already exist)
    // Write hash to pw.txt with trailing newline
    fs.writeFileSync(PW_FILE, hash + '\n', { encoding: 'utf8' });

    console.log('Success! Bcrypt hash generated and written to:');
    console.log('  ' + PW_FILE);
    console.log('\nHash:');
    console.log(hash);

    console.log('\nNotes:');
    console.log('- Short passwords (<32 chars) are expanded as "{pass}.{pass}.{pass}" before hashing.');
    console.log('- Keep pw.txt private; it contains only the hash (not the plaintext).');
    console.log('- You can change the password anytime by re-running this script.');
  } catch (err) {
    console.error('Failed to generate or write hash:', err);
    process.exit(1);
  }
}

main();
