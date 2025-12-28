#!/usr/bin/env node

/**
 * Test script to verify AI Review setup
 * Usage: GITHUB_TOKEN=<your-token> node .github/scripts/test-setup.js
 */

const OpenAI = require('openai');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  console.log('\nUsage:');
  console.log('  GITHUB_TOKEN=<your-token> node .github/scripts/test-setup.js');
  console.log('\nOr set AI_MODEL:');
  console.log('  GITHUB_TOKEN=<token> AI_MODEL=deepseek-r1 node .github/scripts/test-setup.js');
  process.exit(1);
}

console.log('🔍 GitHub Models AI Review Setup Test\n');
console.log(`Model: ${AI_MODEL}`);
console.log(`Token: ${GITHUB_TOKEN.substring(0, 10)}...${GITHUB_TOKEN.substring(GITHUB_TOKEN.length - 4)}\n`);

async function testSetup() {
  try {
    console.log('1️⃣ Initializing OpenAI client with GitHub Models endpoint...');
    const client = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: GITHUB_TOKEN,
    });
    console.log('   ✅ Client initialized\n');

    console.log('2️⃣ Testing API connection with simple request...');
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'あなたは優秀なテストアシスタントです。',
        },
        {
          role: 'user',
          content: 'こんにちは！セットアップテストです。簡潔に「セットアップ成功」と応答してください。',
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const aiResponse = response.choices[0].message.content;
    console.log('   ✅ API connection successful\n');
    console.log('3️⃣ AI Response:');
    console.log(`   "${aiResponse}"\n`);

    console.log('4️⃣ Checking response metadata...');
    console.log(`   Model used: ${response.model}`);
    console.log(`   Tokens used: ${response.usage?.total_tokens || 'N/A'}`);
    console.log(`   Finish reason: ${response.choices[0].finish_reason}\n`);

    console.log('✅ All tests passed! Your setup is ready to use.\n');
    console.log('📋 Next steps:');
    console.log('   1. Create a Pull Request to test automatic code review');
    console.log('   2. Create an Issue and mention @ai-bot to test auto implementation');
    console.log('   3. Check GitHub Actions logs for detailed execution info\n');

    return true;
  } catch (error) {
    console.error('\n❌ Setup test failed!\n');
    console.error('Error details:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}`);

    if (error.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }

    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }

    console.log('\n🔧 Troubleshooting:');

    if (error.status === 401) {
      console.log('   - Token authentication failed');
      console.log('   - Verify your GITHUB_TOKEN has "models:read" permission');
      console.log('   - For PAT: https://github.com/settings/tokens');
      console.log('   - For Actions: Check workflow permissions in repo settings');
    } else if (error.status === 404) {
      console.log('   - Model not found or endpoint incorrect');
      console.log(`   - Verify model "${AI_MODEL}" is available`);
      console.log('   - Check: https://github.com/marketplace/models');
    } else if (error.status === 429) {
      console.log('   - Rate limit exceeded');
      console.log('   - Wait a few minutes and try again');
      console.log('   - Free tier: 15 requests/min, 150 requests/day');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('   - Network connection issue');
      console.log('   - Check your internet connection');
      console.log('   - Verify firewall/proxy settings');
    } else {
      console.log('   - Check the error message above for details');
      console.log('   - See: .github/AI_REVIEW_SETUP.md for troubleshooting');
    }

    console.log('');
    return false;
  }
}

// Run test
testSetup()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
