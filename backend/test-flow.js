const http = require('http');

async function test() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('--- Starting Backend Integration Test ---\n');

  try {
    // 1. Register User
    console.log('1. Registering user...');
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', email: 'test@example.com', password: 'password123' })
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok && registerData.error !== 'Email already exists') throw new Error(registerData.error);
    console.log('✅ Registration successful (or user exists).');

    // 2. Login User
    console.log('\n2. Logging in...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.error);
    const token = loginData.token;
    console.log('✅ Login successful. Token received.');

    // 3. Analyze Repo
    console.log('\n3. Analyzing repository (simulated)...');
    const analyzeRes = await fetch(`${baseUrl}/repos/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ repoUrl: 'https://github.com/expressjs/express' })
    });
    const analyzeData = await analyzeRes.json();
    if (!analyzeRes.ok) throw new Error(analyzeData.error);
    const repoId = analyzeData._id;
    console.log('✅ Repo analysis completed. Repo ID:', repoId);
    console.log(`   Detected ${analyzeData.fileCount} files, ${analyzeData.techStack.join(', ')}`);

    // 4. Get Repos List
    console.log('\n4. Fetching repos list...');
    const listRes = await fetch(`${baseUrl}/repos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    if (!listRes.ok) throw new Error(listData.error);
    console.log(`✅ Repos list fetched. Count: ${listData.length}`);

    // 5. Chat with Repo
    console.log('\n5. Chatting with repo...');
    const chatRes = await fetch(`${baseUrl}/repos/${repoId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ message: 'explain the auth flow' })
    });
    const chatData = await chatRes.json();
    if (!chatRes.ok) throw new Error(chatData.error);
    console.log('✅ Chat response received:');
    console.log(`   "${chatData.response}"`);

    console.log('\n🎉 ALL TESTS PASSED!');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
  }
}

test();
