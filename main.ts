import { Implementation as ServerImplementation } from "@modelcontextprotocol/sdk/types.js";
import { startHttpServer } from "./http.ts";
import { startStdioServer } from "./stdio.ts";

// Initialize the MCP server
const serverArgs = {
  name: "Pokemon TCG",
  version: "1.1.0",
  instructions: Deno.env.get("INSTRUCTIONS"),
} satisfies ServerImplementation;

console.log("Starting MCP server");
const transportType = Deno.env.get("MCP_SERVER_TRANSPORT") ?? 'stdio';
console.log(`Transport Type: ${transportType}`);
if (transportType === "http") {
  startHttpServer(serverArgs);
} else {
  startStdioServer(serverArgs);
}