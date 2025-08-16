import { Octokit } from "https://esm.sh/octokit?dts";

export const getDownloadUrls = async (octokit: Octokit, path: string) => {
    const iterator = await octokit.paginate.iterator(octokit.rest.repos.getContent, {
        owner: "PokemonTCG",
        repo: "pokemon-tcg-data",
        path: path,
    });

    const downloadUrls = [];
    for await (const {data} of iterator) {
        const files = data as any;
        if (Array.isArray(files)) {
            for (const item of Array.from(files)) {
                if (item.type === 'file' && item.name) {
                    downloadUrls.push(item.download_url);
                }
            }
        }
    }
    return downloadUrls;
};

export const fetchFiles = (octokit: Octokit, downloadUrls: string[]) => {
    const downloadPromises = downloadUrls.map(url => octokit.request({
        method: 'GET',
        url: url,
        headers: {
            'Accept': 'application/vnd.github.v3.raw'
        }
    }));
    return Promise.all(downloadPromises);
};