/**
 * MCP Server implementation for Zenn Article Search
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

/**
 * Create and configure the MCP server instance
 */
export const server = new McpServer({
  name: 'zenn-search',
  version: '1.0.0',
});

/**
 * Register a simple "hello" tool for testing
 * This will be replaced with actual Zenn article search tools
 */
server.registerTool(
  'hello',
  {
    title: 'Hello World',
    description: 'A simple test tool that returns a greeting',
    inputSchema: {
      name: z.string().optional().describe('Name to greet (optional)'),
    },
    outputSchema: {
      message: z.string(),
    },
  },
  async ({ name }) => {
    const greeting = name ? `Hello, ${name}!` : 'Hello, World!';
    const output = { message: greeting };

    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }
);
