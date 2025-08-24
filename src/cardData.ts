// Handles loading and providing access to card data
import { Card } from "../types.d.ts";
import path from "node:path";
import { readFileSync } from "node:fs";

const loadJsonData = (filePath: string): any => {
  filePath = path.join(import.meta.dirname ?? '', filePath);
  try {
    const data = readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading JSON data from ${filePath}:`, error);
    return null;
  }
};

export const pokemonCards = loadJsonData("../data/cards/pokemon-cards.json") as Card[];
export const trainerCards = loadJsonData("../data/cards/trainer-cards.json") as Card[];
export const energyCards = loadJsonData("../data/cards/energy-cards.json") as Card[];
