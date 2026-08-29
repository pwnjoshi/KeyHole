import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

/**
 * Interactive Gmail OAuth Helper Script
 * Prompts user to open the Google consent URL, listens on localhost:4000/api/auth/google/callback,
 * and saves the resulting token to gateway/config/gmail-token.json
 */
async function authenticateGmail() {
  console.log('===============================================================');
  console.log('  KEYHOLE: Gmail OAuth 2.0 Token Authenticator');
  console.log('===============================================================\n');

  const configDir = path.resolve(process.cwd(), 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const credentialsPath = path.join(configDir, 'credentials.json');
  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback';

  if (fs.existsSync(credentialsPath)) {
    const raw = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const installed = raw.installed || raw.web || raw;
    clientId = installed.client_id;
    clientSecret = installed.client_secret;
    redirectUri = installed.redirect_uris ? installed.redirect_uris[0] : redirectUri;
  }

  if (!clientId || !clientSecret) {
    console.log('[!] Google Client ID and Secret not detected.');
    console.log('    Place your Google Cloud credentials.json in gateway/config/credentials.json');
    console.log('    OR set environment variables: GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET');
    console.log('\n[INFO] Running in realistic simulation mode for demo & testing.');
    return;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent'
  });

  console.log('1. Open this URL in your browser to authorize Keyhole read-only access:');
  console.log(`\n   ${authUrl}\n`);
  console.log('2. Waiting for OAuth redirect on http://localhost:4000/api/auth/google/callback ...');

  const server = http.createServer(async (req, res) => {
    if (req.url && req.url.startsWith('/api/auth/google/callback')) {
      const parsedUrl = url.parse(req.url, true);
      const code = parsedUrl.query.code as string;
      if (code) {
        try {
          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          const tokenPath = path.join(configDir, 'gmail-token.json');
          fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2), 'utf8');

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding-top: 50px;">
                <h2 style="color: #10b981;">Gmail Connected Successfully!</h2>
                <p>Tokens saved to <code>gateway/config/gmail-token.json</code></p>
                <p>You can close this tab and return to the terminal.</p>
              </body>
            </html>
          `);
          console.log('\n[SUCCESS] OAuth token acquired and saved to gateway/config/gmail-token.json!');
          server.close();
          process.exit(0);
        } catch (e: any) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Error retrieving access token: ${e.message}`);
          console.error('[ERROR] Failed to exchange code:', e.message);
        }
      }
    }
  });

  server.listen(4000);
}

authenticateGmail().catch(console.error);
