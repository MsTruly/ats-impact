// test-env.js
console.log('Test Build Env Check:');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV); // Vercel's built-in env var
console.log('SUPABASE_SERVICE_ROLE_KEY_TEST:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded from Test ✅' : 'Missing from Test ❌');
console.log('SUPABASE_URL_TEST:', process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);

// You can even try to exit with an error here if the key is missing to make the failure explicit.
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is MISSING during test!');
    process.exit(1); // Force a build failure
}