// Login Notification Email Service
import { createTransporter } from './emailVerification.js';
import { parseUserAgent } from './deviceFingerprint.js';

/**
 * Send login notification email
 */
export const sendLoginNotification = async (user, req, loginMethod = 'otp') => {
  try {
    const deviceInfo = parseUserAgent(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'Asia/Dhaka'
    });

    const transporter = await createTransporter();

    const loginMethodText = {
      'otp': 'Email Verification Code',
      'backup-code': 'Backup Code',
      'trusted-device': 'Trusted Device'
    };

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'VYBE'}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 New Login to Your VYBE Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                        🔐 Login Detected
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                        VYBE Security Alert
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                        Hello <strong>${user.name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px 0; font-size: 16px; color: #333; line-height: 1.6;">
                        We detected a successful login to your VYBE account. If this was you, you can safely ignore this email.
                      </p>
                      
                      <!-- Login Details Box -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #f8f9fa; border-radius: 12px; border-left: 4px solid #667eea; margin: 0 0 30px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #667eea; font-weight: 600;">
                              📋 Login Details
                            </h3>
                            
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                  <strong style="color: #333;">⏰ Time:</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                  ${timestamp}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                  <strong style="color: #333;">💻 Device:</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                  ${deviceInfo.deviceName}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                  <strong style="color: #333;">📱 Type:</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                  ${deviceInfo.deviceType}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                  <strong style="color: #333;">🌐 IP Address:</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                  ${ip}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                  <strong style="color: #333;">🔑 Method:</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                  ${loginMethodText[loginMethod] || loginMethod}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Security Warning -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #fff3cd; border-radius: 12px; border-left: 4px solid #ffc107; margin: 0 0 30px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #856404; font-weight: 600;">
                              ⚠️ Wasn't You?
                            </h3>
                            <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">
                              If you did not authorize this login, your account may be compromised. Please:
                            </p>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #856404; line-height: 1.8;">
                              <li>Change your password immediately</li>
                              <li>Review your trusted devices</li>
                              <li>Revoke access to unfamiliar devices</li>
                              <li>Contact support if needed</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Action Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px 0;">
                            <a href="${process.env.CLIENT_URL}/security-settings" 
                               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                              Review Security Settings
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Security Tips -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #e7f5ff; border-radius: 12px; margin: 0 0 20px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #0c63e4; font-weight: 600;">
                              🛡️ Security Tips
                            </h3>
                            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #0c63e4; line-height: 1.8;">
                              <li>Always use strong, unique passwords</li>
                              <li>Enable two-factor authentication</li>
                              <li>Don't share your verification codes</li>
                              <li>Be cautious of phishing emails</li>
                              <li>Keep your backup codes safe</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                        Thank you for using VYBE. We're committed to keeping your account secure.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                        <strong>VYBE</strong> - Visualize Your Best Essence
                      </p>
                      <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
                        This is an automated security notification. Please do not reply to this email.
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #999;">
                        © ${new Date().getFullYear()} VYBE. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending login notification:', error);
    // Don't fail login if notification email fails
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send suspicious login alert
 */
export const sendSuspiciousLoginAlert = async (user, req, reason) => {
  try {
    const deviceInfo = parseUserAgent(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'Asia/Dhaka'
    });

    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'VYBE'} Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🚨 Suspicious Login Attempt Detected',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Suspicious Login Alert</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header with Red Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                        🚨 Security Alert
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                        Suspicious Activity Detected
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                        Hello <strong>${user.name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px 0; font-size: 16px; color: #333; line-height: 1.6;">
                        We detected a suspicious login attempt to your VYBE account and blocked it for your protection.
                      </p>
                      
                      <!-- Alert Box -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #ffe0e0; border-radius: 12px; border-left: 4px solid #ff6b6b; margin: 0 0 30px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #c92a2a; font-weight: 600;">
                              🔍 Reason for Alert
                            </h3>
                            <p style="margin: 0; font-size: 14px; color: #c92a2a; line-height: 1.6;">
                              ${reason}
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Attempt Details -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #f8f9fa; border-radius: 12px; margin: 0 0 30px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333; font-weight: 600;">
                              📋 Attempt Details
                            </h3>
                            
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                  <strong style="color: #333;">⏰ Time:</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                  ${timestamp}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                  <strong style="color: #333;">💻 Device:</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                  ${deviceInfo.deviceName}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                  <strong style="color: #333;">🌐 IP Address:</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                  ${ip}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Action Required -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #fff3cd; border-radius: 12px; border-left: 4px solid #ffc107; margin: 0 0 30px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #856404; font-weight: 600;">
                              ⚠️ Immediate Action Required
                            </h3>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #856404; line-height: 1.8;">
                              <li><strong>Change your password immediately</strong></li>
                              <li>Review your recent account activity</li>
                              <li>Check your trusted devices list</li>
                              <li>Enable additional security measures</li>
                              <li>Contact support if you need assistance</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Action Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 10px 0;">
                            <a href="${process.env.CLIENT_URL}/change-password" 
                               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(255, 107, 107, 0.3);">
                              Change Password Now
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                        <strong>VYBE Security Team</strong>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #999;">
                        This is an automated security alert. If you have concerns, contact support immediately.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending suspicious login alert:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  sendLoginNotification,
  sendSuspiciousLoginAlert
};
