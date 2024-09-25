
/**
 * Throws an error if the response is not content-type "application/json".
 * @param response Response from fetch.
 * @param requestName Will be displayed in the error message.
 */
export function isJsonResponse(response: Response) {
    const contentType = response.headers.get("content-type") ?? "";
    return contentType.includes("application/json");
}

export function isStatusOk(statusCode: number) {
    return statusCode >= 200 && statusCode <= 299;
}

export function generateBatchResponseMessageAndStatus(batchErrorCount: number, batchUnchangedCount: number, batchTotal: number) {
    if(batchUnchangedCount == 0 && batchErrorCount == 0)
        return {
            status: 200, /* 200: OK */
            message: `All ${batchTotal} items were successfully inserted/updated`
        };
    else if(batchErrorCount == batchTotal)
        return { 
            status: 500, /* 500: Internal Server error */
            message: `All ${batchTotal} items failed to insert/update.`
        };
    else if(batchUnchangedCount == batchTotal)
        return { 
            status: 304, /* 304: Not modified */
            message: `All ${batchTotal} items were unchanged and didn't need an update.`
        };
    else
        return {
            status: 207,
            message: `Out of ${batchTotal} items, ${batchErrorCount} failed to insert/update and ${batchUnchangedCount} did not need an update.`
        }
}