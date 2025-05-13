import '@cloudflare/workers-types';
import puppeteer from '@cloudflare/puppeteer';

interface Env {
	MYBROWSER: Fetcher;
}

export default {
	async fetch(request, env): Promise<Response> {
		const browser = await puppeteer.launch(env.MYBROWSER);
		const page = await browser.newPage();
		await page.goto('https://example.com');
		const metrics = await page.metrics();
		await browser.close();
		return Response.json(metrics);
	},
} satisfies ExportedHandler<Env>;
