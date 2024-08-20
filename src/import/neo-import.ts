//This should read the Deck Construction rules site: https://en.ws-tcg.com/rules/deck/
//Save the name of the group and its set codes (wild cards allowed like F**) in the DB.
//Maybe we add a neo-standard id in set-table.
//the names+ids are in a table, along with allowed set codes in the same table.
//we should allow finding a neo-standard from any of its allowed set codes, 
//so we don't have to define a short name manually.

import { parse, HTMLElement } from "node-html-parser";
import { NEO_STANDARD_EN_URL } from "src/config/import-config.json";
import { RikiApiClient, RikiNeoImportResponse } from "src/RikiApiClient";

export type LocalNeoImportResponse = {
    status: number,
    message: string,
    details?: RikiNeoImportResponse["details"]
}

export async function importNeoStandards(env: Env): Promise<LocalNeoImportResponse> {

    try {
        var neoStdTable = await getNeoStandardsFromWeb();
    }
    catch(e: any) {
        return {
            status: 500,
            message: `Failed to load Neo Standards from WS-TCG. ${e.message}`
        };
    }

    try {
        const rikiClient = new RikiApiClient(env.RIKI_API_BASE_URL, env.RIKI_INTERNAL_API_KEY);
        const responseJson = await rikiClient.importNeo(neoStdTable);

        return {
            status: responseJson.status,
            message: responseJson.message,
            details: responseJson.details
        };
    }
    catch(e: any) {
        return {
            status: 500,
            message: e.message
        };
    }

}
 
export async function getNeoStandardsFromWeb() {
    //Load the deck construction website
    const deckConstrResponse = await fetch(NEO_STANDARD_EN_URL);

    if(!deckConstrResponse.ok) {
        throw new Error(`Request to the WS-TCG page failed (${deckConstrResponse.status} ${deckConstrResponse.statusText})`);
    }

    const deckConstrHtml = parse(await deckConstrResponse.text());
    //Find the "List of Titles" header.
    const titleListHeader = deckConstrHtml.querySelectorAll("h4").filter(h4 => h4.textContent.includes("List of Titles"));
    
    //Get the weiss table (directly after the header)
    const weissTableContainer = titleListHeader[0].nextElementSibling;
    const weissTableData = getTableData(weissTableContainer, "Title (Weiß Side)");

    //Get the schwarz table (directly after the weiss table)
    const schwarzTableContainer = titleListHeader[0].nextElementSibling?.nextElementSibling ?? null;
    const schwarzTableData = getTableData(schwarzTableContainer, "Title (Schwarz Side)");

    //Combine the W/S tables into 1 array.
    return weissTableData.concat(schwarzTableData);
}

function getTableData(tableContainer: HTMLElement|null, tableName: string) {
    const tableTitle = tableContainer?.querySelector("tr:first-child td:first-child span")?.textContent;

    if(!tableContainer || tableTitle !== tableName) {
        throw new Error(`${tableName} table not found`);
    }

    const rows = tableContainer?.querySelectorAll("tr:not(:first-child)");
    const rowData = Array.from(rows).map(row => (
        {
            title: row.querySelector("td:first-child")?.textContent?.trim(),
            codes: row.querySelector("td:last-child")?.textContent?.split(",")?.map(code => code.trim())
        }
    ));

    return rowData;
}