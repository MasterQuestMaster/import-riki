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

import { FolderContentSchema } from "./schema/FolderContent";
//import { SetFileContentSchema } from "./schema/SetFileContent";
import path from "node:path";

const RIKI_API_BASE_URL = "https://ws-riki.pages.dev/api/internal";

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const folderResponse = await fetch("https://api.github.com/repos/CCondeluci/WeissSchwarz-ENG-DB/contents/DB");
		//We parse according to the specified schema. Throws error if not successful.
		const folderContentArray = FolderContentSchema.parse(await folderResponse.json());

		let errorList = [];

		folderContentArray.forEach(async entry => {
			try {
				//Get content of JSON file from Github.
				const fileResponse = await fetch(entry.download_url);
				const fileContent = await fileResponse.json();
				const fileNameParts = path.parse(entry.name).name.split("_");

				if(fileNameParts.length <= 1) {
					throw new Error(`bad filename structure ("${entry.name}"). cannot get set id.`);
				}

				//Call the Riki-API
				const response = await fetch(`${RIKI_API_BASE_URL}/set/${fileNameParts[1]}/cards`, {
					method: "POST",
					headers: {
						"Authentication": env.RIKI_INTERNAL_API_KEY,
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					body: JSON.stringify(fileContent)
				});
			}
			catch(e) {
				console.error(e);
				errorList.push(e);
			}
		});



		return new Response('Hello World!');
	},
} satisfies ExportedHandler<Env>;
