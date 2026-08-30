export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private resendApiKey: string | null = null;
  private fromEmail: string = 'Keyhole Security <onboarding@resend.dev>';

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY || null;
    if (process.env.RESEND_FROM_EMAIL) {
      this.fromEmail = process.env.RESEND_FROM_EMAIL;
    }
  }

  public isConfigured(): boolean {
    return !!this.resendApiKey && this.resendApiKey.startsWith('re_');
  }

  /**
   * Dispatches an email via Resend REST API or simulates in development
   */
  public async sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    console.log(`[EmailService] Dispatching email to: ${opts.to} | Subject: ${opts.subject}`);

    if (!this.resendApiKey) {
      console.log(`[EmailService Notice] RESEND_API_KEY is not set. Simulating instant email delivery for: ${opts.subject}`);
      return {
        success: true,
        id: 'sim_' + Date.now().toString(36)
      };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.resendApiKey}`
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [opts.to],
          subject: opts.subject,
          html: opts.html
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn('[Resend API Error]:', data);
        return { success: false, error: data.message || 'Failed to send email via Resend' };
      }

      return { success: true, id: data.id };
    } catch (err: any) {
      console.error('[EmailService Exception]:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Generates a professionally branded HTML email for 6-digit OTP verification
   */
  public getVerificationEmailHtml(name: string, otp: string): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc; max-width: 540px; margin: 0 auto; border-radius: 20px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 12px; background: rgba(79, 70, 229, 0.2); border: 1px solid rgba(79, 70, 229, 0.4); border-radius: 20px; font-size: 11px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">Midnight ZKIR Enterprise Shield</span>
          <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 12px 0 5px 0;">Verify Your Enterprise Account</h1>
          <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">Hello <strong>${name}</strong>, use the verification code below to complete your Keyhole account activation.</p>
        </div>
        <div style="background: #0e1422; border: 2px solid #4f46e5; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 1px;">One-Time Authentication Code (OTP)</div>
          <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #818cf8; margin: 0px;">${otp}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Valid for 10 minutes &times; Single-use only</div>
        </div>
        <div style="background: rgba(244, 63, 94, 0.1); border-left: 3px solid #f43f5e; padding: 10px 14px; border-radius: 8px; font-size: 11px; color: #fda4af; margin-top: 20px;">
          <strong>Security Notice:</strong> Never share this code with anyone. Keyhole engineers will never ask for your verification code.
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
          Keyhole Gateway &middot; Zero-Knowledge Privacy Perimeter<br>
          Automated Security Email Delivery
        </div>
      </div>`;
  }

  /**
   * Generates a professionally branded HTML email for Password Reset OTP
   */
  public getPasswordResetEmailHtml(email: string, otp: string): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc; max-width: 540px; margin: 0 auto; border-radius: 20px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 12px; background: rgba(236, 72, 153, 0.2); border: 1px solid rgba(236, 72, 153, 0.4); border-radius: 20px; font-size: 11px; font-weight: 700; color: #fccfe8; text-transform: uppercase; letter-spacing: 1px;">Password Recovery</span>
          <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 12px 0 5px 0;">Reset Your Password</h1>
          <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">An account password reset was requested for <strong>${email}</strong>. Use the 6-digit code below to reset your credentials.</p>
        </div>
        <div style="background: #0e1422; border: 2px solid #ec4899; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 1px;">Password Reset Code (OTP)</div>
          <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #f472b6; margin: 0px;">${otp}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Expires in 10 minutes &times; Single-use only</div>
        </div>
        <div style="background: rgba(244, 63, 94, 0.1); border-left: 3px solid #f43f5e; padding: 10px 14px; border-radius: 8px; font-size: 11px; color: #fda4af; margin-top: 20px;">
          <strong>Did not request this?</strong> If you did not request a password reset, please ignore this email or notify your supervisor.
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
          Keyhole Gateway &middot; Cryptographic Zero-Trust Perimeter<br>
          Automated Security Email Delivery
        </div>
      </div>`;
  }
}

export const emailService = new EmailService();
