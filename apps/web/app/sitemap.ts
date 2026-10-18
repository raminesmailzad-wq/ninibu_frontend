import type { MetadataRoute } from "next";
import { getPublicArticles, getPublicExperiences, SITE_URL } from "@/lib/public-site";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{const [a,e]=await Promise.all([getPublicArticles(100),getPublicExperiences(100)]);const base:MetadataRoute.Sitemap=[{url:`${SITE_URL}/`,changeFrequency:"weekly",priority:1},{url:`${SITE_URL}/articles`,changeFrequency:"daily",priority:.8},{url:`${SITE_URL}/experiences`,changeFrequency:"daily",priority:.7}];return [...base,...a.items.map(x=>({url:`${SITE_URL}/articles/${x.slug}`,lastModified:x.updated_at,changeFrequency:"monthly" as const,priority:.7})),...e.items.map(x=>({url:`${SITE_URL}/experiences/${x.slug}`,lastModified:x.published_at,changeFrequency:"monthly" as const,priority:.6}))]}
