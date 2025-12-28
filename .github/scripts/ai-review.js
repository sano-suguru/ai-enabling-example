#!/usr/bin/env node

/**
 * AI-Powered PR Review using GitHub Models
 * Uses GPT-4o or DeepSeek-R1 via GitHub Models API
 */

const { execSync } = require('child_process');
const OpenAI = require('openai');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const REPO_FULL_NAME = process.env.REPO_FULL_NAME;
const BASE_SHA = process.env.BASE_SHA;
const HEAD_SHA = process.env.HEAD_SHA;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o'; // gpt-4o, deepseek-r1, llama-3.3-70b-instruct

// Initialize OpenAI client with GitHub Models endpoint
const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: GITHUB_TOKEN,
});

/**
 * Get PR diff
 */
function getPRDiff() {
  try {
    const diff = execSync(`git diff ${BASE_SHA}...${HEAD_SHA}`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return diff;
  } catch (error) {
    console.error('Error getting diff:', error.message);
    return '';
  }
}

/**
 * Get changed files with their content
 */
function getChangedFiles() {
  try {
    const filesOutput = execSync(`git diff --name-only ${BASE_SHA}...${HEAD_SHA}`, {
      encoding: 'utf-8',
    });

    const files = filesOutput.trim().split('\n').filter(f => f);
    const fileContents = [];

    for (const file of files.slice(0, 20)) { // Limit to 20 files
      try {
        const content = execSync(`git show ${HEAD_SHA}:${file}`, {
          encoding: 'utf-8',
          maxBuffer: 1024 * 1024, // 1MB per file
        });
        fileContents.push({
          path: file,
          content: content.substring(0, 10000), // Limit content size
        });
      } catch (err) {
        // File might be deleted or binary
        console.log(`Skipping file ${file}: ${err.message}`);
      }
    }

    return fileContents;
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Get PR information from GitHub API
 */
async function getPRInfo() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_FULL_NAME}/pulls/${PR_NUMBER}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching PR info:', error.message);
    return null;
  }
}

/**
 * Post review comment to PR
 */
async function postReviewComment(body) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_FULL_NAME}/issues/${PR_NUMBER}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to post comment: ${response.status}`);
    }

    const result = await response.json();
    console.log('Review comment posted successfully:', result.html_url);
    return result;
  } catch (error) {
    console.error('Error posting review comment:', error.message);
    throw error;
  }
}

/**
 * Analyze code with AI
 */
async function analyzeCodeWithAI(prInfo, diff, changedFiles) {
  const prompt = `あなたは経験豊富なコードレビュアーです。以下のプルリクエストをレビューしてください。

# プルリクエスト情報
タイトル: ${prInfo?.title || 'N/A'}
説明: ${prInfo?.body || '説明なし'}

# 変更されたファイル
${changedFiles.map(f => `## ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}

# 差分
\`\`\`diff
${diff.substring(0, 20000)}
\`\`\`

以下の観点でレビューを行い、日本語で回答してください:

1. **コード品質**: 可読性、保守性、ベストプラクティスの遵守
2. **潜在的なバグ**: エラーハンドリング、エッジケース、型安全性
3. **パフォーマンス**: 非効率な実装、最適化の余地
4. **セキュリティ**: 脆弱性の可能性、入力検証
5. **テスト**: テストコードの有無と品質
6. **改善提案**: 具体的な改善案とコード例

レビューは以下の形式で出力してください:

## AIコードレビュー 🤖

### 概要
(変更内容の要約)

### 良い点 ✅
- (良い実装や改善点)

### 改善が必要な点 ⚠️
- (問題点と具体的な改善案)

### セキュリティ/バグリスク 🔒
- (セキュリティ上の懸念や潜在的なバグ)

### 推奨事項 💡
- (実装の改善提案)

---
*レビューモデル: ${AI_MODEL}*`;

  try {
    console.log(`Requesting AI review using model: ${AI_MODEL}`);

    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'あなたは優秀なコードレビュアーです。建設的で具体的なフィードバックを日本語で提供します。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const review = response.choices[0].message.content;
    console.log('AI review generated successfully');
    return review;
  } catch (error) {
    console.error('Error calling AI API:', error.message);

    // Fallback review
    return `## AIコードレビュー 🤖

### エラー

AIレビューの生成中にエラーが発生しました: ${error.message}

モデル: ${AI_MODEL}
エンドポイント: https://models.inference.ai.azure.com

### トラブルシューティング
- GitHub Tokenに \`models:read\` 権限があることを確認してください
- 選択したモデル (${AI_MODEL}) が利用可能か確認してください
- ネットワーク接続を確認してください`;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting AI Code Review...');
  console.log(`PR: ${REPO_FULL_NAME}#${PR_NUMBER}`);
  console.log(`AI Model: ${AI_MODEL}`);

  // Get PR information
  const prInfo = await getPRInfo();

  // Get diff and changed files
  const diff = getPRDiff();
  const changedFiles = getChangedFiles();

  if (!diff && changedFiles.length === 0) {
    console.log('No changes detected. Skipping review.');
    return;
  }

  console.log(`Analyzing ${changedFiles.length} changed files...`);

  // Generate AI review
  const review = await analyzeCodeWithAI(prInfo, diff, changedFiles);

  // Post review comment
  await postReviewComment(review);

  console.log('AI Code Review completed successfully!');
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
