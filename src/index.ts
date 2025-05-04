/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/**
 * Progress bar function to display the progress of a task. Uses unicode block elements to create a visual representation of the progress.
 */
function progressBar(fraction: number) {
	const filledBlock = '\u2588'; // Full block
	const emptyBlock = '\u25AF'; // Light shade
	const totalBlocks = 30; // Total number of blocks in the progress bar
	let filledBlocks = Math.round(fraction * totalBlocks);
	if (filledBlocks < 0) {
		filledBlocks = 0;
	}
	const emptyBlocks = totalBlocks - filledBlocks;
	const filled = filledBlock.repeat(filledBlocks);
	const empty = emptyBlock.repeat(emptyBlocks);
	const percentage = Math.round(fraction * 100);
	return `[${filled}${empty}] ${percentage < 0 ? 0 : percentage}%`;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// console.log(env.NOTION_API_KEY);
		// return new Response('Hello World!');
		// fetch something from notion api
		const response = await fetch('https://api.notion.com/v1/databases/1de4e76f11618015ac3be8be6dd92217/query', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.NOTION_KEY}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json',
			},
			body: '{}',
		});

		if (!response.ok) {
			console.error('Error fetching from Notion API:', response.status, response.statusText);
			return new Response(`Error fetching from Notion API ${response.status}, ${response.statusText}`, { status: 500 });
		}
		const data = await response.json();
		const results = data.results;
		const items = results.map((item: any) => {
			let name = item.properties.Name.title[0].text.content;
			// console.log(name);
			let progress = item.properties.Number.formula.number;
			let endDate = item.properties.End.date.start;
			return `${endDate}: ${name} ${progressBar(progress)}`;
		});

		const responseText = items.join('\n');
		return new Response(responseText);
	},
} satisfies ExportedHandler<Env>;
