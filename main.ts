import { Implementation as ServerImplementation } from "@modelcontextprotocol/sdk/types.js";
import { startHttpServer } from "./http.ts";
import { startStdioServer } from "./stdio.ts";
import { parseArgs } from "@std/cli/parse-args";
import { Octokit } from "https://esm.sh/octokit?dts";
import { updateCards } from "./src/update/update.ts";

const args = parseArgs(Deno.args, {
  boolean: "update",
  alias: {
    "update": ["-u"],
  },
});

if (args.update) {
  const octo = new Octokit({
    auth: Deno.env.get("GITHUB_API_KEY"),
  });
  await updateCards(octo);
  console.log("Card data update complete.");  
  Deno.exit(0);
} else {
  // Initialize the MCP server
  const serverArgs: ServerImplementation = {
    name: "Pokemon TCG",
    version: "1.1.0",
  };

  console.log("Starting MCP server");
  const transportType = Deno.env.get("MCP_SERVER_TRANSPORT") ?? "stdio";

  console.log(`Transport Type: ${transportType}`);
  if (transportType === "http") {
    startHttpServer(serverArgs);
  } else {
    startStdioServer(serverArgs);
  }
}
