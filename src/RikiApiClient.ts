import { z, ZodIssue } from "zod"
import { SetInfo, SetInfoSchema, SetInfoUpdate } from "./schema/riki/SetInfo"
import { isJsonResponse } from "./utils"

export type RikiCardImportResponse = {
    setId: string,
    message: string,
    status: number,
    errorCount: number,
    details?: Array<{
        cardCode: string,
        cardName: string,
        status: number,
        message: string
    }>
}

export type RikiNeoImportResponse = {
    message: string,
    status: number,
    details?: {
        title: string;
        codes: string[];
        status: number;
        message: string;
    }[]
}

export type RikiSetResponse = {
    setId: string,
    status: number,
    message: string
};

export type RikiErrorResponse = {
    message: string,
    status: number
}

/**
 * Wrapper for internal Riki API.
 */
export class RikiApiClient {
    baseUrl: URL|string;
    apiKey: string;

    /**
     * Constructs a new API client to access the internal Riki API.
     * @param baseUrl Internal Riki API Base URL
     * @param apiKey Internal Riki API Key
     */
    constructor(baseUrl: URL|string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    /**
     * Import a list of cards for a specific set into the Riki-DB (existing cards are updated)
     * @param setId Shorthand setId (e.g. "W35") of the set you're trying to import.
     * @param setFileContent A JSON file shaped like the set files in WS ENG DB on GitHub.
     * @returns Response object with success or error info and details, also raw response object.
     */
    async importSetCards(setId: string, setFileContent: unknown): Promise<RikiCardImportResponse> {

        try {
            var response = await fetch(`${this.baseUrl}/sets/${setId}/cards`, {
                method: "POST",
                headers: {
                    "Authorization": this.apiKey,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(setFileContent)
            });
        }
        catch(e: any) {
            throw new Error(`Error during "importSetCards" API request for set "${setId}". ${e.message}`);
        }

        if(!isJsonResponse(response)) {
            throw new Error(`"importSetCards" API request returned an unexpected response: ${await response.text()}`);
        }

        return response.json();
    }

    /**
     * Import neo standard title/code combinations into the Riki-DB (existing are updated)
     * @param neoStdTable JSON array of neo standards with title and codes for each entry.
     * @returns Response object with success or error info and details, also raw response object.
     */
    async importNeo(neoStdTable: unknown): Promise<RikiNeoImportResponse> {
        try {
            var response = await fetch(`${this.baseUrl}/neo/`, {
                method: "POST",
                headers: {
                    "Authorization": this.apiKey,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(neoStdTable)
            });
        }
        catch(e: any) {
            throw new Error(`Error during "importNeo" API request". ${e.message}`);
        }

        if(!isJsonResponse(response)) {
            throw new Error(`"importNeo" API request returned an unexpected response: ${await response.text()}`);
        }

        return response.json();
    }

    async getAllSets(): Promise<SetInfo[]> {
        //Use this to get all shas for comparison whether we must process a set file.
        try {
            var response = await fetch(`${this.baseUrl}/sets/`, {
                method: "GET",
                headers: {
                    "Authorization": this.apiKey,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
        }
        catch(e: any) {
            throw new Error(`Error during "getAllSets" API request". ${e.message}`);
        }

        if(!isJsonResponse(response)) {
            throw new Error(`"getAllSets" API request returned an unexpected response: ${await response.text()}`);
        }

        if(response.ok) {
            const setArray = SetInfoSchema.array().parse(await response.json());
            return setArray;
        }
        else {
            const errorJson = await response.json<RikiErrorResponse>();
            throw new Error(`"getAllSets" API request failed with status ${errorJson.status}. ${errorJson.message}`);
        }
    }

    async createSet(props: SetInfo): Promise<RikiSetResponse> {
        try {
            var response = await fetch(`${this.baseUrl}/sets`, {
                method: "POST",
                headers: {
                    "Authorization": this.apiKey,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(props)
            });
        }
        catch(e: any) {
            throw new Error(`Error during "createSet" API request for set "${props.id}". ${e.message}`);
        }

        if(!isJsonResponse(response)) {
            throw new Error(`"createSet" API request returned an unexpected response: ${await response.text()}`);
        }

        return response.json();
    }

    async updateSet(setId: string, props: SetInfoUpdate): Promise<RikiSetResponse> {
        try {
            var response = await fetch(`${this.baseUrl}/sets/${setId}`, {
                method: "PUT",
                headers: {
                    "Authorization": this.apiKey,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(props)
            });
        }
        catch(e: any) {
            throw new Error(`Error during "updateSet" API request for set "${setId}". ${e.message}`);
        }

        if(!isJsonResponse(response)) {
            throw new Error(`"updateSet" API request returned an unexpected response: ${await response.text()}`);
        }

        return response.json();
    }
}