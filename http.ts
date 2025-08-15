import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation as ServerImplementation } from "@modelcontextprotocol/sdk/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toReqRes, toFetchResponse } from "fetch-to-node";
import { registerPaginatedCardTools } from "./src/paginated-tools.ts";
import { registerCardTools } from "./src/tools.ts";

export const startHttpServer = (serverArgs: ServerImplementation) => {
  console.log("Starting HTTP Server");
  
  // Create the MCP server
  const server = new McpServer(serverArgs, { enforceStrictCapabilities: true });
  
  // Register all card tools and prompts
  registerCardTools(server);
  registerPaginatedCardTools(server);

  // Create transport with enableJsonResponse: true to return JSON instead of SSE
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,  // This is the key fix!    
  });
  
  // Connect the server to the transport
  server.connect(transport).then(() => {
    console.log("MCP Server connected to HTTP transport");
    
    // Start the HTTP server on port 8000
    const port = 8000;
    console.log(`Listening on http://0.0.0.0:${port}/ (http://localhost:${port}/)`);
    
    Deno.serve({ port }, async (req) => {
      console.log(`${req.method} ${req.url}`);
      
      if (req.method === "POST") {
        try {
          const bodyText = await req.text();
          console.log("Request body:", bodyText);
          
          // Prepare headers for MCP transport
          const headers = new Headers(req.headers);
          
          // Strip port from Host header if present (DNS rebinding protection)
          const host = headers.get("Host");
          if (host) {
            headers.set("Host", host.split(":")[0]);
          }
          
          // Ensure Origin header is set
          if (!headers.get("Origin")) {
            try {
              const requestUrl = new URL(req.url);
              headers.set("Origin", requestUrl.origin);
            } catch {
              // If we can't parse the URL, don't set a default Origin
            }
          }
          
          headers.set("Content-Type", "application/json");
          
          // Create new Request with prepared headers
          const mcpRequest = new Request(req.url, {
            method: req.method,
            headers,
            body: bodyText,
          });
          
          // Convert to Node.js request/response objects
          const { req: nodeReq, res: nodeRes } = toReqRes(mcpRequest);
          
          // Handle the request through the transport
          await transport.handleRequest(nodeReq, nodeRes);
          
          // Convert back to Deno Response
          const response = toFetchResponse(nodeRes);
          console.log("Request handled by MCP Server");
          return response;
        } catch (error) {
          console.error("Error processing request:", error);
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Internal server error"
            },
            id: null
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      } else {
        // Return method not allowed for non-POST requests
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Method not allowed."
          },
          id: null
        }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
      }
    });
  }).catch((error) => {
    console.error("Failed to connect server to transport:", error);
    Deno.exit(1);
  });
};
