import { auth } from '@/lib/firebase';

/**
 * Service pour envoyer des emails via Google Mail API (Gmail)
 * Uses Vercel Serverless Function instead of Firebase Callable Function
 * to avoid Cloud Build infrastructure issues
 */
export class GoogleMailService {
  /**
   * Envoyer un email via Google Mail API
   *
   * @param clubId - ID du club
   * @param to - Adresse email du destinataire
   * @param subject - Sujet de l'email
   * @param htmlBody - Corps de l'email en HTML
   * @param textBody - Corps de l'email en texte brut (fallback)
   * @returns Promise avec le résultat de l'envoi
   */
  static async sendEmail(
    clubId: string,
    to: string,
    subject: string,
    htmlBody: string,
    textBody?: string
  ): Promise<{ success: boolean; messageId: string; message: string }> {
    try {
      // Get Firebase ID token for authentication
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to send emails');
      }

      const authToken = await user.getIdToken();

      // Call Vercel Serverless Function
      const response = await fetch('/api/send-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubId,
          to,
          subject,
          htmlBody,
          textBody: textBody || htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML tags as fallback
          authToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const data = await response.json();

      console.log('✅ Email envoyé avec succès:', data.messageId);
      return data;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);

      // Re-throw with more context
      throw new Error(
        error.message || 'Erreur lors de l\'envoi de l\'email'
      );
    }
  }

  /**
   * Envoyer un email de test pour vérifier la configuration
   *
   * @param clubId - ID du club
   * @param toEmail - Adresse email du destinataire (généralement l'admin)
   * @returns Promise avec le résultat de l'envoi
   */
  static async sendTestEmail(
    clubId: string,
    toEmail: string
  ): Promise<{ success: boolean; messageId: string; message: string }> {
    const subject = '🧪 Email de test - CalyCompta';
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #3b82f6;
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .success-badge {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 4px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Configuration Google Mail réussie !</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>

            <div class="success-badge">✅ Test réussi</div>

            <p>Votre configuration Google Mail API est correctement configurée et fonctionnelle.</p>

            <p><strong>Détails de la configuration :</strong></p>
            <ul>
              <li>✅ Authentification OAuth2 réussie</li>
              <li>✅ Connexion à Gmail API établie</li>
              <li>✅ Envoi d'emails activé</li>
            </ul>

            <p>Vous pouvez maintenant utiliser Google Mail pour envoyer des emails automatisés depuis CalyCompta.</p>

            <p>Pour configurer des envois planifiés, rendez-vous dans <strong>Paramètres → Communication</strong>.</p>

            <div class="footer">
              <p>Cet email a été envoyé automatiquement par CalyCompta via Google Mail API</p>
              <p>Club ID: ${clubId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(clubId, toEmail, subject, htmlBody);
  }
}
