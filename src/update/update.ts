import { Octokit } from "https://esm.sh/octokit?dts";
import { fetchFiles, getDownloadUrls } from "./download.ts";
import { existsSync } from 'jsr:@std/fs';
import { Card } from "../../types.d.ts";

export const updateCards = async (octokit: Octokit) => {
    const cardDownloadUrls = await getDownloadUrls(octokit, "cards/en");
    const cardFiles = await fetchFiles(octokit, cardDownloadUrls);

    const trainerCards: Card[] = [];
    const pokemonCards: Card[] = [];
    const energyCards: Card[] = [];

    if (!existsSync("./data/cards/")) {
        await Deno.mkdir("./data/cards/", { recursive: true });
    }
    cardFiles.forEach(({data}) => {
        const dataStr = data.toString();
        const dataArr = JSON.parse(dataStr) as Card[];

        dataArr.forEach((card: Card) => {
            if (card.legalities?.standard !== 'Legal') {
                return;
            }
            if (card.supertype === "Trainer") {
                trainerCards.push(card);
            } else if (card.supertype === "Pokémon") {
                pokemonCards.push(card);
            } else if (card.supertype === "Energy") {
                energyCards.push(card);
            }
        });
    });
    console.log("Found", trainerCards.length, "legal trainer cards");
    console.log("Found", pokemonCards.length, "legal pokemon cards");
    console.log("Found", energyCards.length, "legal energy cards");

    // Write the categorized card data to separate files
    return Promise.all([
        await Deno.writeTextFile("./data/cards/trainer-cards.json", JSON.stringify(trainerCards, null, 2)),
        await Deno.writeTextFile("./data/cards/pokemon-cards.json", JSON.stringify(pokemonCards, null, 2)),
        await Deno.writeTextFile("./data/cards/energy-cards.json", JSON.stringify(energyCards, null, 2))
    ]);
};

export const updateSets = async (octokit: Octokit) => {
    const setDownloadUrl = 'https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/refs/heads/master/sets/en.json';
    const setFiles = await fetchFiles(octokit, [setDownloadUrl]);
    
    setFiles.forEach(async ({data}) => {
       await Deno.writeTextFile(`./data/cards/sets.json`, data.toString(), {create: true});
    });
};