// Vercel API handler for sending Gmail emails
import { google } from 'googleapis';

// Initialize Gmail API
async function getGmailClient(accessToken) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken, to, subject, html } = req.body;

    if (!accessToken || !to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create email message
    const message = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      html
    ].join('\n');

    // Encode message in base64url
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    const gmail = await getGmailClient(accessToken);
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('✅ Email sent successfully:', result.data.id);

    return res.status(200).json({
      success: true,
      messageId: result.data.id,
      message: 'Email envoyé avec succès',
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi de l\'email',
    });
  }
}
