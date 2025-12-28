#!/usr/bin/env node

/**
 * AI-Powered Issue Auto Implementation using GitHub Models
 * Automatically creates a PR to implement the issue when @ai-bot is mentioned
 */

const { execSync } = require('child_process');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ISSUE_NUMBER = process.env.ISSUE_NUMBER;
const REPO_FULL_NAME = process.env.REPO_FULL_NAME;
const COMMENTER = process.env.COMMENTER;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o';

// Initialize OpenAI client with GitHub Models endpoint
const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: GITHUB_TOKEN,
});

/**
 * Get issue information from GitHub API
 */
async function getIssueInfo() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_FULL_NAME}/issues/${ISSUE_NUMBER}`,
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
    console.error('Error fetching issue info:', error.message);
    return null;
  }
}

/**
 * Get repository structure
 */
function getRepoStructure() {
  try {
    const output = execSync('find . -type f -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.java" | grep -v node_modules | grep -v .git | head -50', {
      encoding: 'utf-8',
    });
    return output.trim().split('\n').filter(f => f);
  } catch (error) {
    console.error('Error getting repo structure:', error.message);
    return [];
  }
}

/**
 * Read relevant files
 */
function readRelevantFiles(files) {
  const fileContents = [];

  for (const file of files.slice(0, 10)) { // Limit to 10 files
    try {
      const content = fs.readFileSync(file, 'utf-8');
      fileContents.push({
        path: file,
        content: content.substring(0, 5000), // Limit content size
      });
    } catch (err) {
      console.log(`Skipping file ${file}: ${err.message}`);
    }
  }

  return fileContents;
}

/**
 * Generate implementation plan with AI
 */
async function generateImplementationPlan(issueInfo, repoFiles) {
  const prompt = `あなたは優秀なソフトウェアエンジニアです。以下のIssueを実装してください。

# Issue情報
タイトル: ${issueInfo.title}
説明:
${issueInfo.body}

# リポジトリ構造
${repoFiles.map(f => `- ${f.path}`).join('\n')}

# 既存のコード例
${repoFiles.slice(0, 3).map(f => `## ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}

以下の形式で実装計画と具体的なコードを提供してください:

## 実装計画

### 変更が必要なファイル
- ファイル1: 変更内容の説明
- ファイル2: 変更内容の説明

### 実装ステップ
1. ステップ1
2. ステップ2

## コード実装

各ファイルについて、以下の形式で出力してください:

### FILE: path/to/file.ext
\`\`\`language
完全なファイルの内容
\`\`\`

必ず実装可能な具体的なコードを提供してください。`;

  try {
    console.log(`Generating implementation plan using model: ${AI_MODEL}`);

    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'あなたは優秀なソフトウェアエンジニアです。具体的で実装可能なコードを提供します。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 6000,
    });

    const plan = response.choices[0].message.content;
    console.log('Implementation plan generated successfully');
    return plan;
  } catch (error) {
    console.error('Error calling AI API:', error.message);
    throw error;
  }
}

/**
 * Parse AI response and extract file changes
 */
function parseFileChanges(aiResponse) {
  const fileChanges = [];
  const fileRegex = /### FILE: (.+?)\n```(?:\w+)?\n([\s\S]+?)```/g;

  let match;
  while ((match = fileRegex.exec(aiResponse)) !== null) {
    fileChanges.push({
      path: match[1].trim(),
      content: match[2].trim(),
    });
  }

  return fileChanges;
}

/**
 * Create a new branch
 */
function createBranch(branchName) {
  try {
    execSync('git config user.name "AI Bot"', { encoding: 'utf-8' });
    execSync('git config user.email "ai-bot@github-actions"', { encoding: 'utf-8' });
    execSync(`git checkout -b ${branchName}`, { encoding: 'utf-8' });
    console.log(`Created branch: ${branchName}`);
  } catch (error) {
    console.error('Error creating branch:', error.message);
    throw error;
  }
}

/**
 * Apply file changes
 */
