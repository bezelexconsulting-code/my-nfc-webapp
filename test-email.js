import { sendPasswordResetEmail } from './lib/email.js';

async function testEmail() {
  try {
    const testEmail = 'your-email@example.com'; // Replace with your actual email
    const testResetLink = 'https://tags.vinditscandit.co.za/client/reset-password?token=test-token-12345';
    
    console.log('Testing email with link:', testResetLink);
    
    const result = await sendPasswordResetEmail(testEmail, testResetLink);
    
    if (result.success) {
      console.log('✅ Email sent successfully! Message ID:', result.messageId);
      console.log('Check your email for the reset button/link');
    } else {
      console.log('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEmail();