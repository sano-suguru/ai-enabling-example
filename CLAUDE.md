# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zenn Article Search MCP Server - A sample project demonstrating AI Enabling practices. This MCP server provides tools to list, search, and retrieve Zenn articles via RSS feeds.

**Purpose**: This is a portfolio project showcasing how to apply AI Enabling to a real project, including AI-specific documentation and CI integration.

## Technical Stack

- **Language**: TypeScript
- **Runtime**: Node.js 20.x (LTS)
- **Framework**: MCP SDK (`@modelcontextprotocol/sdk`)
- **Schema Validation**: Zod for input/output schema definitions
- **Data Source**: Zenn RSS feeds (no API keys required)

## Architecture

### MCP Tools

The server exposes three MCP tools:

1. **`list_articles`**: Retrieves a list of Zenn articles from RSS feed
   - Input: `limit` (optional, default: 20)
   - Returns: Array of article metadata

2. **`search_articles`**: Searches Zenn articles by keyword
   - Input: `query` (required)
   - Returns: Filtered articles matching the search query

3. **`get_article`**: Retrieves full article content
   - Input: `slug` (required)
   - Returns: Complete article content

### Directory Structure

```
src/
  index.ts              # Entry point
  server.ts             # MCP server implementation
  tools/
    list-articles.ts    # list_articles tool
    search-articles.ts  # search_articles tool
    get-article.ts      # get_article tool
  utils/
    rss-parser.ts       # RSS parsing utilities
    fetcher.ts          # HTTP fetching utilities
    logger.ts           # Logging utilities
tests/
  tools.test.ts         # Tool tests
```

## Commands

### Development
```bash
npm install              # Install dependencies
npm run build           # Build TypeScript to JavaScript
npm run dev             # Start development server with watch mode
npm test                # Run all tests
npm run lint            # Run ESLint
```

### Testing
```bash
npm test                # Run all tests
npm test -- --watch     # Run tests in watch mode
npm test tools.test.ts  # Run specific test file
```

## Coding Conventions

### Git Commit Messages
- **Language**: Write all commit messages in Japanese (日本語)
- **Format**: Use conventional commit style in Japanese
- **No signatures**: Do not add "Generated with Claude Code" or co-author signatures
- **Example**: "機能追加: MCPサーバーの基本実装"

### TypeScript
- Always use TypeScript with strict mode enabled
- Add JSDoc comments to all exported functions
- Use async/await for asynchronous operations (no callbacks)
- Prefer functional programming patterns where appropriate

### MCP Server Implementation
- Use `McpServer` class from `@modelcontextprotocol/sdk/server/mcp.js`
- Use `StdioServerTransport` for Claude Desktop integration
- Register tools with `server.registerTool()` method
- Define schemas using Zod validators
- Tool handlers must return both `content` (TextContent array) and `structuredContent` (validated object)

**Example tool structure:**
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

const server = new McpServer({
    name: 'zenn-search',
    version: '1.0.0'
});

server.registerTool(
    'tool-name',
    {
        title: 'Tool Title',
        description: 'Tool description',
        inputSchema: {
            param: z.string().describe('Parameter description')
        },
        outputSchema: {
            result: z.string()
        }
    },
    async ({ param }) => {
        const output = { result: 'value' };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);
```

### Error Handling
- All tool implementations must include comprehensive error handling
- Validate all external inputs before processing
- Use try/catch blocks for async operations
- Return meaningful error messages to MCP clients
- Wrap errors in TextContent format for MCP compatibility

### Logging
- Use the `logger` utility instead of `console.log`
- Log at appropriate levels (info, warn, error, debug)

### Testing
- Write unit tests for all new functions
- Place test files in the `tests/` directory
- Use descriptive test names that explain the expected behavior

## Security Considerations

- **No API Keys**: This project uses public RSS feeds only
- **Input Validation**: All external inputs (slugs, queries) must be validated
- **No Hardcoded Secrets**: Never commit environment variables or secrets

## MCP Server Integration

To test the server locally with Claude Desktop:

1. Build the project: `npm run build`
2. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "zenn-search": {
      "command": "node",
      "args": ["/absolute/path/to/ai-enabling-example/build/index.js"]
    }
  }
}
```
3. Restart Claude Desktop

## Data Source Constraints

- **RSS Feed URL**: `https://zenn.dev/{username}/feed`
- **Rate Limits**: Be respectful of Zenn's servers, no aggressive polling
- **Data Freshness**: RSS feeds may have caching, expect some delay in updates
- **Content Availability**: Only publicly available articles are accessible

## Design Decisions

### Why RSS over API?
- Zenn's public API is unofficial and may break
- RSS is stable and officially supported
- No authentication required
- Sufficient for demonstrating MCP server capabilities

### Why MCP?
- Demonstrates integration with Claude Desktop and other MCP clients
- Showcases AI Enabling practices in a concrete, testable way
- Provides a clear tool interface for LLM interaction
