import nodemailer from 'nodemailer';
import crypto from 'crypto';
import User from '../models/User.js';

/**
 * Generate a secure 6-digit verification code
 */
export const generateVerificationCode = () => {
  // Generate a cryptographically secure random number
  const buffer = crypto.randomBytes(3);
  const code = parseInt(buffer.toString('hex'), 16) % 1000000;
  // Pad with zeros if necessary to ensure 6 digits
  return code.toString().padStart(6, '0');
};

/**
 * Create Nodemailer transporter
 * Supports Gmail, SendGrid, or custom SMTP
 */
export const createTransporter = () => {
  // Check if using Gmail
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password for Gmail
      }
    });
  }
  
  // Check if using SendGrid
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Default: Custom SMTP
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send verification code email to user
 * @param {string} userId - MongoDB User ID
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
export const sendVerificationEmail = async (userId, email, name, preGeneratedCode = null, preGeneratedExpires = null) => {
  try {
    // Generate or reuse pre-generated code
    const verificationCode = preGeneratedCode || generateVerificationCode();
    const codeExpires = preGeneratedExpires || new Date(Date.now() + 5 * 60 * 1000);

    // Only update DB if we generated the code here
    if (!preGeneratedCode) {
      await User.findByIdAndUpdate(userId, {
        verificationCode,
        codeExpires
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'VYBE'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your VYBE Login Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .code-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              text-align: center;
              padding: 20px;
              margin: 30px 0;
              border-radius: 8px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning strong {
              color: #856404;
            }
            .info {
              background: #e7f3ff;
              border-left: 4px solid #2196F3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #6c757d;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎨 VYBE</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Visualize Your Best Essence</p>
            </div>
            
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Hello, ${name}! 👋</h2>
              <p style="font-size: 16px;">You're one step away from accessing your VYBE account.</p>
              
              <p style="font-size: 16px;">Your verification code is:</p>
              
              <div class="code-box">
                ${verificationCode}
              </div>
              
              <div class="warning">
                <strong>⏰ Important:</strong> This code will expire in <strong>5 minutes</strong>. Please enter it soon!
              </div>
              
              <div class="info">
                <strong>🔒 Security Tips:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Never share this code with anyone</li>
                  <li>VYBE staff will never ask for this code</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                Having trouble? Contact us at support@vybe.com
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} VYBE. All rights reserved.</p>
              <p style="margin: 5px 0;">This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${name},

Your VYBE login verification code is: ${verificationCode}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

Security Tips:
- Never share this code with anyone
- VYBE staff will never ask for this code

© ${new Date().getFullYear()} VYBE
      `.trim()
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Verification email sent to ${email} (Message ID: ${info.messageId})`);
    
    return {
      success: true,
      messageId: info.messageId,
      expiresAt: codeExpires
    };

  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Verify the code entered by user
 * @param {string} email - User's email
 * @param {string} code - 6-digit code entered by user
 */
export const verifyCode = async (email, code) => {
  try {
    // Find user with verification code
    const user = await User.findOne({ 
      email,
      verificationCode: code 
    }).select('+password');

    if (!user) {
      return {
        success: false,
        message: 'Invalid verification code'
      };
    }

    // Check if code has expired
    if (new Date() > user.codeExpires) {
      // Clear expired code
      await User.findByIdAndUpdate(user._id, {
        verificationCode: null,
        codeExpires: null
      });

      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      };
    }

    // Clear verification code after successful verification
    await User.findByIdAndUpdate(user._id, {
      verificationCode: null,
      codeExpires: null
    });

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('❌ Code verification error:', error);
    throw new Error(`Failed to verify code: ${error.message}`);
  }
};
