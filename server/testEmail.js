import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testEmail = async () => {
  console.log('🧪 Testing Resend Email Configuration...\n');
  console.log('📧 Email Settings:');
  console.log(`   Service: resend`);
  console.log(`   From: ${process.env.RESEND_FROM || 'not set'}`);
  console.log(`   API Key present: ${process.env.RESEND_API_KEY ? 'yes' : 'no'}`);
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing.');
    process.exit(1);
  }

  const from = process.env.RESEND_FROM || 'VYBE <no-reply@vybebd.store>';
  const to = process.env.TEST_EMAIL_TO || process.env.RESEND_FROM || 'test@example.com';

  try {
    console.log('📤 Sending test email via Resend...');
    const response = await axios.post('https://api.resend.com/emails', {
      from,
      to,
      subject: '✅ VYBE Email Test - Resend',
      html: `<h1>Resend Email Test</h1><p>Time: ${new Date().toISOString()}</p>`
    }, {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    });

    console.log('✅ Test email sent successfully!');
    console.log(response.data);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
};

testEmail();
