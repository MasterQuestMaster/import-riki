/*
Sometimes TD has different product name, like Bang Dream My Go vs Countdown Collection (WE42).
PR will be kept in their set instead of the Promo Set, but will have their special setName.
*/

import { parse as parseHtml } from "node-html-parser";
import { parse as parseDate } from "date-fns";

import { CARD_DETAILS_EN_URL } from "src/config/import-config.json";

//Called from card-import
export async function getSetInfosFromWeb(sampleCardNo: string) {
    let releaseDate: Date|null = null;
    let productType: string|null = null;

    //Get the WS-TCG Card List Detail Page for the sample card.
    const cardDetailResponse = await fetch(`${CARD_DETAILS_EN_URL}?cardno=${encodeURIComponent(sampleCardNo)}`);

    if(!cardDetailResponse.ok) {
        throw new Error(`Request to the WS-TCG card details page failed (${cardDetailResponse.status} ${cardDetailResponse.statusText})`);
    }

    //Use the set info on the bottom of the card detail page to get our infos.
    const cardDetailHtml = parseHtml(await cardDetailResponse.text());
    const releaseDateStr = cardDetailHtml.querySelector(".p-cards__cardset-item .date")?.innerText;

    if(releaseDateStr) {
        //On the card detail page, the date is formatted like "Aug. 2, 2024".
        releaseDate = parseDate(releaseDateStr, "MMM. d, y", new Date());
    }

    //Get the URL of the "Product Page" button to the right of the Date
    const productPageUrl = cardDetailHtml.querySelector(".p-cards__cardset-link a[href*='/products']")?.getAttribute("href");

    if(productPageUrl) {
        const productPageResponse = await fetch(productPageUrl);

        if(!productPageResponse.ok) {
            throw new Error(`Request to the WS-TCG product page failed (${cardDetailResponse.status} ${cardDetailResponse.statusText})`)
        }

        const productPageHtml = parseHtml(await productPageResponse.text());
        productType = productPageHtml.querySelector(".p-products__category")?.innerText ?? null;

        //TODO: We could potentially also get the image from here. (".p-products__wrapper img")
        //We can save it in the database and then display it in the Set Overview on hover, on on the set detail page.
        //If we do, we need a default picture for sets without an image as well.
    }

    return {
        releaseDate: releaseDate,
        type: productType
    };
}