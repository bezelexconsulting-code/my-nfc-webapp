import { NextResponse } from 'next/server';

// Email preview endpoint - returns the exact HTML used in sendPasswordResetEmail
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sampleResetLink = searchParams.get('link') || 'https://tags.vinditscandit.co.za/client/reset-password?token=demo-token-123';
    
    // Validate the resetLink
    if (!sampleResetLink || !sampleResetLink.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid resetLink provided - must be absolute URL starting with http' },
        { status: 400 }
      );
    }

    // Generate the exact HTML that would be sent in the email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">You have requested to reset your password. Click the button below to reset your password:</p>

        <!-- Ultra bulletproof email button -->
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${sampleResetLink}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="#007bff" fillcolor="#007bff">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Arial, sans-serif;font-size:16px;font-weight:bold;">Reset Password</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
          <tr>
            <td align="center" valign="middle" bgcolor="#007bff" style="background-color: #007bff; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <a href="${sampleResetLink}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 15px 30px; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">
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
            <a href="${sampleResetLink}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline; font-size: 14px;">
              Click here to reset your password
            </a>
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
        <p style="font-size: 12px; color: #666; margin-bottom: 5px;">If the button above does not work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; font-size: 12px; color: #007bff; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
          ${sampleResetLink}
        </p>
      </div>
    `;

    return new NextResponse(emailHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}