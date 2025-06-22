import { Env } from '../index';

type NotionResponse = {
	results: Array<{
		properties: any;
	}>;
};

/**
 * Render a text-based progress bar for a fraction between 0 and 1.
 */
function progressBar(fraction: number): string {
	const filledBlock = '\u2588';
	const emptyBlock = '\u25AF';
	const totalBlocks = 30;
	const filledCount = Math.max(0, Math.min(totalBlocks, Math.round(fraction * totalBlocks)));
	const emptyCount = totalBlocks - filledCount;
	const filled = filledBlock.repeat(filledCount);
	const empty = emptyBlock.repeat(emptyCount);
	const percentage = Math.max(0, Math.min(100, Math.round(fraction * 100)));
	return `[${filled}${empty}] ${percentage}%`;
}

/**
 * Handler for the "/notion" endpoint. Queries a Notion database,
 * formats each entry with its end date, name, and a progress bar.
 */
export async function notionHandler(env: Env): Promise<Response> {
	const apiUrl = 'https://api.notion.com/v1/databases/1de4e76f11618015ac3be8be6dd92217/query';

	const resp = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.NOTION_KEY}`,
			'Notion-Version': '2022-06-28',
			'Content-Type': 'application/json',
		},
		body: '{}',
	});

	if (!resp.ok) {
		console.error('Notion API error:', resp.status, resp.statusText);
		return new Response(`Error fetching from Notion API: ${resp.status} ${resp.statusText}`, { status: 500 });
	}

	const data: NotionResponse = await resp.json();
	const lines = data.results.map((item) => {
		const name = item.properties.Name?.title?.[0]?.text?.content ?? 'Unnamed';
		const progress = item.properties.Number?.formula?.number ?? 0;
		const endDate = item.properties.End?.date?.start ?? 'unknown-date';
		return `${endDate}: ${name} ${progressBar(progress)}`;
	});

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
