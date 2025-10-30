import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const activateAllAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-store');
    console.log('✅ MongoDB connected');

    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('⚠️  No admin users found!');
      await mongoose.connection.close();
      return;
    }

    console.log(`\n📊 Found ${admins.length} admin user(s)\n`);
    console.log('═'.repeat(80));

    // Update all admins to be active
    const result = await User.updateMany(
      { role: 'admin' },
      { $set: { isActive: true } }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} admin account(s) to ACTIVE status\n`);

    // Show updated status
    const updatedAdmins = await User.find({ role: 'admin' });
    
    updatedAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.isActive ? '✅ ACTIVE' : '❌ Inactive'}`);
      console.log('   ' + '─'.repeat(76));
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ All admin accounts are now active!');
    console.log('   They can now upload products and perform all admin functions.\n');

    await mongoose.connection.close();
    console.log('✅ Connection closed\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

activateAllAdmins();
