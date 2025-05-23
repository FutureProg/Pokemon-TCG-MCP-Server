# MCP Server Card Query Features - Implementation Notes

## Features to Add
- Query/filter by type (e.g. Fire, Water, Lightning)
- Query/filter by subtype (e.g. Basic, Stage 1, ex)
- Query/filter by attacks and their energy costs
- Query/filter by evolutionary line (basic -> stage 1 -> stage 2)
- Query/filter by card functionality (e.g. removes/adds energy)

## Implementation Plan
- For each feature, add a tool and a prompt to the MCP server.
- Use the existing card data structure and filter logic as in previous tools.
- For card functionality, use regex or keyword search in attack text for energy removal/addition.

## File Reference
- All card data is loaded from the JSON files in the `data/` directory.
- The main server logic is in `main.ts`.
- Card data loading is now in `src/cardData.ts`.
- Tool and prompt registration is now in `src/tools.ts`.
- `main.ts` only initializes the server and calls `registerCardTools`.

## Advanced Query Tools (2025-05-22)
- Added fuzzy search tool/prompt: allows searching cards by any text fragment in name, type, subtype, or attack (name/text). Enables natural, conversational queries.
- Added multi-criteria search tool/prompt: allows filtering by any combination of name, type, subtype, attack, energy cost, evolvesFrom, evolvesTo. Supports complex queries and LLM-driven exploration.
- Added effect/description search tool/prompt: allows searching for cards based on any effect or description text in attacks, abilities, rules, or flavorText. This enables LLM clients to answer queries about card effects, not just names or types.
- These tools are designed to make the MCP server a flexible resource for LLM clients in free-flowing conversation.

## Next Steps
- Add more advanced query tools if needed (e.g. fuzzy search, multi-criteria).
- Keep all new tool/prompt logic in `src/tools.ts` for maintainability.
- Follow MCP best practices: keep server lightweight, modular, and focused on exposing capabilities via tools/resources/prompts.
