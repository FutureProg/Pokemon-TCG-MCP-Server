// Script to update the server with pagination and field filtering examples
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pokemonCards, trainerCards, energyCards } from "./src/cardData.ts";
import { z } from "npm:zod";

// Utility functions

/**
 * Filters card data to include only essential fields
 * This reduces the size of the response and helps prevent Claude from hitting message size limits
 */
export function filterCardFields(cards: any[], fieldSet: 'minimal' | 'standard' | 'full' = 'standard'): any[] {
  if (fieldSet === 'full') {
    return cards; // Return all fields
  }
  
  // Define field sets
  const minimalFields = ['id', 'name', 'supertype', 'subtypes', 'types'];
  const standardFields = [
    ...minimalFields,
    'hp', 'evolvesFrom', 'evolvesTo', 
    'attacks', 'abilities',
    'weaknesses', 'resistances', 'retreatCost',
    'images'
  ];
  
  // Select which fields to keep based on fieldSet parameter
  const fieldsToKeep = fieldSet === 'minimal' ? minimalFields : standardFields;
  
  // Filter the cards
  return cards.map(card => {
    const filteredCard: Record<string, any> = {};
    
    // Only copy fields that are in our fieldsToKeep list
    fieldsToKeep.forEach(field => {
      if (card[field] !== undefined) {
        filteredCard[field] = card[field];
      }
    });
    
    return filteredCard;
  });
}

/**
 * Handles pagination for card results
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export function paginateResults<T>(results: T[], options: PaginationOptions = {}): {
  results: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalResults: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
} {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  
  // Calculate indices
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  
  // Get page of results
  const paginatedResults = results.slice(startIndex, endIndex);
  
  return {
    results: paginatedResults,
    pagination: {
      page,
      pageSize,
      totalPages,
      totalResults,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
}

// Main function to start the server
async function main() {
  // Initialize the MCP server
  const server = new McpServer({
    name: "Pokemon TCG Search Example",
    version: "1.0.0",
  });
  
  // Register the paginated tool
  server.tool(
    "paginated-card-search",
    "Search Pokemon TCG cards with pagination and field filtering",
    {
      query: z.string(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
      fieldSet: z.enum(['minimal', 'standard', 'full']).optional()
    },
    ({query, page = 1, pageSize = 10, fieldSet = 'standard'}: {
      query: string,
      page?: number,
      pageSize?: number,
      fieldSet?: 'minimal' | 'standard' | 'full'
    }) => {
      // Filter cards
      const filteredCards = [...pokemonCards, ...trainerCards, ...energyCards].filter(card => {
        const q = query.toLowerCase();
        return (
          (card.name && card.name.toLowerCase().includes(q)) ||
          (Array.isArray(card.types) && card.types.some(t => t.toLowerCase().includes(q))) ||
          (Array.isArray(card.rules) && card.rules.some(rule => rule.toLowerCase().includes(q))) ||
          (Array.isArray(card.abilities) && card.abilities.some(ability => 
             ability.text && ability.text.toLowerCase().includes(q))) ||
          (Array.isArray(card.attacks) && card.attacks.some(a => 
             (a.name && a.name.toLowerCase().includes(q)) ||
             (a.text && a.text.toLowerCase().includes(q)))) ||
          (typeof card.flavorText === "string" && card.flavorText.toLowerCase().includes(q))
        );
      });
      
      // Apply pagination
      const paginatedResults = paginateResults(filteredCards, { page, pageSize });
      
      // Filter card fields based on fieldSet
      const filteredFieldCards = filterCardFields(paginatedResults.results, fieldSet);
      
      // Create response with pagination metadata
      return {
        content: [{
          type: 'resource',
          resource: {
            uri: `file://paginated-card-search.json`,
            mimeType: "application/json",
            text: JSON.stringify({
              cards: filteredFieldCards,
              pagination: paginatedResults.pagination,
              query: {
                searchTerm: query,
                fieldSet
              }
            })
          }
        }]
      };
    }
  );
  
  // Register the paginated prompt
  server.prompt(
    "paginated-card-search",
    "Search Pokemon TCG cards with pagination and field filtering",
    {
      query: z.string(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
      fieldSet: z.enum(['minimal', 'standard', 'full']).optional()
    },
    ({query, page = 1, pageSize = 10, fieldSet = 'standard'}: {
      query: string,
      page?: number,
      pageSize?: number,
      fieldSet?: 'minimal' | 'standard' | 'full'
    }) => {
      // Filter cards
      const filteredCards = [...pokemonCards, ...trainerCards, ...energyCards].filter(card => {
        const q = query.toLowerCase();
        return (
          (card.name && card.name.toLowerCase().includes(q)) ||
          (Array.isArray(card.types) && card.types.some(t => t.toLowerCase().includes(q))) ||
          (Array.isArray(card.rules) && card.rules.some(rule => rule.toLowerCase().includes(q))) ||
          (Array.isArray(card.abilities) && card.abilities.some(ability => 
             ability.text && ability.text.toLowerCase().includes(q))) ||
          (Array.isArray(card.attacks) && card.attacks.some(a => 
             (a.name && a.name.toLowerCase().includes(q)) ||
             (a.text && a.text.toLowerCase().includes(q)))) ||
          (typeof card.flavorText === "string" && card.flavorText.toLowerCase().includes(q))
        );
      });
      
      // Apply pagination
      const paginatedResults = paginateResults(filteredCards, { page, pageSize });
      
      // Filter card fields based on fieldSet
      const filteredFieldCards = filterCardFields(paginatedResults.results, fieldSet);
      
      // Create response with pagination metadata
      const pagination = paginatedResults.pagination;
      
      return {
        description: `Search results for "${query}" (Page ${page}/${pagination.totalPages}, showing ${filteredFieldCards.length} of ${pagination.totalResults} cards)`,
        messages: [
          { role: "user", content: { type: "text", text: `Search for cards with: ${query}` } },
          { role: "assistant", content: { type: "text", text: `Here are the search results for "${query}":\n\nPage ${page}/${pagination.totalPages}, showing ${filteredFieldCards.length} of ${pagination.totalResults} cards` } },
          { role: "assistant", content: { type: "text", text: JSON.stringify({
            cards: filteredFieldCards,
            pagination,
            query: {
              searchTerm: query,
              fieldSet
            }
          }), mimeType: "application/json" } }
        ]
      };
    }
  );
  
  // Connect to the StdioServerTransport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log("Paginated card search server is running");
}

// Run the main function
main().catch(error => {
  console.error("Error running the server:", error);
  Deno.exit(1);
});
