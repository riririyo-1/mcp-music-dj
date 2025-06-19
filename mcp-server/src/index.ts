#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { SEARCH_MUSIC_TOOL, MusicSearchHandler, SearchMusicParams } from './tools.js';

const server = new Server(
  {
    name: 'mcp-music-dj',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const musicSearchHandler = new MusicSearchHandler();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [SEARCH_MUSIC_TOOL],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'search_music') {
    const params = request.params.arguments as unknown as SearchMusicParams;
    const result = await musicSearchHandler.handleSearchMusic(params);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Music DJ Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});