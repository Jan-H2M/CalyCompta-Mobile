import { aiProviderService } from './aiProviderService';
import type { EmailTemplateType, EmailTemplateVariable, EmailTemplateStyles } from '@/types/emailTemplates';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GenerateEmailHtmlOptions {
  userMessage: string;
  emailType: EmailTemplateType;
  variables: EmailTemplateVariable[];
  styles: EmailTemplateStyles;
  conversationHistory?: ChatMessage[];
}

export interface GenerateEmailMetadataResult {
  name: string;
  description: string;
  subject: string;
  html: string;
}

/**
 * Service pour générer des templates email HTML avec l'IA Claude
 */
export class EmailTemplateAiService {
  /**
   * Génère un template email complet (métadonnées + HTML) à partir d'une description
   */
  static async generateEmailWithMetadata(options: GenerateEmailHtmlOptions): Promise<GenerateEmailMetadataResult> {
    console.log('🔍 [EmailTemplateAiService] generateEmailWithMetadata called');

    const client = aiProviderService.getAnthropicClient();
    console.log('🔍 [EmailTemplateAiService] Anthropic client:', client ? '✅ Configured' : '❌ Not configured');

    if (!client) {
      console.error('❌ [EmailTemplateAiService] Anthropic client not available');
      throw new Error(
        'L\'API Claude n\'est pas configurée. ' +
        'Veuillez configurer votre clé API dans Paramètres → Intelligence Artificielle.'
      );
    }

    const prompt = this.buildPromptWithMetadata(options);
    console.log('📝 [EmailTemplateAiService] Prompt built, length:', prompt.length);

    try {
      console.log('🚀 [EmailTemplateAiService] Calling Claude API...');
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8192,
        messages: this.buildMessages(options.conversationHistory || [], options.userMessage, prompt),
      });
      console.log('✅ [EmailTemplateAiService] Claude API response received');

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Type de réponse inattendu de l\'API Claude');
      }

      // Parse la réponse JSON contenant métadonnées + HTML
      const responseText = content.text.trim();

      // Extraire le JSON (peut être dans des backticks markdown)
      let jsonText = responseText;
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const result = JSON.parse(jsonText) as GenerateEmailMetadataResult;
      return result;
    } catch (error: any) {
      console.error('Erreur lors de la génération du template:', error);

      if (error.status === 401) {
        throw new Error('Clé API Claude invalide. Veuillez vérifier votre configuration.');
      } else if (error.status === 429) {
        throw new Error('Limite de requêtes API atteinte. Veuillez réessayer dans quelques instants.');
      } else if (error instanceof SyntaxError) {
        throw new Error('Erreur de parsing de la réponse de l\'IA. Veuillez réessayer.');
      } else {
        throw new Error(`Erreur lors de la génération: ${error.message || 'Erreur inconnue'}`);
      }
    }
  }

  /**
   * Génère du HTML d'email à partir d'une description en langage naturel
   * (méthode conservée pour compatibilité)
   */
  static async generateEmailHtml(options: GenerateEmailHtmlOptions): Promise<string> {
    console.log('🔍 [EmailTemplateAiService] generateEmailHtml called');

    const client = aiProviderService.getAnthropicClient();
    console.log('🔍 [EmailTemplateAiService] Anthropic client:', client ? '✅ Configured' : '❌ Not configured');

    if (!client) {
      console.error('❌ [EmailTemplateAiService] Anthropic client not available');
      throw new Error(
        'L\'API Claude n\'est pas configurée. ' +
        'Veuillez configurer votre clé API dans Paramètres → Intelligence Artificielle.'
      );
    }

    const prompt = this.buildPrompt(options);
    console.log('📝 [EmailTemplateAiService] Prompt built, length:', prompt.length);

    try {
      console.log('🚀 [EmailTemplateAiService] Calling Claude API...');
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8192, // Augmenté pour permettre des templates plus longs
        messages: this.buildMessages(options.conversationHistory || [], options.userMessage, prompt),
      });
      console.log('✅ [EmailTemplateAiService] Claude API response received');

      // Extraire le contenu texte de la réponse
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Type de réponse inattendu de l\'API Claude');
      }

      // Extraire uniquement le HTML (sans les backticks markdown si présents)
      let htmlContent = content.text.trim();

      // Retirer les balises markdown de code si présentes
      if (htmlContent.startsWith('```html')) {
        htmlContent = htmlContent.replace(/^```html\n/, '').replace(/\n```$/, '');
      } else if (htmlContent.startsWith('```')) {
        htmlContent = htmlContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      return htmlContent;
    } catch (error: any) {
      console.error('Erreur lors de la génération du template:', error);

      if (error.status === 401) {
        throw new Error('Clé API Claude invalide. Veuillez vérifier votre configuration.');
      } else if (error.status === 429) {
        throw new Error('Limite de requêtes API atteinte. Veuillez réessayer dans quelques instants.');
      } else {
        throw new Error(`Erreur lors de la génération: ${error.message || 'Erreur inconnue'}`);
      }
    }
  }

  /**
   * Construit le prompt système pour Claude (avec métadonnées)
   */
  private static buildPromptWithMetadata(options: GenerateEmailHtmlOptions): string {
    const { emailType, variables, styles } = options;

    const variablesList = variables
      .map(v => `  - {{${v.name}}} : ${v.description}`)
      .join('\n');

    const emailTypeDescriptions: Partial<Record<EmailTemplateType, string>> = {
      pending_demands: 'Email de rappel pour des demandes de remboursement en attente de validation',
      accounting_codes: 'Email quotidien avec la liste des codes comptables du jour',
      events: 'Email concernant les événements du club (sorties, formations)',
      transactions: 'Email concernant les transactions bancaires',
      members: 'Email concernant les membres du club',
      custom: 'Email personnalisé',
    };

    return `Tu es un expert en création de templates email HTML professionnels pour CalyCompta, une application de gestion comptable pour clubs de plongée belges.

CONTEXTE:
Type d'email: ${emailTypeDescriptions[emailType] || emailType}

VARIABLES HANDLEBARS DISPONIBLES:
${variablesList}

STYLES À RESPECTER:
- Couleur primaire: ${styles.primaryColor}
- Couleur secondaire: ${styles.secondaryColor}
- Couleur des boutons: ${styles.buttonColor}
- Couleur du texte des boutons: ${styles.buttonTextColor}
- Dégradé header: ${styles.headerGradient}
- Police de caractères: ${styles.fontFamily}

EXIGENCES TECHNIQUES:
1. HTML valide et bien formé (DOCTYPE, html, head, body)
2. Styles INLINE uniquement (pas de CSS externe ou <style> tags)
3. Responsive design (max-width: 800px, adaptable mobile)
4. Compatibilité avec tous les clients email (Gmail, Outlook, Apple Mail)
5. Utiliser les variables Handlebars avec la syntaxe {{variableName}}
6. Pour les boucles: {{#each items}} ... {{/each}}
7. Pour les conditions: {{#if condition}} ... {{/if}}
8. Structure professionnelle et épurée (pas de clipart, pas d'emojis excessifs)

STRUCTURE RECOMMANDÉE:
- Header avec dégradé de couleur et titre principal
- Corps avec contenu principal (texte, tableaux si nécessaire)
- Bouton d'action (CTA) si pertinent
- Footer avec informations de contact et nom du club

FORMAT DE RÉPONSE REQUIS:
Réponds UNIQUEMENT avec un objet JSON contenant:
{
  "name": "Nom court et descriptif du template (ex: 'Rappel Demandes Détaillé')",
  "description": "Description courte de l'objectif du template (1-2 phrases)",
  "subject": "Sujet de l'email avec variables Handlebars si nécessaire (ex: '{{demandesCount}} demande(s) en attente')",
  "html": "Code HTML complet et valide du template"
}

IMPORTANT:
- Le JSON doit être valide (échapper les guillemets dans le HTML avec \\")
- Le HTML doit être complet (DOCTYPE, html, head, body)
- Utilise les couleurs fournies pour maintenir la cohérence visuelle
- Pas d'explications avant ou après le JSON`;
  }

  /**
   * Construit le prompt système pour Claude (HTML uniquement)
   */
  private static buildPrompt(options: GenerateEmailHtmlOptions): string {
    const { emailType, variables, styles } = options;

    const variablesList = variables
      .map(v => `  - {{${v.name}}} : ${v.description}`)
      .join('\n');

    const emailTypeDescriptions: Partial<Record<EmailTemplateType, string>> = {
      pending_demands: 'Email de rappel pour des demandes de remboursement en attente de validation',
      accounting_codes: 'Email quotidien avec la liste des codes comptables du jour',
      events: 'Email concernant les événements du club (sorties, formations)',
      transactions: 'Email concernant les transactions bancaires',
      members: 'Email concernant les membres du club',
      custom: 'Email personnalisé',
    };

    return `Tu es un expert en création de templates email HTML professionnels pour CalyCompta, une application de gestion comptable pour clubs de plongée belges.

CONTEXTE:
Type d'email: ${emailTypeDescriptions[emailType] || emailType}

VARIABLES HANDLEBARS DISPONIBLES:
${variablesList}

STYLES À RESPECTER:
- Couleur primaire: ${styles.primaryColor}
- Couleur secondaire: ${styles.secondaryColor}
- Couleur des boutons: ${styles.buttonColor}
- Couleur du texte des boutons: ${styles.buttonTextColor}
- Dégradé header: ${styles.headerGradient}
- Police de caractères: ${styles.fontFamily}

EXIGENCES TECHNIQUES:
1. HTML valide et bien formé (DOCTYPE, html, head, body)
2. Styles INLINE uniquement (pas de CSS externe ou <style> tags)
3. Responsive design (max-width: 800px, adaptable mobile)
4. Compatibilité avec tous les clients email (Gmail, Outlook, Apple Mail)
5. Utiliser les variables Handlebars avec la syntaxe {{variableName}}
6. Pour les boucles: {{#each items}} ... {{/each}}
7. Pour les conditions: {{#if condition}} ... {{/if}}
8. Structure professionnelle et épurée (pas de clipart, pas d'emojis excessifs)

STRUCTURE RECOMMANDÉE:
- Header avec dégradé de couleur et titre principal
- Corps avec contenu principal (texte, tableaux si nécessaire)
- Bouton d'action (CTA) si pertinent
- Footer avec informations de contact et nom du club

IMPORTANT:
- Retourne UNIQUEMENT le code HTML complet et valide
- Pas d'explications avant ou après le code
- Pas de commentaires dans le HTML sauf si absolument nécessaires
- Utilise les couleurs fournies pour maintenir la cohérence visuelle
`;
  }

  /**
   * Construit les messages de conversation pour l'API Claude
   */
  private static buildMessages(
    history: ChatMessage[],
    currentMessage: string,
    systemPrompt: string
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Premier message: inclure le prompt système
    if (history.length === 0) {
      messages.push({
        role: 'user',
        content: `${systemPrompt}\n\nDEMANDE DE L'UTILISATEUR:\n${currentMessage}`,
      });
    } else {
      // Ajouter l'historique de conversation
      history.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });

      // Ajouter le nouveau message
      messages.push({
        role: 'user',
        content: currentMessage,
      });
    }

    return messages;
  }

  /**
   * Valide le HTML généré
   */
  static validateHtml(html: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Vérifications basiques
    if (!html.includes('<!DOCTYPE html>') && !html.includes('<!doctype html>')) {
      errors.push('DOCTYPE manquant');
    }

    if (!html.includes('<html')) {
      errors.push('Balise <html> manquante');
    }

    if (!html.includes('<body')) {
      errors.push('Balise <body> manquante');
    }

    // Vérifier que les balises sont fermées (simple heuristique)
    const openTags = (html.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (html.match(/<\/[^>]*>/g) || []).length;
    const selfClosingTags = (html.match(/<[^>]*\/>/g) || []).length;

    // Note: cette validation est très basique, mais suffisante pour détecter les erreurs évidentes
    if (openTags - selfClosingTags !== closeTags) {
      errors.push('Balises HTML non équilibrées (possible balise non fermée)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Teste la connexion à l'API Claude
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = aiProviderService.getAnthropicClient();

    if (!client) {
      return {
        success: false,
        message: 'API Claude non configurée',
      };
    }

    try {
      await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: 'Réponds simplement "OK" si tu peux me lire.',
        }],
      });

      return {
        success: true,
        message: 'Connexion à Claude API réussie ✓',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erreur de connexion: ${error.message || 'Erreur inconnue'}`,
      };
    }
  }
}

export default EmailTemplateAiService;
