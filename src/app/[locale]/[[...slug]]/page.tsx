import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n';
import { I18nProvider } from '@/i18n';
import HomePage from '@/components/public/HomePage';
import PrivacyPage from '@/components/public/PrivacyPage';
import TermsPage from '@/components/public/TermsPage';
import GoalPage from '@/components/public/GoalPage';
import { findPageId, guides, localizedPath, origin, pageIds } from '@/seo/content';
import { pageMetadata } from '@/seo/metadata';
export const dynamicParams = false;
export function generateStaticParams() {
 return (['fr','en'] as const).flatMap(locale=>pageIds.map(id=>({locale,slug:localizedPath(locale,id).split('/').filter(Boolean).slice(1)})));
}
type Props={params:Promise<{locale:string;slug?:string[]}>};
async function resolve(params:Props['params']) {
 const {locale,slug=[]}=await params;
 if(locale!=='fr'&&locale!=='en')notFound();
 const id=findPageId(locale,slug.join('/'));
 if(id===undefined)notFound();
 return {locale:locale as Locale,id};
}
export async function generateMetadata({params}:Props){const {locale,id}=await resolve(params);return pageMetadata(locale,id);}
export default async function Page({params}:Props){
 const {locale,id}=await resolve(params);const url=origin+localizedPath(locale,id);
 const schema=id===''?{'@context':'https://schema.org','@type':'SoftwareApplication',name:'CalX',url,applicationCategory:'HealthApplication',operatingSystem:'iOS, Android',inLanguage:locale,description:locale==='fr'?'Application de suivi nutritionnel, du poids et de l’activité.':'Nutrition, weight and activity tracking app.'}:{'@context':'https://schema.org','@type':'WebPage',url,inLanguage:locale,name:guides[locale].find(g=>g.id===id)?.title??(id==='privacy'?'Privacy policy':'Terms of use'),isPartOf:{'@type':'WebSite',name:'CalX',url:origin}};
 return <I18nProvider initialLocale={locale}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}} />{id===''?<HomePage/>:id==='privacy'?<PrivacyPage/>:id==='terms'?<TermsPage/>:<GoalPage locale={locale} id={id}/>}</I18nProvider>;
}
