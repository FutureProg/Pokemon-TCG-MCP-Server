// Paginated card tools with field filtering
import { z } from "npm:zod";
import { filterCardFields, paginateResults } from "../utils.ts";

export async function registerPaginatedCardTools(server: any) {
  const { pokemonCards, trainerCards, energyCards, sets: cardSets } = await import("../cardData.ts");
  // Paginated card search tool
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
  
  // Paginated search by effect text
  server.tool(
    "paginated-effect-search",
    "Search Pokemon TCG cards by effect text with pagination and field filtering",
    {
      effect: z.string(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
      fieldSet: z.enum(['minimal', 'standard', 'full']).optional()
    },
    ({effect, page = 1, pageSize = 10, fieldSet = 'standard'}: {
      effect: string,
      page?: number,
      pageSize?: number,
      fieldSet?: 'minimal' | 'standard' | 'full'
    }) => {
      // Filter cards by effect text
      const filteredCards = [...pokemonCards, ...trainerCards, ...energyCards].filter(card => {
        const q = effect.toLowerCase();
        return (
          (Array.isArray(card.rules) && card.rules.some(rule => rule.toLowerCase().includes(q))) ||
          (Array.isArray(card.abilities) && card.abilities.some(ability => ability.text && ability.text.toLowerCase().includes(q))) ||
          (Array.isArray(card.attacks) && card.attacks.some(a => a.text && a.text.toLowerCase().includes(q))) ||
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
            uri: `file://paginated-effect-search.json`,
            mimeType: "application/json",
            text: JSON.stringify({
              cards: filteredFieldCards,
              pagination: paginatedResults.pagination,
              query: {
                effectText: effect,
                fieldSet
              }
            })
          }
        }]
      };
    }
  );
  
  // Paginated find by type with field filtering
  server.tool(
    "paginated-type-search",
    "Find Pokemon TCG cards by type with pagination and field filtering",
    {
      type: z.string(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
      fieldSet: z.enum(['minimal', 'standard', 'full']).optional()
    },
    ({type, page = 1, pageSize = 10, fieldSet = 'standard'}: {
      type: string,
      page?: number,
      pageSize?: number,
      fieldSet?: 'minimal' | 'standard' | 'full'
    }) => {
      // Filter cards by type
      const filteredCards = pokemonCards.filter(card =>
        Array.isArray(card.types) &&
        card.types.some(t => t.toLowerCase() === type.toLowerCase())
      );
      
      // Apply pagination
      const paginatedResults = paginateResults(filteredCards, { page, pageSize });
      
      // Filter card fields based on fieldSet
      const filteredFieldCards = filterCardFields(paginatedResults.results, fieldSet);
      
      // Create response with pagination metadata
      return {
        content: [{
          type: 'resource',
          resource: {
            uri: `file://paginated-type-search.json`,
            mimeType: "application/json",
            text: JSON.stringify({
              cards: filteredFieldCards,
              pagination: paginatedResults.pagination,
              query: {
                type,
                fieldSet
              }
            })
          }
        }]
      };
    }
  );
  
  // Add corresponding prompts for each paginated tool
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
}
