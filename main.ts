import { Implementation as ServerImplementation } from "@modelcontextprotocol/sdk/types.js";
import { startHttpServer } from "./http.ts";
import { startStdioServer } from "./stdio.ts";
import { parseArgs } from "@std/cli/parse-args";
import { Octokit } from "https://esm.sh/octokit?dts";
import { updateCards, updateSets } from "./src/update/update.ts";
import { loadCardData } from "./src/cardData.ts";
import { exists } from 'jsr:@std/fs'

const args = parseArgs(Deno.args, {
  boolean: "update",
  alias: {
    "update": ["-u"],
  },
});

// Create folder structure if it doesn't exist
if (!await exists("./data/cards/")) {
  await Deno.mkdir("./data/cards/", { recursive: true });
}

await Promise.all([
  exists("./data/cards/pokemon-cards.json").then(fileExists => ["./data/cards/pokemon-cards.json", fileExists] as [string, boolean]),
  exists("./data/cards/trainer-cards.json").then(fileExists => ["./data/cards/trainer-cards.json", fileExists] as [string, boolean]),
  exists("./data/cards/energy-cards.json").then(fileExists => ["./data/cards/energy-cards.json", fileExists] as [string, boolean]),
  exists("./data/cards/sets.json").then(fileExists => ["./data/cards/sets.json", fileExists] as [string, boolean])
])
.then((results) => results.map(([fileName, fileExists]) => {
  if (!fileExists) {
    Deno.writeTextFileSync(fileName, "[]");
    console.log(`Created empty data file: ${fileName}`);
  }
  return fileName;
}));

const downloadUpdates = async () => {
  const octo = new Octokit({
    auth: Deno.env.get("GITHUB_API_KEY"),
  });
  await Promise.all([
    updateCards(octo).then(() => console.log("Card data update complete.")), 
    updateSets(octo).then(() => console.log("Set data update complete."))
  ]);
}

if (args.update) {  
  console.log("Downloading latest card and set data from Github");
  await downloadUpdates();
  Deno.exit(0);
} else {
  console.log("Loading card data from disk");
  const result = loadCardData();  
  if (result.pokemonCards.length === 0) {
    console.error("No card data found. Will  attempt to download updates from Github.");
    await downloadUpdates();
    const retryResult = loadCardData();
    if (retryResult.pokemonCards.length === 0) {
      console.error("No card data found after update attempt. Exiting.");
      Deno.exit(1);
    }
  }
  
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
