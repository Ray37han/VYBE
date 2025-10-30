import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const testCloudinary = async () => {
  try {
    console.log('🔍 Testing Cloudinary Credentials...\n');
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY?.slice(0, 5) + '***');
    console.log('');
    
    // Test by getting account details
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('   Status:', result.status);
    console.log('\n✅ All credentials are valid!');
    
  } catch (error) {
    console.error('\n❌ Cloudinary Error:');
    console.error('Error:', error.message);
    
    if (error.http_code === 401) {
      console.error('\n⚠️  Invalid Cloudinary credentials!');
      console.error('    Check CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET in .env');
    }
  }
};

testCloudinary();
