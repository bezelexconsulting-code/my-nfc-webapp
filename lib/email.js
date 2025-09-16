import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// Send password reset email
export async function sendPasswordResetEmail(email, resetLink) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: email,
      subject: 'Password Reset Request - NFC Webapp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Hello,</p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password for your NFC Webapp account. 
            If you made this request, please click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, you can copy and paste this link into your browser:
            <br>
            <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            If you didn't request a password reset, please ignore this email. 
            Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent from NFC Webapp. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        Password Reset Request
        
        Hello,
        
        We received a request to reset your password for your NFC Webapp account.
        If you made this request, please visit the following link to reset your password:
        
        ${resetLink}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request a password reset, please ignore this email.
        Your password will remain unchanged.
        
        ---
        This email was sent from NFC Webapp.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return { success: true };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, error: error.message };
  }
}