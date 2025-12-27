import dotenv from 'dotenv';
import pkg from 'nodemailer';
const { createTransport } = pkg;

dotenv.config();

const testEmail = async () => {
  console.log('🧪 Testing Email Configuration...\n');
  
  console.log('📧 Email Settings:');
  console.log(`   Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   Pass: ${process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET'}`);
  console.log('');

  try {
    // Create transporter
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('🔄 Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'VYBE'}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '✅ VYBE Email Test - Success!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #8B5CF6;
              margin: 0;
            }
            .info {
              background: #f8f4ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info p {
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Email Configuration Successful!</h1>
            </div>
            
            <p>Great news! Your VYBE email service is working perfectly.</p>
            
            <div class="info">
              <p><strong>🔧 Configuration Details:</strong></p>
              <p>Service: Gmail</p>
              <p>Email: ${process.env.EMAIL_USER}</p>
              <p>Time: ${new Date().toLocaleString()}</p>
            </div>
            
            <p><strong>✅ What's working:</strong></p>
            <ul>
              <li>SMTP connection verified</li>
              <li>Email sending operational</li>
              <li>Ready for OTP verification codes</li>
            </ul>
            
            <p>You can now use the email verification system for user login!</p>
            
            <div class="footer">
              <p>This is an automated test from VYBE Backend</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log('\n🎉 Email configuration is working perfectly!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   1. Email address is correct');
      console.error('   2. App Password is correct (no spaces)');
      console.error('   3. 2-Step Verification is enabled in Google Account');
      console.error('   4. "Less secure app access" is NOT needed for App Passwords');
    }
    
    process.exit(1);
  }
};

testEmail();
