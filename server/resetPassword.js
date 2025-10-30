import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // List all admin users
    const admins = await User.find({ role: 'admin' });
    
    console.log('📋 Admin Users:\n');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} (${admin.name})`);
    });
    console.log('');

    const choice = await question('Enter admin number to reset password (or "all" for all admins): ');
    
    let usersToUpdate = [];
    if (choice.toLowerCase() === 'all') {
      usersToUpdate = admins;
    } else {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < admins.length) {
        usersToUpdate = [admins[index]];
      } else {
        console.log('❌ Invalid choice');
        process.exit(1);
      }
    }

    const newPassword = await question('Enter new password: ');
    
    if (newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    console.log('\n🔄 Updating password(s)...\n');

    for (const user of usersToUpdate) {
      user.password = newPassword; // Will be hashed by pre-save hook
      await user.save();
      console.log(`✅ Updated password for ${user.email}`);
    }

    console.log('\n✅ Password reset complete!');
    console.log('\nYou can now log in with:');
    usersToUpdate.forEach(user => {
      console.log(`   Email: ${user.email}`);
    });
    console.log(`   Password: ${newPassword}`);

    rl.close();
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
};

resetPassword();
