import type { MetadataRoute } from 'next';
import { localizedPath, origin, pageIds } from '@/seo/content';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
 return (['fr','en'] as const).flatMap(locale=>pageIds.map(id=>({url:origin+localizedPath(locale,id),alternates:{languages:{fr:origin+localizedPath('fr',id),en:origin+localizedPath('en',id)}}})));
}
