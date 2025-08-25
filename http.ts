import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation as ServerImplementation } from "@modelcontextprotocol/sdk/types.js";
import { registerPaginatedCardTools } from "./src/mcp/paginated-tools.ts";
import { registerCardTools } from "./src/mcp/tools.ts";
import { registerApiTools } from "./src/mcp/apiTools.ts";
import { createHTTPTransportManager } from "./src/http/transport.ts";
import { createPostHandler, createGetAndDeleteHandler } from "./src/http/handlers.ts";

export const startHttpServer = (serverArgs: ServerImplementation, port: number = 8000) => {
  console.log("Starting HTTP Server");
  
  // Create the MCP server
  const server = new McpServer(serverArgs, { enforceStrictCapabilities: true });
  
  // Register all card tools and prompts
  registerCardTools(server);
  registerPaginatedCardTools(server);
  if (Deno.env.get("FLAG_TCG_API") == 'true') {
    console.log("Registering API tools for Pokémon TCG");
    registerApiTools(server);
  }

  // Create transport manager for handling multiple client sessions
  const transports = createHTTPTransportManager();
  
  // Create request handlers
  const postHandler = createPostHandler(server, transports);
  const getAndDeleteHandler = createGetAndDeleteHandler(server, transports);

  console.log("MCP Server connected to HTTP transport manager");
  
  return Deno.serve({ port }, async (req) => {
    console.log(`${req.method} ${req.url}`);
    
    if (req.method === "POST") {
      return await postHandler(req);
    } else if (req.method === "GET" || req.method === "DELETE") {
      return await getAndDeleteHandler(req);
    } else {
      // Return method not allowed for non-POST/GET/DELETE requests
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed."
        },
        id: null
      }), {
        status: 405,
        headers: { 
          "Content-Type": "application/json",
          "Allow": "GET, POST, DELETE"
        }
      });
    }
  });
};
