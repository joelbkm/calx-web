import type { MetadataRoute } from 'next';
import { origin } from '@/seo/content';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
 return {rules:{userAgent:'*',allow:'/',disallow:['/dashboard','/api/','/cockpit']},sitemap:`${origin}/sitemap.xml`};
}
