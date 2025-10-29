// Backup Codes Generation and Management
import crypto from 'crypto';
import User from '../models/User.js';

/**
 * Generate a secure backup code (8 characters: 4 letters + 4 numbers)
 */
export const generateBackupCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O to avoid confusion
  const numbers = '23456789'; // Removed 0, 1 to avoid confusion
  
  let code = '';
  
  // Generate 4 random letters
  for (let i = 0; i < 4; i++) {
    const randomIndex = crypto.randomInt(0, letters.length);
    code += letters[randomIndex];
  }
  
  // Add hyphen for readability
  code += '-';
  
  // Generate 4 random numbers
  for (let i = 0; i < 4; i++) {
    const randomIndex = crypto.randomInt(0, numbers.length);
    code += numbers[randomIndex];
  }
  
  return code;
};

/**
 * Generate multiple backup codes for a user
 */
export const generateBackupCodes = async (userId, count = 10) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Generate new backup codes
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push({
        code: generateBackupCode(),
        used: false,
        usedAt: null
      });
    }

    // Replace existing codes with new ones
    user.backupCodes = codes;
    await user.save();

    return {
      success: true,
      codes: codes.map(c => c.code),
      message: `${count} backup codes generated successfully`
    };
  } catch (error) {
    console.error('Error generating backup codes:', error);
    return { success: false, message: 'Failed to generate backup codes' };
  }
};

/**
 * Verify and use a backup code
 */
export const verifyBackupCode = async (email, code) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Find matching unused backup code
    const backupCodeIndex = user.backupCodes.findIndex(
      bc => bc.code === code.toUpperCase() && !bc.used
    );

    if (backupCodeIndex === -1) {
      return {
        success: false,
        message: 'Invalid or already used backup code'
      };
    }

    // Mark code as used
    user.backupCodes[backupCodeIndex].used = true;
    user.backupCodes[backupCodeIndex].usedAt = new Date();
    await user.save();

    // Check remaining codes
    const remainingCodes = user.backupCodes.filter(bc => !bc.used).length;

    return {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      remainingCodes,
      warning: remainingCodes <= 2 ? `Only ${remainingCodes} backup code(s) remaining. Generate new ones soon!` : null
    };
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return { success: false, message: 'Failed to verify backup code' };
  }
};

/**
 * Get backup codes status for a user
 */
export const getBackupCodesStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const total = user.backupCodes.length;
    const used = user.backupCodes.filter(bc => bc.used).length;
    const remaining = total - used;

    return {
      success: true,
      total,
      used,
      remaining,
      hasBackupCodes: total > 0,
      needsRegeneration: remaining <= 2
    };
  } catch (error) {
    console.error('Error getting backup codes status:', error);
    return { success: false, message: 'Failed to get backup codes status' };
  }
};

/**
 * Get all backup codes for a user (admin only or user themselves)
 */
export const getBackupCodes = async (userId, showUsed = false) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    let codes = user.backupCodes;
    
    if (!showUsed) {
      codes = codes.filter(bc => !bc.used);
    }

    return {
      success: true,
      codes: codes.map(bc => ({
        code: bc.code,
        used: bc.used,
        usedAt: bc.usedAt
      }))
    };
  } catch (error) {
    console.error('Error getting backup codes:', error);
    return { success: false, message: 'Failed to get backup codes' };
  }
};

/**
 * Revoke all backup codes (security measure)
 */
export const revokeAllBackupCodes = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    user.backupCodes = [];
    await user.save();

    return {
      success: true,
      message: 'All backup codes have been revoked'
    };
  } catch (error) {
    console.error('Error revoking backup codes:', error);
    return { success: false, message: 'Failed to revoke backup codes' };
  }
};

export default {
  generateBackupCode,
  generateBackupCodes,
  verifyBackupCode,
  getBackupCodesStatus,
  getBackupCodes,
  revokeAllBackupCodes
};
