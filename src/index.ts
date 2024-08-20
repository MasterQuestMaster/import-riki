/**
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/*

The SHA changes if the file changes. The SHA is reproducible. If the SHA is the same, the file is the same.
Save the SHA to Database when importing.

*/


import { importNeoStandards } from "./import/neo-import";
import { importCardsFromGithub } from "./import/card-import";
//import { SetFileContentSchema } from "./schema/SetFileContent";

export default {
	async fetch(request, env, ctx): Promise<Response> {

		//When calling worker through the browser, it will call it twice, asking for the favicon.
		const url = new URL(request.url);
		if(url.pathname == "/favicon.ico")
			return new Response(null);

		//TODO: Think if we make separate workers for importing neo-std, cards, set infos and special rarities.
		//Probably good to have it all in one place because of boilerplate and same conditions.
		//Shared env as well.
		//Just have to carefully handle errors (sections in response) and response codes (with individual status and messages

		//const cardResponse = await importCardsFromGithub(env);
		const neoResponse = await importNeoStandards(env);
		//TODO: foil-import, set-import

		return new Response(
			JSON.stringify({
				"set-import": null,
				"neo-import": neoResponse,
				"card-import": null,//cardResponse,
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
} satisfies ExportedHandler<Env>;
