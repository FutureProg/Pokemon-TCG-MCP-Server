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

export const pokemonCards = loadJsonData("../data/Standard-Pokemon-Cards-2025-04-10T01-35-31-480Z.json") as Card[];
export const trainerCards = loadJsonData("../data/Standard-Trainer-Cards-2025-04-10T01-32-57-466Z.json") as Card[];
export const energyCards = loadJsonData("../data/Standard-Energy-Cards-2025-04-10T01-36-14-513Z.json") as Card[];
