/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Octokit } from "octokit";

const GITHUB_API_URL = "https://api.github.com/"

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const octokit = new Octokit({
			auth: ""
		});

		return new Response('Hello World!');
	},
} satisfies ExportedHandler<Env>;
