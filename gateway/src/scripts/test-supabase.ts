import { supabase } from '../supabase.js';

async function testSupabase() {
  console.log('Testing Supabase direct operations...');
  
  // 1. Test Select Policies
  const { data: policies, error: polErr } = await supabase.from('policies').select('*');
  console.log('Policies query:', { count: policies?.length, error: polErr });

  // 2. Test Select Users
  const { data: users, error: usrErr } = await supabase.from('users').select('*');
  console.log('Users query:', { count: users?.length, error: usrErr });

  // 3. Test Insert User
  const testId = `usr_${Date.now()}`;
  const { data: insertData, error: insErr } = await supabase.from('users').insert({
    id: testId,
    email: `test_${Date.now()}@keyhole.sec`,
    password_hash: 'testhash',
    name: 'Test Tester',
    role: 'admin'
  }).select();
  console.log('User insert result:', { insertData, error: insErr });
}

testSupabase();
