import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
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
    console.log('Preparing password reset email', { to: email, resetLink });
    
    // Validate the resetLink
    if (!resetLink || !resetLink.startsWith('http')) {
      console.error('Invalid resetLink provided:', resetLink);
      throw new Error('Invalid reset link format - must be absolute URL starting with http');
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      // Plain-text fallback to ensure link is accessible in clients that strip HTML
      text: `You requested to reset your password. Use this link: ${resetLink}\n\nIf you did not request this, you can ignore this email. The link expires in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">You have requested to reset your password. Click the button below to reset your password:</p>

          <!-- Ultra bulletproof email button -->
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetLink}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="#007bff" fillcolor="#007bff">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial, sans-serif;font-size:16px;font-weight:bold;">Reset Password</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
            <tr>
              <td align="center" valign="middle" bgcolor="#007bff" style="background-color: #007bff; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 15px 30px; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">
                  Reset Password
                </a>
              </td>
            </tr>
          </table>
          <!--<![endif]-->

          <p style="font-size: 14px; color: #666; margin-top: 20px;">If you did not request this password reset, please ignore this email.</p>
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">This link will expire in 1 hour.</p>
          
          <!-- Fallback text link -->
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="font-size: 14px; margin: 0 0 10px 0;"><strong>Alternative link:</strong></p>
            <p style="margin: 0;">
              <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline; font-size: 14px;">
                Click here to reset your password
              </a>
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
          <p style="font-size: 12px; color: #666; margin-bottom: 5px;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; font-size: 12px; color: #007bff; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetLink}
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
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

