// Handles loading and providing access to card data
import { Card, CardSet } from "../types.d.ts";
import path from "node:path";
import { readFileSync } from "node:fs";

export const pokemonCards: Card[] = [];
export const trainerCards: Card[] = [];
export const energyCards: Card[] = [];
export const sets: CardSet[] = [];

const loadJsonData = (filePath: string): object | Array<unknown> | null => {
  filePath = path.join(import.meta.dirname ?? '', filePath);
  try {
    const data = readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading JSON data from ${filePath}:`, error);
    return null;
  }
};

export const loadCardData = () => {
  pokemonCards.splice(0, pokemonCards.length, ...loadJsonData("../data/cards/pokemon-cards.json") as Card[]);
  trainerCards.splice(0, trainerCards.length, ...loadJsonData("../data/cards/trainer-cards.json") as Card[]);
  energyCards.splice(0, energyCards.length, ...loadJsonData("../data/cards/energy-cards.json") as Card[]);
  sets.splice(0, sets.length, ...loadJsonData("../data/cards/sets.json") as CardSet[]);
  return { pokemonCards, trainerCards, energyCards, sets };
}