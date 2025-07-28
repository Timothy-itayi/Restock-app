// Test environment variables
import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Testing Environment Variables...\n');

console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'EXISTS' : 'MISSING');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING');

if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.log('URL length:', process.env.EXPO_PUBLIC_SUPABASE_URL.length);
  console.log('URL starts with:', process.env.EXPO_PUBLIC_SUPABASE_URL.substring(0, 20) + '...');
}

if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Key length:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.length);
  console.log('Key starts with:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...');
}

console.log('\n✅ Environment test completed!'); 