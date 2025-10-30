import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const resetAllAdminPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('⚠️  No admin users found!');
      await mongoose.connection.close();
      return;
    }

    console.log('📋 Found admin users:\n');
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.name})`);
    });

    const defaultPassword = 'admin123';
    
    console.log('\n🔄 Resetting all admin passwords...\n');

    for (const admin of admins) {
      admin.password = defaultPassword; // Will be hashed by pre-save hook
      await admin.save();
      console.log(`✅ Reset password for ${admin.email}`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ All admin passwords have been reset!');
    console.log('═'.repeat(80));
    console.log('\n📝 Login Credentials:\n');
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log('   ' + '─'.repeat(76));
    });
    
    console.log('\n⚠️  IMPORTANT: Change these passwords after logging in!');
    console.log('   Go to: Settings → Change Password\n');

    await mongoose.connection.close();
    console.log('✅ Connection closed\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAllAdminPasswords();
