import fs from "fs";
import path from "path";
import readline from "readline";
import bcrypt from "bcryptjs";

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
    let password = process.argv[2];

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
