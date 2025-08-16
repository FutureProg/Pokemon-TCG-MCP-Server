import { Octokit } from "https://esm.sh/octokit?dts";
import { fetchFiles, getDownloadUrls } from "./download.ts";
import { existsSync } from 'jsr:@std/fs';

export const updateCards = async (octokit: Octokit) => {
    const cardDownloadUrls = await getDownloadUrls(octokit, "cards/en");
    const cardFiles = await fetchFiles(octokit, cardDownloadUrls);
    
    if (!existsSync("./data/cards/")) {
        await Deno.mkdir("./data/cards/", { recursive: true });
    }
    cardFiles.forEach(async ({data}, index) => {
       await Deno.writeTextFile(`./data/cards/cards-file-${index}.json`, data.toString(), {createNew: true});
    });
};

const octo = new Octokit({
    auth: Deno.env.get("GITHUB_API_KEY")
});
await updateCards(octo);