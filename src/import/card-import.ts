import { RikiApiClient, RikiCardImportResponse } from "src/RikiApiClient";
import { generateBatchResponseMessageAndStatus, isJsonResponse, isStatusOk } from "src/utils";
import { getSetInfosFromWeb } from "./set-import";

import { SetInfo } from "src/schema/riki/SetInfo";
import { SetFileSchema } from "src/schema/SetFile";
import { FolderContentSchema } from "src/schema/FolderContent";

import { WS_ENG_DB_GITHUB_URL } from "src/config/import-config.json";

export type LocalCardImportResponse = {
    message: string,
    status: number,
    details?: Array<{
        fileName: string,
        setId?: string,
        status: number,
        message: string,
        details?: RikiCardImportResponse["details"]
    }>
}

export async function importCardsFromGithub(env: Env): Promise<LocalCardImportResponse> {

    //TODO: Use Batch-Transactions for inserting all cards in a set at once.
    // https://docs.astro.build/en/guides/astro-db/#batch-transactions
    // 

    // try {
        const folderResponse = await fetch(WS_ENG_DB_GITHUB_URL, {
            headers: {
                "Accept": "application/vnd.github+json",
                "User-Agent": "Import-Riki"
            }
        });

        //we can't throw in child func to prevent parent func from continuing, so use a bool-check-func instead.
        if(!isJsonResponse(folderResponse)) {
            throw new Error(`Github folder request returned unexpected response: ${await folderResponse.text()}`);
        }

        //We parse according to the specified schema. Throws error if not successful.
        //TODO: This was reduced to 1 element for testing. Remove if we want to import all sets.
        const folderContentArray = FolderContentSchema.parse(await folderResponse.json()).slice(0,1);

        const rikiClient = new RikiApiClient(env.RIKI_API_BASE_URL, env.RIKI_INTERNAL_API_KEY);

        //Get sets to check for SHAs
        const setMap = createSetMap(await rikiClient.getAllSets());

        let countErrors = 0;
        let countUnchanged = 0;

        //For testing we only use the first file in the array.
        const responses:LocalCardImportResponse["details"] = await Promise.all(
            folderContentArray.map(async entry => {
                let setId;
        
                // try {
                    setId = getSetIdFromFileName(entry.name);
        
                    if(!setId) {
                        throw new Error(`bad filename structure ("${entry.name}"). cannot get setId.`);
                    }

                    console.log("import start: " + setId);

                    const setInfo = setMap[setId];

                    //Compare SHA to see if update is necessary.
                    if(setInfo && setInfo.sha === entry.sha) {
                        countUnchanged ++;
                        
                        //Return preemptively since the file is the same.
                        return {
                            fileName: entry.name,
                            setId: setId,
                            status: 304, /* not modified */
                            message: "The set file is already imported and no updates are needed."
                        };
                    }
        
                    //Get content of JSON file from Github (do not check Content-Type because it's not JSON)
                    const fileResponse = await fetch(entry.download_url);
                    const fileContent = SetFileSchema.parse(await fileResponse.json());

                    //Import the file into the Riki-DB.
                    const responseJson = await rikiClient.importSetCards(setId, fileContent);
                    
                    //Check for success (200) before updating SHA. We count 207 (multi-status) as error and retry this file next time.
                    if(responseJson.status == 200) {
                        //Find additional set infos from WS-TCG website
                        const sampleCard = fileContent.find((card) => card.rarity != "PR" && card.rarity != "TD");
                        const additionalSetInfos = sampleCard && await getSetInfosFromWeb(sampleCard?.code);

                        //Update set hash in DB (also update additional set infos, if any).
                        const shaResponse = await rikiClient.updateSet(setId, {
                            ...additionalSetInfos, 
                            sha: entry.sha
                        });

                        if(!isStatusOk(shaResponse.status)) {
                            return {
                                fileName: entry.name,
                                setId: setId,
                                status: shaResponse.status,
                                message: `Card import was successful, but SHA update in Set table failed: ${shaResponse.message}`,
                                details: responseJson.details
                            };
                        }
                    }
                    else {
                        countErrors++;
                    }
        
                    return {
                        fileName: entry.name,
                        setId: setId,
                        status: responseJson.status,
                        message: responseJson.message,
                        details: responseJson.details
                    };
                // }
                // catch(e: any) {
                //     return {
                //         fileName: entry.name,
                //         setId: setId,
                //         status: "error",
                //         message: e.message
                //     }
                // }
            }
        ));

        const overallResponseStatus = generateBatchResponseMessageAndStatus(countErrors, countUnchanged, folderContentArray.length);

        return {
            message: overallResponseStatus.message,
            status: overallResponseStatus.status,
            details: responses
        }
    // }
    // catch(e: any) {
    //     return {
    //         status: "error",
    //         message: e.message
    //     }
    // }
}

function getSetIdFromFileName(fileName:string) {
	const match = /(?<=_)[A-Z0-9]+(?=\.json)/.exec(fileName);
	return match?.[0];
}

function createSetMap(setList: SetInfo[]) {
    return setList.reduce((acc, set) => {
        acc[set.id] = set;
        return acc;
    }, {} as Record<string,SetInfo>);
}