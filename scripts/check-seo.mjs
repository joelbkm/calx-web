import fs from 'node:fs/promises';import assert from 'node:assert/strict';import path from 'node:path';
const sitemap=await fs.readFile('out/sitemap.xml','utf8');const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,16);assert.equal(new Set(urls).size,16);
const all=new Set(urls);const titles=new Set();
for(const url of urls){assert(url.startsWith('https://calx.be/'));const p=new URL(url).pathname;const html=await fs.readFile(path.join('out',p,'index.html'),'utf8');const locale=p.split('/')[1];assert(html.includes(`<html lang="${locale}"`),url);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,url);assert(html.includes(`rel="canonical" href="${url}"`),url);assert(!html.includes('noindex'),url);const title=html.match(/<title>(.*?)<\/title>/)?.[1];assert(title);assert(!titles.has(title),'duplicate title '+title);titles.add(title);
 const alternatives=[...html.matchAll(/<link rel="alternate"[^>]*href="([^"]+)"/g)].map(m=>m[1]);assert.equal(alternatives.length,3,url);for(const alt of alternatives)assert(all.has(alt),alt);
 for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))JSON.parse(m[1]);
 for(const m of html.matchAll(/href="(\/(?:fr|en)\/[^"?#]*)"/g)){assert(all.has('https://calx.be'+m[1]),'broken localized link '+m[1]);}
}
assert(!/dashboard|cockpit|profile|squad/.test(sitemap));
for(const p of ['out/dashboard/index.html','out/cockpit/admin/index.html'])assert((await fs.readFile(p,'utf8')).includes('content="noindex, nofollow"'));
const robots=await fs.readFile('out/robots.txt','utf8');assert(robots.includes('Sitemap: https://calx.be/sitemap.xml'));assert(!robots.includes('calx.com'));
console.log('16 public pages passed: readable HTML, unique titles, canonical links, language alternatives, internal links and private-page exclusions.');
