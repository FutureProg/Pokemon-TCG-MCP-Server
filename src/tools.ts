// MCP tools and prompts registration for card queries
import { z } from "npm:zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { energyCards, pokemonCards, trainerCards } from "./cardData.ts";
import { filterCardFields, paginateResults } from "./utils.ts";

export function registerCardTools(server: McpServer) {
  // All-cards resource
  server.resource(
    "cards",
    "file://all-cards.json",
    (uri: any) => {
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify([
            ...pokemonCards,
            ...trainerCards,
            ...energyCards,
          ]),
          mimeType: "application/json",
        }],
      };
    },
  );

  // Find by name
  server.tool(
    "find-card-by-name",
    "Find a Pokemon TCG card by its name",
    { name: z.string() },
    ({ name }: { name: string }) => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://${name}-cards.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            [...pokemonCards, ...trainerCards, ...energyCards].filter((card) =>
              card.name.toLowerCase().includes(name.toLowerCase())
            ),
          ),
        },
      }],
    }),
  );
  // server.prompt(
  //   "find-card-by-name",
  //   "Find a Pokemon TCG card by its name",
  //   { name: z.string() },
  //   ({ name }: { name: string }) => ({
  //     description: `Find a Pokemon TCG card by its name`,
  //     messages: [
  //       {
  //         role: "user",
  //         content: {
  //           type: "text",
  //           text: `Find a Pokemon TCG card by its name: ${name}`,
  //         },
  //       },
  //       {
  //         role: "assistant",
  //         content: {
  //           type: "text",
  //           text: `Here are the cards that match the name \"${name}\":`,
  //         },
  //       },
  //       {
  //         role: "assistant",
  //         content: {
  //           type: "text",
  //           text: JSON.stringify(
  //             [...pokemonCards, ...trainerCards, ...energyCards].filter((
  //               card,
  //             ) => card.name.toLowerCase().includes(name.toLowerCase())),
  //           ),
  //           mimeType: "application/json",
  //         },
  //       },
  //     ],
  //   }),
  // );

  // Find cards with self-damage
  server.tool(
    "find-cards-with-self-damage",
    "Find Pokemon TCG cards with attacks that do self-damage",
    {},
    () => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://cards-with-self-damage.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            pokemonCards.filter((card) =>
              Array.isArray(card.attacks) &&
              card.attacks.some((attack) =>
                typeof attack.text === "string" &&
                /does [0-9]+ damage to itself|this pokémon also does|to itself|to this pokémon/i
                  .test(attack.text)
              )
            ),
          ),
        },
      }],
    }),
  );
  server.prompt(
    "find-cards-with-self-damage",
    "Find Pokemon TCG cards with attacks that do self-damage",
    {},
    () => ({
      description: `Find Pokemon TCG cards with attacks that do self-damage`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Help me find Pokemon with attacks that do self-damage.`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text:
              `Here are the Pokemon cards with attacks that do self-damage:`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              pokemonCards.filter((card) =>
                Array.isArray(card.attacks) &&
                card.attacks.some((attack) =>
                  typeof attack.text === "string" &&
                  /does [0-9]+ damage to itself|this pokémon also does|to itself|to this pokémon/i
                    .test(attack.text)
                )
              ),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );

  // Find by type
  server.tool(
    "find-cards-by-type",
    "Find Pokemon TCG cards by type (e.g. Fire, Water, Lightning)",
    { type: z.string() },
    ({ type }: { type: string }) => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://cards-by-type.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            pokemonCards.filter((card) =>
              Array.isArray(card.types) &&
              card.types.some((t) => t.toLowerCase() === type.toLowerCase())
            ),
          ),
        },
      }],
    }),
  );
  server.prompt(
    "find-cards-by-type",
    "Find Pokemon TCG cards by type",
    { type: z.string() },
    ({ type }: { type: string }) => ({
      description: `Find Pokemon TCG cards by type: ${type}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find Pokemon TCG cards by type: ${type}`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Here are the cards with type ${type}:`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              pokemonCards.filter((card) => Array.isArray(card.types) &&
                card.types.some((t) => t.toLowerCase() === type.toLowerCase())
              ),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );

  // Find by subtype
  server.tool(
    "find-cards-by-subtype",
    "Find Pokemon TCG cards by subtype (e.g. Basic, Stage 1, ex)",
    { subtype: z.string() },
    ({ subtype }: { subtype: string }) => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://cards-by-subtype.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            pokemonCards.filter((card) =>
              Array.isArray(card.subtypes) &&
              card.subtypes.some((s) =>
                s.toLowerCase() === subtype.toLowerCase()
              )
            ),
          ),
        },
      }],
    }),
  );
  server.prompt(
    "find-cards-by-subtype",
    "Find Pokemon TCG cards by subtype",
    { subtype: z.string() },
    ({ subtype }: { subtype: string }) => ({
      description: `Find Pokemon TCG cards by subtype: ${subtype}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find Pokemon TCG cards by subtype: ${subtype}`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Here are the cards with subtype ${subtype}:`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              pokemonCards.filter((card) =>
                Array.isArray(card.subtypes) &&
                card.subtypes.some((s) =>
                  s.toLowerCase() === subtype.toLowerCase()
                )
              ),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );

  // Find by attack and energy cost
  server.tool(
    "find-cards-by-attack-energy",
    "Find Pokemon TCG cards by attack name and/or energy cost",
    { attack: z.string().optional(), energy: z.string().optional() },
    ({ attack, energy }: { attack?: string; energy?: string }) => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://cards-by-attack-energy.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            pokemonCards.filter((card) =>
              Array.isArray(card.attacks) &&
              card.attacks.some((a) =>
                (!attack ||
                  (a.name &&
                    a.name.toLowerCase().includes(attack.toLowerCase()))) &&
                (!energy || (a.convertedEnergyCost === Number(energy)))
              )
            ),
          ),
        },
      }],
    }),
  );
  server.prompt(
    "find-cards-by-attack-energy",
    "Find Pokemon TCG cards by attack and/or energy cost",
    { attack: z.string().optional(), energy: z.string().optional() },
    ({ attack, energy }: { attack?: string; energy?: string }) => ({
      description: `Find Pokemon TCG cards by attack${
        attack ? `: ${attack}` : ""
      }${energy ? ` and energy cost: ${energy}` : ""}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find Pokemon TCG cards by attack${
              attack ? `: ${attack}` : ""
            }${energy ? ` and energy cost: ${energy}` : ""}`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Here are the cards that match your attack/energy query:`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              pokemonCards.filter((card) =>
                Array.isArray(card.attacks) &&
                card.attacks.some((a) =>
                  (!attack ||
                    (a.name &&
                      a.name.toLowerCase().includes(attack.toLowerCase()))) &&
                  (!energy || (a.convertedEnergyCost === Number(energy)))
                )
              ),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );

  // Find by evolutionary line
  server.tool(
    "find-cards-by-evolutionary-line",
    "Find Pokemon TCG cards by evolutionary line (basic, stage 1, stage 2, evolves from/to)",
    {
      basic: z.string().optional(),
      stage1: z.string().optional(),
      stage2: z.string().optional(),
    },
    (
      { basic, stage1, stage2 }: {
        basic?: string;
        stage1?: string;
        stage2?: string;
      },
    ) => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://cards-by-evolutionary-line.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            pokemonCards.filter((card) =>
              (!basic ||
                (card.subtypes && card.subtypes.includes("Basic") &&
                  card.name &&
                  card.name.toLowerCase().includes(basic.toLowerCase()))) &&
              (!stage1 ||
                (card.subtypes && card.subtypes.includes("Stage 1") &&
                  card.name &&
                  card.name.toLowerCase().includes(stage1.toLowerCase()))) &&
              (!stage2 ||
                (card.subtypes && card.subtypes.includes("Stage 2") &&
                  card.name &&
                  card.name.toLowerCase().includes(stage2.toLowerCase())))
            ),
          ),
        },
      }],
    }),
  );
  server.prompt(
    "find-cards-by-evolutionary-line",
    "Find Pokemon TCG cards by evolutionary line",
    {
      basic: z.string().optional(),
      stage1: z.string().optional(),
      stage2: z.string().optional(),
    },
    (
      { basic, stage1, stage2 }: {
        basic?: string;
        stage1?: string;
        stage2?: string;
      },
    ) => ({
      description: `Find Pokemon TCG cards by evolutionary line` +
        (basic ? `, basic: ${basic}` : "") +
        (stage1 ? `, stage 1: ${stage1}` : "") +
        (stage2 ? `, stage 2: ${stage2}` : ""),
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find Pokemon TCG cards by evolutionary line` +
              (basic ? `, basic: ${basic}` : "") +
              (stage1 ? `, stage 1: ${stage1}` : "") +
              (stage2 ? `, stage 2: ${stage2}` : ""),
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Here are the cards that match your evolutionary line query:`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              pokemonCards.filter((card) =>
                (!basic ||
                  (card.subtypes && card.subtypes.includes("Basic") &&
                    card.name &&
                    card.name.toLowerCase().includes(basic.toLowerCase()))) &&
                (!stage1 ||
                  (card.subtypes && card.subtypes.includes("Stage 1") &&
                    card.name &&
                    card.name.toLowerCase().includes(stage1.toLowerCase()))) &&
                (!stage2 ||
                  (card.subtypes && card.subtypes.includes("Stage 2") &&
                    card.name &&
                    card.name.toLowerCase().includes(stage2.toLowerCase())))
              ),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );

  // Find by energy functionality
  server.tool(
    "find-cards-by-energy-functionality",
    "Find Pokemon TCG cards that remove or add energy (by attack text)",
    { action: z.enum(["remove", "add"]) },
    ({ action }: { action: "remove" | "add" }) => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://cards-by-energy-functionality.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            pokemonCards.filter((card) =>
              Array.isArray(card.attacks) &&
              card.attacks.some((attack) =>
                typeof attack.text === "string" &&
                (action === "remove"
                  ? /discard|remove.*energy/i.test(attack.text)
                  : /attach|add.*energy/i.test(attack.text))
              )
            ),
          ),
        },
      }],
    }),
  );
  server.prompt(
    "find-cards-by-energy-functionality",
    "Find Pokemon TCG cards that remove or add energy",
    { action: z.enum(["remove", "add"]) },
    ({ action }: { action: "remove" | "add" }) => ({
      description: `Find Pokemon TCG cards that ${
        action === "remove" ? "remove" : "add"
      } energy by attack text`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find Pokemon TCG cards that ${
              action === "remove" ? "remove" : "add"
            } energy by attack text`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Here are the cards that ${
              action === "remove" ? "remove" : "add"
            } energy:`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              pokemonCards.filter((card) =>
                Array.isArray(card.attacks) &&
                card.attacks.some((attack) =>
                  typeof attack.text === "string" &&
                  (action === "remove"
                    ? /discard|remove.*energy/i.test(attack.text)
                    : /attach|add.*energy/i.test(attack.text))
                )
              ),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );

  // Fuzzy search tool (name, type, attack, subtype)
  server.tool(
    "fuzzy-search-cards",
    "Fuzzy search Pokemon TCG cards by name, type, attack, or subtype",
    { query: z.string(), limit: z.number().optional() },
    ({ query, limit = 20 }: { query: string; limit?: number }) => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://fuzzy-search-cards.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            [...pokemonCards, ...trainerCards, ...energyCards].filter(
              (card) => {
                const q = query.toLowerCase();
                return (
                  (card.name && card.name.toLowerCase().includes(q)) ||
                  (Array.isArray(card.types) && card.types.some((t) =>
                    t.toLowerCase().includes(q)
                  )) ||
                  (Array.isArray(card.subtypes) &&
                    card.subtypes.some((s) => s.toLowerCase().includes(q))) ||
                  (Array.isArray(card.attacks) && card.attacks.some((a) =>
                    (a.name && a.name.toLowerCase().includes(q)) ||
                    (a.text && a.text.toLowerCase().includes(q))
                  ))
                );
              },
            ).slice(0, limit),
          ),
        },
      }],
    }),
  );
  server.prompt(
    "fuzzy-search-cards",
    "Fuzzy search Pokemon TCG cards by name, type, attack, or subtype",
    { query: z.string(), limit: z.number().optional() },
    ({ query, limit = 20 }: { query: string; limit?: number }) => ({
      description:
        `Fuzzy search Pokemon TCG cards for: ${query} (limited to ${limit} results)`,
      messages: [
        {
          role: "user",
          content: { type: "text", text: `Find cards related to: ${query}` },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text:
              `Here are the cards that match your query (limited to ${limit} results):`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              [...pokemonCards, ...trainerCards, ...energyCards].filter(
                (card) => {
                  const q = query.toLowerCase();
                  return (
                    (card.name && card.name.toLowerCase().includes(q)) ||
                    (Array.isArray(card.types) && card.types.some((t) =>
                      t.toLowerCase().includes(q)
                    )) ||
                    (Array.isArray(card.subtypes) &&
                      card.subtypes.some((s) => s.toLowerCase().includes(q))) ||
                    (Array.isArray(card.attacks) && card.attacks.some((a) =>
                      (a.name && a.name.toLowerCase().includes(q)) ||
                      (a.text && a.text.toLowerCase().includes(q))
                    ))
                  );
                },
              ).slice(0, limit),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );

  // Multi-criteria search tool
  server.tool(
    "multi-criteria-search-cards",
    "Search Pokemon TCG cards by multiple criteria (name, type, subtype, attack, energy, evolutionary line)",
    {
      name: z.string().optional(),
      type: z.string().optional(),
      subtype: z.string().optional(),
      attack: z.string().optional(),
      energy: z.string().optional(),
      evolvesFrom: z.string().optional(),
      evolvesTo: z.string().optional(),
    },
    ({ name, type, subtype, attack, energy, evolvesFrom, evolvesTo }: {
      name?: string;
      type?: string;
      subtype?: string;
      attack?: string;
      energy?: string;
      evolvesFrom?: string;
      evolvesTo?: string;
    }) => ({
      content: [{
        type: "resource",
        resource: {
          uri: `file://multi-criteria-search-cards.json`,
          mimeType: "application/json",
          text: JSON.stringify(
            pokemonCards.filter((card) =>
              (!name ||
                (card.name &&
                  card.name.toLowerCase().includes(name.toLowerCase()))) &&
              (!type ||
                (Array.isArray(card.types) &&
                  card.types.some((t) =>
                    t.toLowerCase() === type.toLowerCase()
                  ))) &&
              (!subtype ||
                (Array.isArray(card.subtypes) &&
                  card.subtypes.some((s) =>
                    s.toLowerCase() === subtype.toLowerCase()
                  ))) &&
              (!attack ||
                (Array.isArray(card.attacks) &&
                  card.attacks.some((a) =>
                    a.name &&
                    a.name.toLowerCase().includes(attack.toLowerCase())
                  ))) &&
              (!energy ||
                (Array.isArray(card.attacks) &&
                  card.attacks.some((a) =>
                    a.convertedEnergyCost === Number(energy)
                  ))) &&
              (!evolvesFrom ||
                (card.evolvesFrom &&
                  card.evolvesFrom.toLowerCase().includes(
                    evolvesFrom.toLowerCase(),
                  ))) &&
              (!evolvesTo ||
                (Array.isArray(card.evolvesTo) &&
                  card.evolvesTo.some((e) =>
                    e.toLowerCase().includes(evolvesTo.toLowerCase())
                  )))
            ),
          ),
        },
      }],
    }),
  );
  server.prompt(
    "multi-criteria-search-cards",
    "Search Pokemon TCG cards by multiple criteria",
    {
      name: z.string().optional(),
      type: z.string().optional(),
      subtype: z.string().optional(),
      attack: z.string().optional(),
      energy: z.string().optional(),
      evolvesFrom: z.string().optional(),
      evolvesTo: z.string().optional(),
    },
    ({ name, type, subtype, attack, energy, evolvesFrom, evolvesTo }: {
      name?: string;
      type?: string;
      subtype?: string;
      attack?: string;
      energy?: string;
      evolvesFrom?: string;
      evolvesTo?: string;
    }) => ({
      description: `Search Pokemon TCG cards by multiple criteria` +
        (name ? `, name: ${name}` : "") +
        (type ? `, type: ${type}` : "") +
        (subtype ? `, subtype: ${subtype}` : "") +
        (attack ? `, attack: ${attack}` : "") +
        (energy ? `, energy: ${energy}` : "") +
        (evolvesFrom ? `, evolves from: ${evolvesFrom}` : "") +
        (evolvesTo ? `, evolves to: ${evolvesTo}` : ""),
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search for cards with:` +
              (name ? ` name: ${name}` : "") +
              (type ? ` type: ${type}` : "") +
              (subtype ? ` subtype: ${subtype}` : "") +
              (attack ? ` attack: ${attack}` : "") +
              (energy ? ` energy: ${energy}` : "") +
              (evolvesFrom ? ` evolves from: ${evolvesFrom}` : "") +
              (evolvesTo ? ` evolves to: ${evolvesTo}` : ""),
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Here are the cards that match your multi-criteria query:`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              pokemonCards.filter((card) =>
                (!name ||
                  (card.name &&
                    card.name.toLowerCase().includes(name.toLowerCase()))) &&
                (!type ||
                  (Array.isArray(card.types) &&
                    card.types.some((t) =>
                      t.toLowerCase() === type.toLowerCase()
                    ))) &&
                (!subtype ||
                  (Array.isArray(card.subtypes) &&
                    card.subtypes.some((s) =>
                      s.toLowerCase() === subtype.toLowerCase()
                    ))) &&
                (!attack ||
                  (Array.isArray(card.attacks) &&
                    card.attacks.some((a) =>
                      a.name &&
                      a.name.toLowerCase().includes(attack.toLowerCase())
                    ))) &&
                (!energy ||
                  (Array.isArray(card.attacks) &&
                    card.attacks.some((a) =>
                      a.convertedEnergyCost === Number(energy)
                    ))) &&
                (!evolvesFrom ||
                  (card.evolvesFrom &&
                    card.evolvesFrom.toLowerCase().includes(
                      evolvesFrom.toLowerCase(),
                    ))) &&
                (!evolvesTo ||
                  (Array.isArray(card.evolvesTo) &&
                    card.evolvesTo.some((e) =>
                      e.toLowerCase().includes(evolvesTo.toLowerCase())
                    )))
              ),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );

  // Effect/description search tool
  server.tool(
    "find-cards-by-effect-text",
    "Find Pokemon TCG cards by effect or description text (attack, ability, rules, or flavor text)",
    {
      effect: z.string(),
      limit: z.number().optional(),
      page: z.number().optional(),
      fieldSet: z.enum(["minimal", "standard", "full"]).optional(),
    },
    (
      { effect, limit = 20, page = 1, fieldSet = "standard" }: {
        effect: string;
        limit?: number;
        page?: number;
        fieldSet?: "minimal" | "standard" | "full";
      },
    ) => {
      // Filter cards by effect text
      const filteredCards = [...pokemonCards, ...trainerCards, ...energyCards]
        .filter((card) => {
          const q = effect.toLowerCase();
          return (
            (Array.isArray(card.rules) &&
              card.rules.some((rule) => rule.toLowerCase().includes(q))) ||
            (Array.isArray(card.abilities) &&
              card.abilities.some((ability) =>
                ability.text && ability.text.toLowerCase().includes(q)
              )) ||
            (Array.isArray(card.attacks) &&
              card.attacks.some((a) =>
                a.text && a.text.toLowerCase().includes(q)
              )) ||
            (typeof card.flavorText === "string" &&
              card.flavorText.toLowerCase().includes(q))
          );
        });

      // Apply pagination
      const paginatedResults = paginateResults(filteredCards, {
        page,
        pageSize: limit,
      });

      // Filter card fields based on fieldSet
      const filteredFieldCards = filterCardFields(
        paginatedResults.results,
        fieldSet,
      );

      // Create response with pagination metadata
      const response = {
        cards: filteredFieldCards,
        pagination: paginatedResults.pagination,
      };

      return {
        content: [{
          type: "resource",
          resource: {
            uri: `file://cards-by-effect-text.json`,
            mimeType: "application/json",
            text: JSON.stringify(response),
          },
        }],
      };
    },
  );
  server.prompt(
    "find-cards-by-effect-text",
    "Find Pokemon TCG cards by effect or description text (attack, ability, rules, or flavor text)",
    {
      effect: z.string(),
      limit: z.number().optional(),
    },
    ({ effect, limit = 20 }: { effect: string; limit?: number }) => ({
      description:
        `Find Pokemon TCG cards by effect or description text: ${effect} (limited to ${limit} results)`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find cards with effect or description: ${effect}`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text:
              `Here are the cards with effect or description matching: ${effect} (limited to ${limit} results)`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: JSON.stringify(
              [...pokemonCards, ...trainerCards, ...energyCards].filter(
                (card) => {
                  const q = effect.toLowerCase();
                  return (
                    (Array.isArray(card.rules) && card.rules.some((rule) =>
                      rule.toLowerCase().includes(q)
                    )) ||
                    (Array.isArray(card.abilities) &&
                      card.abilities.some((ability) =>
                        ability.text && ability.text.toLowerCase().includes(q)
                      )) ||
                    (Array.isArray(card.attacks) && card.attacks.some((a) =>
                      a.text && a.text.toLowerCase().includes(q)
                    )) ||
                    (typeof card.flavorText === "string" &&
                      card.flavorText.toLowerCase().includes(q))
                  );
                },
              ).slice(0, limit),
            ),
            mimeType: "application/json",
          },
        },
      ],
    }),
  );
}
