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

const app = express();
app.use(express.text());
app.use(express.json());

// Register all card tools and prompts
registerCardTools(server);
registerPaginatedCardTools(server);

// Create a single transport instance
// const transport = new StreamableHTTPServerTransport({
//   sessionIdGenerator: () => crypto.randomUUID()
// });

const transport = new StdioServerTransport();

// Connect the server to the transport once
await server.connect(transport).catch((error) => {
  console.error("Fatal error connecting server:", error);
  exit(1);
});

// app.all("/", async (req, res) => {
//   // Only handle the request, don't create a new connection
//   await transport.handleRequest(req, res);
// });

// app.listen(3000, () => {
//   console.log("Server is running on http://localhost:3000");
//   console.log("Press Ctrl+C to stop the server.");
// });