#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

console.log(`
===============================================================
  KEYHOLE: Automated Google Cloud Workspace Setup Assistant
===============================================================
This automated utility provisions your Google Cloud Project,
enables Gmail & Calendar APIs, and populates your .env file
with zero manual Web Console navigation.
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

async function run() {
  let hasGcloud = false;
  try {
    const version = execSync('gcloud --version', { stdio: 'pipe' }).toString();
    console.log('✔ Google Cloud SDK (gcloud CLI) detected on this machine.');
    hasGcloud = true;
  } catch {
    console.log('ℹ gcloud CLI not detected in system PATH. Switching to interactive direct setup.\n');
  }

  if (hasGcloud) {
    const shouldAutomate = await question('Do you want to auto-provision a new GCP project via gcloud? (y/N): ');
    if (shouldAutomate.toLowerCase() === 'y') {
      const defaultProj = `keyhole-${Math.random().toString(36).substring(2, 7)}`;
      const projId = (await question(`Enter GCP Project ID [default: ${defaultProj}]: `)) || defaultProj;

      console.log(`\n1. Creating GCP Project: ${projId}...`);
      try {
        execSync(`gcloud projects create ${projId} --set-as-default`, { stdio: 'inherit' });
      } catch (err) {
        console.log(`Note: Project might already exist. Continuing...`);
      }

      console.log('\n2. Enabling Gmail and Calendar APIs...');
      execSync(`gcloud services enable gmail.googleapis.com calendar-json.googleapis.com --project=${projId}`, { stdio: 'inherit' });
      console.log('✔ APIs enabled successfully.');

      console.log('\n3. Creating Enterprise Service Account...');
      const saName = 'keyhole-gateway-sa';
      try {
        execSync(`gcloud iam service-accounts create ${saName} --display-name="Keyhole Security Gateway" --project=${projId}`, { stdio: 'inherit' });
      } catch {}

      const configDir = path.resolve(process.cwd(), 'config');
      if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
      const saKeyPath = path.join(configDir, 'service-account.json');

      console.log(`\n4. Downloading Service Account Key to ${saKeyPath}...`);
      execSync(`gcloud iam service-accounts keys create ${saKeyPath} --iam-account=${saName}@${projId}.iam.gserviceaccount.com --project=${projId}`, { stdio: 'inherit' });

      console.log(`\n✔ Automated Setup Complete! Service Account JSON created at config/service-account.json`);
      rl.close();
      return;
    }
  }

  // Interactive Direct Setup (No gcloud required)
  console.log('--- Quick Direct Credential Configuration ---');
  const clientId = await question('Paste your OAuth 2.0 Client ID: ');
  const clientSecret = await question('Paste your OAuth 2.0 Client Secret: ');
  const redirectUri = (await question('Enter Redirect URI [default: http://localhost:4000/api/auth/google/callback]: ')) || 'http://localhost:4000/api/auth/google/callback';

  if (clientId && clientSecret) {
    const configDir = path.resolve(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    
    fs.writeFileSync(path.join(configDir, 'credentials.json'), JSON.stringify({
      installed: {
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        redirect_uris: [redirectUri.trim()]
      }
    }, null, 2), 'utf8');

    // Update .env if exists
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (!envContent.includes('GOOGLE_CLIENT_ID=')) {
      envContent += `\nGOOGLE_CLIENT_ID=${clientId.trim()}\nGOOGLE_CLIENT_SECRET=${clientSecret.trim()}\nGOOGLE_REDIRECT_URI=${redirectUri.trim()}\n`;
    } else {
      envContent = envContent
        .replace(/GOOGLE_CLIENT_ID=.*/g, `GOOGLE_CLIENT_ID=${clientId.trim()}`)
        .replace(/GOOGLE_CLIENT_SECRET=.*/g, `GOOGLE_CLIENT_SECRET=${clientSecret.trim()}`);
    }
    fs.writeFileSync(envPath, envContent, 'utf8');

    console.log('\n✔ Successfully saved credentials to .env and config/credentials.json!');
  } else {
    console.log('\nSetup aborted — no credentials provided.');
  }

  rl.close();
}

run().catch(err => {
  console.error('Setup failed:', err);
  rl.close();
});