function applyFileChanges(fileChanges) {
  for (const change of fileChanges) {
    try {
      const dir = path.dirname(change.path);
      if (dir !== '.' && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(change.path, change.content);
      console.log(`Updated file: ${change.path}`);
    } catch (error) {
      console.error(`Error writing file ${change.path}:`, error.message);
    }
  }
}

/**
 * Commit and push changes
 */
function commitAndPush(branchName, issueNumber) {
  try {
    execSync('git add .', { encoding: 'utf-8' });
    execSync(`git commit -m "feat: implement issue #${issueNumber} (AI-generated)"`, {
      encoding: 'utf-8',
    });

    // Push to remote
    const repoUrl = `https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_FULL_NAME}.git`;
    execSync(`git push ${repoUrl} ${branchName}`, { encoding: 'utf-8' });

    console.log(`Pushed changes to branch: ${branchName}`);
  } catch (error) {
    console.error('Error committing/pushing:', error.message);
    throw error;
  }
}

/**
 * Create pull request
 */
async function createPullRequest(branchName, issueNumber, implementationPlan) {
  try {
    const [owner, repo] = REPO_FULL_NAME.split('/');

    const prBody = `## 🤖 AI自動実装

このPRは @ai-bot によって自動生成されました。

関連Issue: #${issueNumber}

## 実装内容

${implementationPlan}

## レビュー依頼

このPRは自動生成されたため、以下を確認してください:
- [ ] コードが正しく動作するか
- [ ] テストが追加されているか
- [ ] セキュリティ上の問題がないか
- [ ] コーディング規約に従っているか

---
*生成者: @${COMMENTER}*
*AIモデル: ${AI_MODEL}*`;

    const response = await fetch(
      `https://api.github.com/repos/${REPO_FULL_NAME}/pulls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `🤖 AI実装: Issue #${issueNumber}`,
          head: branchName,
          base: 'main',
          body: prBody,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create PR: ${response.status} - ${errorData}`);
    }

    const pr = await response.json();
    console.log('Pull request created:', pr.html_url);
    return pr;
  } catch (error) {
    console.error('Error creating pull request:', error.message);
    throw error;
  }
}

/**
 * Post comment to issue
 */
async function postIssueComment(message) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_FULL_NAME}/issues/${ISSUE_NUMBER}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: message }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to post comment: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error posting issue comment:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting AI Auto Implementation...');
  console.log(`Issue: ${REPO_FULL_NAME}#${ISSUE_NUMBER}`);
  console.log(`AI Model: ${AI_MODEL}`);
  console.log(`Requested by: @${COMMENTER}`);

  try {
    // Get issue information
    const issueInfo = await getIssueInfo();
    if (!issueInfo) {
      throw new Error('Failed to fetch issue information');
    }

    // Post starting comment
    await postIssueComment('🤖 AI Botが実装を開始しました...\n\nしばらくお待ちください。');

    // Get repository structure
    const repoFiles = getRepoStructure();
    const relevantFiles = readRelevantFiles(repoFiles);

    console.log(`Analyzing ${relevantFiles.length} files...`);

    // Generate implementation plan
    const implementationPlan = await generateImplementationPlan(issueInfo, relevantFiles);

    // Parse file changes
    const fileChanges = parseFileChanges(implementationPlan);

    if (fileChanges.length === 0) {
      await postIssueComment('⚠️ AIが具体的なコード変更を生成できませんでした。\n\nIssueの内容をより具体的に記述してください。');
      return;
    }

    console.log(`Generated ${fileChanges.length} file changes`);

    // Create new branch
    const branchName = `ai-bot/issue-${ISSUE_NUMBER}`;
    createBranch(branchName);

    // Apply file changes
    applyFileChanges(fileChanges);

    // Commit and push
    commitAndPush(branchName, ISSUE_NUMBER);

    // Create pull request
    const pr = await createPullRequest(branchName, ISSUE_NUMBER, implementationPlan);

    // Post success comment
    await postIssueComment(
      `✅ AI Botが実装を完了しました!\n\nプルリクエスト: ${pr.html_url}\n\n` +
      `レビューをお願いします。\n\n---\n*AIモデル: ${AI_MODEL}*`
    );

    console.log('AI Auto Implementation completed successfully!');
  } catch (error) {
    console.error('Implementation failed:', error);

    // Post error comment
    await postIssueComment(
      `❌ AI Botの実装中にエラーが発生しました。\n\n` +
      `エラー: ${error.message}\n\n` +
      `手動での実装をお願いします。`
    );

    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
