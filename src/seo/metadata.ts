import type { Metadata } from 'next';
import type { Locale } from '@/i18n';
import { guides, localizedPath, origin, type PageId } from './content';
const titles = {fr:{'':'Application nutrition, calories et suivi du poids | CalX',privacy:'Politique de confidentialité | CalX',terms:'Conditions d’utilisation | CalX'},en:{'':'Nutrition, calorie and weight tracking app | CalX',privacy:'Privacy policy | CalX',terms:'Terms of use | CalX'}};
const descriptions = {fr:{'':'Suivez calories, protéines, poids et séances avec CalX. Journal alimentaire, analyse des repas par photo et menus pour vos objectifs personnels.',privacy:'Consultez la politique de confidentialité de CalX, les informations sur vos données personnelles et vos droits.',terms:'Consultez les conditions d’utilisation de CalX et les informations sur le fonctionnement du service.'},en:{'':'Track calories, protein, weight and workouts with CalX. Food diary, meal photo analysis and meal planning for your personal goals.',privacy:'Read the CalX privacy policy, information about personal data and your rights.',terms:'Read the CalX terms of use and information about how the service works.'}};
export function pageMetadata(locale:Locale,id:PageId):Metadata {
 const guide=guides[locale].find(g=>g.id===id);
 const title=guide ? guide.title+' | CalX' : titles[locale][id as ''|'privacy'|'terms'];
 const description=guide?.description??descriptions[locale][id as ''|'privacy'|'terms'];
 const url=origin+localizedPath(locale,id);
 return {title:{absolute:title},description,alternates:{canonical:url,languages:{fr:origin+localizedPath('fr',id),en:origin+localizedPath('en',id),'x-default':origin+localizedPath('fr',id)}},robots:{index:true,follow:true},openGraph:{type:'website',locale:locale==='fr'?'fr_FR':'en_US',alternateLocale:locale==='fr'?'en_US':'fr_FR',siteName:'CalX',title,description,url,images:[{url:origin+'/officel_web_logo.png',alt:'CalX'}]},twitter:{card:'summary',title,description,images:[origin+'/officel_web_logo.png']}};
}
