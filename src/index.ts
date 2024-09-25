/**
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


import { importNeoStandards } from "./import/neo-import";
import { importCardsFromGithub } from "./import/card-import";

export default {
	//Amount of Requests:
	//Neo: 2
	//Cards:
	//   Global: 2
	//   Per set: 5 (2 regular + 3 for set info)
	async fetch(request, env, ctx): Promise<Response> {

		//TODO: Think if we make separate workers for importing neo-std, cards, set infos and special rarities.
		//Probably good to have it all in one place because of boilerplate and same conditions.
		//Shared env as well.
		//Just have to carefully handle errors (sections in response) and response codes (with individual status and messages

		//When calling worker through the browser, it will call it twice, asking for the favicon.
		const url = new URL(request.url);
		if(url.pathname == "/favicon.ico")
			return new Response(null);
		
		//const setResponse = await importSets(env);
		const neoResponse = await importNeoStandards(env);
		const cardResponse = await importCardsFromGithub(env);

		return new Response(
			JSON.stringify({
				"neo-import": neoResponse,
				"card-import": cardResponse,
				"foil-import": null,
			}), 
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	},

	async scheduled(event, env, ctx) {
		//Console Logs can be found in Cloudflare as "Real Time Logs"
		
		//const setResponse = await importSets(env);
		//console.log("Set Response", setResponse");
		const neoResponse = await importNeoStandards(env);
		console.log("Neo Standard Import", neoResponse);
		const cardResponse = await importCardsFromGithub(env);
		console.log("Card Import", cardResponse);
	}
} satisfies ExportedHandler<Env>;