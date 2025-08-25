import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toReqRes, toFetchResponse } from "fetch-to-node";
import { HTTPTransportManager, connectTransport } from "./transport.ts";

/** Handles MCP errors and returns appropriate JSON-RPC error responses */
function handleMCPError(error: unknown): Response {
  let errorMessage = "Internal server error";
  let code = -32000;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    // Extract code from error message if present
    const codeMatch = error.message.match(/\(code: (-?\d+)\)/);
    if (codeMatch) {
      code = parseInt(codeMatch[1]);
      errorMessage = error.message.replace(/ \(code: -?\d+\)/, '');
    }
  }

  return new Response(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code,
      message: errorMessage
    },
    id: null
  }), {
    status: code === -32700 ? 400 : (code === -32600 ? 400 : 500),
    headers: { "Content-Type": "application/json" }
  });
}

/** Passes the request to the transport and returns the response */
async function handleMCPRequest(
  transport: StreamableHTTPServerTransport,
  request: Request,
): Promise<Response> {
  const { req, res } = toReqRes(request);
  await transport.handleRequest(req, res);
  const response = await toFetchResponse(res);
  return response;
}

/** Extracts the session ID from the request header */
function getSessionId(request: Request): string | undefined {
  const sessionId = request.headers.get("mcp-session-id");
  if (!sessionId?.trim()) return undefined;
  return sessionId;
}

/**
 * Creates a handler for MCP POST requests
 * @param mcp - The MCP server instance
 * @param transports - The HTTP transport manager
 * @returns The POST request handler
 */
export function createPostHandler(
  mcp: McpServer,
  transports: HTTPTransportManager,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      const sessionId = getSessionId(request);
      const originalRequest = request.clone();
      const bodyText = await request.text();
      const transport = transports.acquire(bodyText, sessionId);
      await connectTransport(mcp, transport);
      return await handleMCPRequest(transport, originalRequest);
    } catch (error) {
      return handleMCPError(error);
    }
  };
}

/**
 * Creates a handler for MCP GET and DELETE requests
 * @param mcp - The MCP server instance
 * @param transports - The HTTP transport manager
 * @returns The GET and DELETE request handler
 */
export function createGetAndDeleteHandler(
  mcp: McpServer,
  transports: HTTPTransportManager,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      const sessionId = getSessionId(request);
      if (!sessionId) {
        throw new Error("Session ID is required (code: -32600)");
      }
      const transport = transports.get(sessionId);
      if (!transport) {
        throw new Error("No transport found for session ID (code: -32600)");
      }
      await connectTransport(mcp, transport);
      return await handleMCPRequest(transport, request);
    } catch (error) {
      return handleMCPError(error);
    }
  };
}
