import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface HTTPTransportManager {
  acquire(requestBody: string, sessionId?: string): StreamableHTTPServerTransport;
  get(sessionId: string): StreamableHTTPServerTransport | undefined;
  releaseAll(): Promise<void>;
  close(): Promise<void>;
}

function isValidInitializeRequest(
  sessionId: string | undefined,
  requestBody: string,
):
  | { valid: true; body: unknown }
  | { valid: false; error: string; code: number } {
  if (!requestBody.length) {
    return { valid: false, error: "Empty request body", code: -32700 };
  }
  try {
    const jsonBody = JSON.parse(requestBody);
    const isInit = isInitializeRequest(jsonBody);
    if (isInit) return { valid: true, body: jsonBody };
    if (!sessionId) {
      return {
        valid: false,
        error: "No valid session ID provided",
        code: -32600,
      };
    }
    return {
      valid: false,
      error: `No transport found for session ID: ${sessionId}`,
      code: -32600,
    };
  } catch {
    return {
      valid: false,
      error: "Invalid JSON in request body",
      code: -32700,
    };
  }
}

/**
 * Creates an HTTP transport manager for handling MCP sessions
 * @returns The HTTP transport manager
 */
export function createHTTPTransportManager(): HTTPTransportManager {
  const transports = new Map<string, StreamableHTTPServerTransport>();

  const create = (sessionId: string = crypto.randomUUID()) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
      onsessioninitialized: (id: string) => {
        if (!transports.has(id)) {
          transports.set(id, transport);
        }
      },
      enableJsonResponse: true,
    });
    // Store the transport immediately with the session key for quick lookup
    transports.set(sessionId, transport);
    return transport;
  };

  const acquire = (requestBody: string, sessionId?: string) => {
    if (sessionId) {
      const transport = transports.get(sessionId);
      if (transport) return transport;
    }
    const validation = isValidInitializeRequest(sessionId, requestBody);
    if (!validation.valid) {
      throw new Error(`${validation.error} (code: ${validation.code})`);
    }
    return create(sessionId ?? crypto.randomUUID());
  };

  const releaseAll = async () => {
    const promises = Array.from(transports.values()).map((transport) => transport.close());
    await Promise.allSettled(promises);
    transports.clear();
  };

  const get = (sessionId: string) => transports.get(sessionId);
  
  const close = async () => {
    await releaseAll();
  };

  return {
    acquire,
    get,
    releaseAll,
    close,
  };
}

/**
 * Safely attempts to connect the transport to the MCP server
 */
export async function connectTransport(
  mcp: McpServer,
  transport: StreamableHTTPServerTransport,
): Promise<void> {
  try {
    await mcp.connect(transport);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Transport already started")) {
      // Transport is already connected, continue
      return;
    }
    throw error;
  }
}
