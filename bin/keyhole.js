#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0] || 'help';

if (command === 'setup-google' || command === 'setup:google') {
  await import('../scripts/setup-google.js');
} else {
  console.log(`
Keyhole CLI - Zero-Knowledge AI Policy Gateway

Usage:
  npx keyhole setup-google     Automated Google Cloud Workspace setup (gcloud / direct)
  npx keyhole --help           Show help
`);
}
