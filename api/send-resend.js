// Vercel API handler for sending emails via Resend
import { Resend } from 'resend';

/**
 * Resend email API endpoint
 *
 * Much simpler than Gmail OAuth!
 * - No complex OAuth flow
 * - Just an API key
 * - Better deliverability
 * - Excellent developer experience
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, subject, html } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      console.error('❌ Missing required fields:', {
        to: !!to,
        subject: !!subject,
        html: !!html
      });
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['to', 'subject', 'html']
      });
    }

    // Initialize Resend with API key from environment
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email
    const data = await resend.emails.send({
      from: from || 'Calypso Diving Club <onboarding@resend.dev>', // Use resend test domain or your verified domain
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully via Resend:', data.id);

    return res.status(200).json({
      success: true,
      messageId: data.id,
      message: 'Email envoyé avec succès via Resend',
    });
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
    });

    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi de l\'email',
    });
  }
}
