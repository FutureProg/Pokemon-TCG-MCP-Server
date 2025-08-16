// MCP tools and prompts registration for card queries
import { z } from "npm:zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const apiKey = Deno.env.get("POKEMON_TCG_API_KEY");

export const registerApiTools = (server: McpServer) => {
  // Register a tool for searching Pokémon TCG cards
  server.tool(
    "search_pokemon_cards",
    `Search Pokémon TCG cards using Lucene-like syntax. 

COMMON SEARCH PATTERNS:
• Name: name:charizard, name:"venusaur v"
• Type: types:fire, types:water  
• HP: hp:120 (exact), hp:[100 TO 200] (range), hp:[150 TO *] (150+), hp:[* TO 100] (up to 100)
• Set: set.id:base1, set.name:generations
• Subtype: subtypes:mega, subtypes:basic
• Attacks: attacks.name:flamethrower, attacks.damage:120
• Abilities: abilities.name:blaze
• Rarity: rarity:rare, rarity:"rare holo"
• Combinations: name:charizard AND hp:[150 TO *], types:fire OR types:lightning
• Exclusions: subtypes:mega -types:water

SYNTAX FEATURES:
• Wildcards: name:char* (starts with), name:*zard (ends with)
• Exact match: !name:pikachu (exactly "pikachu")  
• Ranges: hp:[100 TO 200], nationalPokedexNumbers:[1 TO 151]
• Nested fields: set.releaseDate:2023, legalities.standard:legal
• Logical operators: AND, OR, NOT (or -)
• Grouping: name:charizard (subtypes:mega OR subtypes:vmax)

See https://docs.pokemontcg.io/api-reference/cards/search-cards for full documentation.`,
    {
      q: z.string().describe(
        "Search query using Lucene-like syntax. Examples: 'hp:120' (exact HP), 'hp:[100 TO 200]' (HP range), 'name:charizard AND hp:[150 TO *]' (name + HP 150+), 'types:fire OR types:lightning' (multiple types).",
      ),
      page: z.number().int().min(1).default(1).describe(
        "Page number for pagination (default 1)",
      ),
      pageSize: z.number().int().min(1).max(250).default(50).describe(
        "Number of cards per page (max 250, default 50)",
      ),
      orderBy: z.string().optional().describe(
        "Sort order. Examples: 'hp' (ascending HP), '-hp' (descending HP), 'name,-number' (name asc, number desc)",
      ),
      select: z.string().optional().describe(
        "Comma-separated fields to include in response. Examples: 'id,name,hp', 'name,types,attacks.name'. Omit to get all fields.",
      ),
    },
    async ({
      q,
      page = 1,
      pageSize = 50,
      orderBy,
      select,
    }: {
      q: string;
      page?: number;
      pageSize?: number;
      orderBy?: string;
      select?: string;
    }) => {
      if (!apiKey) {
        throw new Error("Pokémon TCG API key is missing");
      }
      const params = new URLSearchParams();
      params.set("q", q);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (orderBy) params.set("orderBy", orderBy);
      if (select) params.set("select", select);
      const url = `https://api.pokemontcg.io/v2/cards?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      if (!res.ok) throw new Error(`Pokémon TCG API error: ${res.status}`);
      return await res.json();
    },
  );
};
