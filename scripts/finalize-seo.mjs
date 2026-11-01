import fs from 'node:fs/promises';
import path from 'node:path';
// Next static export shares the legacy root layout. Set the HTML language in
// each localized export; the matching I18nProvider uses the same fixed locale.
for(const locale of ['fr','en']) {
 async function update(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())await update(file);else if(e.name.endsWith('.html')){const html=await fs.readFile(file,'utf8');await fs.writeFile(file,html.replace(/<html lang="[^"]*"/,`<html lang="${locale}"`));}}}
 await update(path.join('out',locale));
}
for(const dir of ['out/dashboard','out/cockpit']){
 async function exclude(base){for(const e of await fs.readdir(base,{withFileTypes:true})){const file=path.join(base,e.name);if(e.isDirectory())await exclude(file);else if(e.name.endsWith('.html')){let html=await fs.readFile(file,'utf8');html=html.replace(/<meta name="robots"[^>]*>/g,'');await fs.writeFile(file,html.replace('</head>','<meta name="robots" content="noindex, nofollow"/></head>'));}}}
 await exclude(dir);
}
console.log('Localized HTML languages and private-page noindex finalized.');
