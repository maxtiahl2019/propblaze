/**
 * Notification utilities for PropBlaze
 * Send emails and Telegram notifications
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendTelegramParams {
  message: string;
  chatId?: string;
}

interface NotificationResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Send email via Resend API
 */
export async function sendEmail(params: SendEmailParams): Promise<NotificationResult> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Email send failed:', data);
      return { success: false, error: data.error || 'Failed to send email', data };
    }

    console.log('✅ Email sent:', data.message_id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send Telegram message via Bot API
 */
export async function sendTelegram(params: SendTelegramParams): Promise<NotificationResult> {
  try {
    const response = await fetch('/api/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Telegram send failed:', data);
      return { success: false, error: data.error || 'Failed to send telegram', data };
    }

    console.log('✅ Telegram sent:', data.message_id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Telegram API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send telegram',
    };
  }
}

/**
 * Send offer approval notification to owner
 */
export async function notifyOwnerOfferApproved(params: {
  ownerEmail: string;
  propertyTitle: string;
  propertyId: string;
  agenciesCount: number;
  wave1Count: number;
  topAgency?: { agency_name: string; total_score: number };
}): Promise<NotificationResult[]> {
  const { ownerEmail, propertyTitle, propertyId, agenciesCount, wave1Count, topAgency } = params;

  const results: NotificationResult[] = [];

  // Send email
  const emailResult = await sendEmail({
    to: ownerEmail,
    subject: `✅ Your ${propertyTitle} is now being marketed to ${wave1Count} agencies`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">🔥 PropBlaze - Distribution Started</h1>
          </div>

          <p>Hi there,</p>

          <p>Your property "<strong>${propertyTitle}</strong>" has been <strong>approved and confirmed</strong>.</p>

          <h2 style="color: #dc2626;">Distribution in Progress</h2>
          <p>Your property is being distributed to <strong>${wave1Count} agencies</strong> in Wave 1 (today):</p>

          ${topAgency ? `
            <div style="background: #f0f9ff; border-left: 4px solid #dc2626; padding: 12px; margin: 12px 0; border-radius: 4px;">
              <strong>🎯 Top Match:</strong> ${topAgency.agency_name}<br/>
              <strong>Match Score:</strong> ${(topAgency.total_score * 100).toFixed(0)}%
            </div>
          ` : ''}

          <h2 style="color: #0f172a;">What Happens Next</h2>
          <ol>
            <li>Agencies review your property</li>
            <li>You receive viewing requests and inquiries</li>
            <li>Negotiate terms and close the deal</li>
            <li>If not sold in 30 days, Wave 2 goes out automatically (more agencies)</li>
          </ol>

          <h2 style="color: #0f172a;">Track Progress</h2>
          <p>
            <a href="https://propblaze.com/dashboard/properties/${propertyId}"
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Open Dashboard →
            </a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px;">
            Questions? Reply to this email or contact support@propblaze.com<br/>
            This is an automated message, please do not reply with sensitive information.
          </p>

          <p style="color: #dc2626; font-weight: bold; margin-top: 20px;">
            Good luck with your sale! 🔥<br/>
            <em>PropBlaze Team</em>
          </p>
        </body>
      </html>
    `,
  });

  results.push(emailResult);

  // Send Telegram (non-blocking)
  const telegramResult = await sendTelegram({
    message: `🚀 <b>Distribution Started</b>\n\n` +
      `Property: ${propertyTitle}\n` +
      `Wave 1: <b>${wave1Count} agencies</b>\n` +
      `Total matched: ${agenciesCount}\n\n` +
      (topAgency ? `🎯 Top: ${topAgency.agency_name} (${(topAgency.total_score * 100).toFixed(0)}%)\n\n` : '') +
      `<a href="https://propblaze.com/dashboard/properties/${propertyId}">View Dashboard →</a>`,
  });

  results.push(telegramResult);

  return results;
}

/**
 * Send distribution started notification (admin alert)
 */
export async function notifyAdminDistributionStarted(params: {
  propertyTitle: string;
  ownerEmail: string;
  agenciesCount: number;
  wave1Count: number;
}): Promise<NotificationResult> {
  const { propertyTitle, ownerEmail, agenciesCount, wave1Count } = params;

  return sendTelegram({
    message: `📧 <b>New Distribution</b>\n\n` +
      `Property: ${propertyTitle}\n` +
      `Owner: ${ownerEmail}\n` +
      `Wave 1: ${wave1Count} / ${agenciesCount} agencies\n\n` +
      `Status: ✅ Active`,
  });
}

/**
 * Send error notification
 */
export async function notifyError(params: {
  title: string;
  message: string;
  context?: string;
}): Promise<NotificationResult> {
  const { title, message, context } = params;

  return sendTelegram({
    message: `⚠️ <b>${title}</b>\n\n` +
      `${message}\n\n` +
      (context ? `<code>${context}</code>` : ''),
  });
}
