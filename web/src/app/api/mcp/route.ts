import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

interface JSONRPCRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params: any;
}

interface JSONRPCResponse {
  jsonrpc: string;
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

async function callMCPServer(request: JSONRPCRequest): Promise<JSONRPCResponse> {
  return new Promise((resolve, reject) => {
    const mcpServerPath = path.join(process.cwd(), '..', 'mcp-server', 'dist', 'index.js');
    
    const mcpProcess = spawn('node', [mcpServerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responseData = '';
    let errorData = '';
    
    const timeout = setTimeout(() => {
      mcpProcess.kill();
      reject(new Error('MCP server timeout'));
    }, 15000);

    mcpProcess.stdout.on('data', (data) => {
      responseData += data.toString();
      
      try {
        const lines = responseData.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.jsonrpc && parsed.id === request.id) {
              clearTimeout(timeout);
              mcpProcess.kill();
              resolve(parsed);
              return;
            }
          } catch (e) {
            // 不完全なJSONの場合は続行
          }
        }
      } catch (error) {
        // データがまだ不完全な場合は続行
      }
    });

    mcpProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    mcpProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    mcpProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        reject(new Error(`MCP process exited with code ${code}: ${errorData}`));
      }
    });

    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: prompt is required' },
        { status: 400 }
      );
    }

    const jsonrpcRequest: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'search_music',
        arguments: {
          prompt: body.prompt,
          limit: body.limit || 10,
        },
      },
    };

    const response = await callMCPServer(jsonrpcRequest);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    if (response.result?.content?.[0]?.text) {
      const result = JSON.parse(response.result.content[0].text);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid response from MCP server' },
      { status: 500 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}