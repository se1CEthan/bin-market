import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Email templates
const templates = {
  'email-verification': (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to BIN, ${data.name}!</h2>
      <p>Thank you for registering. Please verify your email address to activate your account.</p>
      <p style="margin: 30px 0;">
        <a href="${data.verificationUrl}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email Address
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${data.verificationUrl}</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `,
  
  'password-reset': (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hi ${data.name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p style="margin: 30px 0;">
        <a href="${data.resetUrl}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${data.resetUrl}</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `,
  
  'purchase-confirmation': (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Purchase Confirmed!</h2>
      <p>Hi ${data.name},</p>
      <p>Thank you for your purchase of <strong>${data.botTitle}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
        <p style="margin: 5px 0;"><strong>Amount:</strong> $${data.amount}</p>
        <p style="margin: 5px 0;"><strong>License Key:</strong> ${data.licenseKey}</p>
      </div>
      <p style="margin: 30px 0;">
        <a href="${data.downloadUrl}" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Download Now
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        You can download this bot up to ${data.maxDownloads} times. Your license key is required for activation.
      </p>
    </div>
  `,
  
  'payout-notification': (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payout Processed</h2>
      <p>Hi ${data.name},</p>
      <p>Your payout has been processed successfully!</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Amount:</strong> $${data.amount}</p>
        <p style="margin: 5px 0;"><strong>PayPal Email:</strong> ${data.paypalEmail}</p>
        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
      </div>
      <p style="color: #666; font-size: 14px;">
        The funds should appear in your PayPal account within 1-3 business days.
      </p>
    </div>
  `,
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  // Use environment variables for email configuration
  const emailConfig = process.env.EMAIL_SERVICE === 'gmail' ? {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  } : {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  transporter = nodemailer.createTransport(emailConfig);
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // In development, log emails instead of sending
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log('📧 Email (Development Mode):');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Template:', options.template);
      console.log('Data:', options.data);
      console.log('---');
      return;
    }

    const template = templates[options.template as keyof typeof templates];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const html = template(options.data);

    const mailOptions = {
      from: `"BIN Marketplace" <${process.env.EMAIL_USER || 'noreply@bin.com'}>`,
      to: options.to,
      subject: options.subject,
      html,
    };

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Don't throw error in production - log and continue
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
}

export async function sendPurchaseConfirmation(
  email: string,
  name: string,
  botTitle: string,
  orderId: string,
  amount: string,
  licenseKey: string,
  downloadUrl: string,
  maxDownloads: number = 5
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Purchase Confirmed - ${botTitle}`,
    template: 'purchase-confirmation',
    data: {
      name,
      botTitle,
      orderId,
      amount,
      licenseKey,
      downloadUrl,
      maxDownloads,
    },
  });
}

export async function sendPayoutNotification(
  email: string,
  name: string,
  amount: string,
  paypalEmail: string,
  transactionId: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Payout Processed',
    template: 'payout-notification',
    data: {
      name,
      amount,
      paypalEmail,
      transactionId,
    },
  });
}
