import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {Implementation as ServerImplementation} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPaginatedCardTools } from "./src/mcp/paginated-tools.ts";
import { registerCardTools } from "./src/mcp/tools.ts";
import { exit } from "node:process";

export const startStdioServer = async (serverArgs: ServerImplementation) => {
  const server = new McpServer(serverArgs);
  // Register all card tools and prompts
  registerCardTools(server);
  registerPaginatedCardTools(server);
  const transport = new StdioServerTransport();
  
  await server.connect(transport).catch((error) => {
    console.error("Fatal error connecting server:", error);
    exit(1);
  });
};