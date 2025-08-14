import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from 'express';
import { exit } from "node:process";
import { registerCardTools } from "./src/tools.ts";
import { registerPaginatedCardTools } from "./src/paginated-tools.ts";

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
  const app = express();
  console.log("Starting express");
  // No middleware - let the transport handle everything

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  // Connect the server to the transport once at startup
  await server.connect(transport);

  // Handle all MCP requests (GET, POST, DELETE) at a single endpoint
  app.all('/mcp', async (req, res) => {
    // Handle the request using the pre-connected transport
    await transport.handleRequest(req, res);
  });

  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000/mcp");
    console.log("Press Ctrl+C to stop the server.");
  });
} else {
  const transport = new StdioServerTransport();

  // Connect the server to the transport once
  await server.connect(transport).catch((error) => {
    console.error("Fatal error connecting server:", error);
    exit(1);
  });
}