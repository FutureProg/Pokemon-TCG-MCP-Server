import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport  } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "npm:zod";
import { readFileSync } from "node:fs";
import express from 'express';
import { Card } from "./types.d.ts";
import path from "node:path";
import { exit } from "node:process";
// import { PDFDocument } from "npm:pdf-lib";

// Initialize the MCP server
const server = new McpServer({
  name: "Pokemon TCG",
  version: "1.0.0",
});

const app = express();
app.use(express.json());

// Load JSON data from the data directory
const loadJsonData = (filePath: string): any => {
  filePath = path.join(import.meta.dirname??'', filePath);
  try {
    const data = readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading JSON data from ${filePath}:`, error);
    return null;
  }
};

const pokemonCards = loadJsonData("./data/Standard-Pokemon-Cards-2025-04-10T01-35-31-480Z.json") as Card[];
const trainerCards = loadJsonData("./data/Standard-Trainer-Cards-2025-04-10T01-32-57-466Z.json") as Card[];
const energyCards = loadJsonData("./data/Standard-Energy-Cards-2025-04-10T01-36-14-513Z.json") as Card[];

server.resource(
  "cards",
  "cards://all",
  (uri) => {
    console.log(`Loaded ${pokemonCards.length} Pokemon cards, ${trainerCards.length} trainer cards, and ${energyCards.length} energy cards`);
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify([...pokemonCards, ...trainerCards, ...energyCards]),
        mimeType: "application/json"
      }]
    }
  }
);
server.tool(
  "testTool",
  "Test Tool",
  () => ({
    content: [{
      type: 'text',
      text: "This is a test response"
    }]
  })
)
server.tool(
  "cards",
  "Get Pokemon TCG Cards",
  () => ({
    content: [{
      type: 'text',
      text: JSON.stringify([...pokemonCards, ...trainerCards, ...energyCards]),
      mimeType: "application/json"
    }]
  })
)

server.prompt("Get list of Pokemon", "Get list of Pokemon", () => ({

});

const transport = new StdioServerTransport();
await server.connect(transport).catch((error) => {
  console.error("Fatal error running server:", error);
  exit(1);
});

// app.all("/", async (req, res) => {
//   // Start the server
//   const transport = new StreamableHTTPServerTransport({
//     sessionIdGenerator: undefined
//   });
//   await server.connect(transport);
//   await transport.handleRequest(req, res);
// });

// app.listen(3000, () => {
// });