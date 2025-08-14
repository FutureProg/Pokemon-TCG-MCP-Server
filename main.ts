import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toReqRes, toFetchResponse } from 'fetch-to-node';
import { exit } from "node:process";
import { registerCardTools } from "./src/tools.ts";
import { registerPaginatedCardTools } from "./src/paginated-tools.ts";

import { Hono } from 'hono';

// Initialize the MCP server
const server = new McpServer({
  name: "Pokemon TCG",
  version: "1.1.0",
});

// Register all card tools and prompts
registerCardTools(server);
registerPaginatedCardTools(server);
console.log("Starting MCP server");
const transportType = Deno.env.get("MCP_SERVER_TRANSPORT") ?? 'stdio';
console.log(`Transport Type: ${transportType}`);
if (transportType === "http") {
  const app = new Hono();
  console.log("Starting Hono Server");
  // No middleware - let the transport handle everything

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  // Connect the server to the transport once at startup
  await server.connect(transport);

  // Handle all MCP requests (GET, POST, DELETE) at a single endpoint
  app.all('/mcp', async (c) => {
    // Handle the request using the pre-connected transport
    const originalRequest = await c.req.raw;
    const bodyText = await originalRequest.text();

    // convert to an MCP request
    const headers = new Headers(originalRequest.headers);
    const host = headers.get("Host");

    // Remove the port
    if (host) {
      headers.set("Host", host.split(":")[0]);
    }

    if (!headers.get("Origin")) {
      try {
        const requestUrl = new URL(originalRequest.url);
        headers.set("Origin", requestUrl.origin);
      } catch (error) {
        console.log("No request origin, falling back to the MCP Server");
      }
    }
    headers.set("Content-Type", "application/json");

    const req = new Request(originalRequest.url, {
      method: originalRequest.method,
      headers,
      body: bodyText
    });
    const {req: nodeReq, res: nodeRes} = toReqRes(req);

    await transport.handleRequest(nodeReq, nodeRes);
    return toFetchResponse(nodeRes);
  });

  Deno.serve(app.fetch);
} else {
  const transport = new StdioServerTransport();

  // Connect the server to the transport once
  await server.connect(transport).catch((error) => {
    console.error("Fatal error connecting server:", error);
    exit(1);
  });
}