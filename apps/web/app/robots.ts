import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/public-site";
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:["/","/articles/","/experiences/"],disallow:["/admin/","/dashboard/","/profile/","/health/","/maternal-health/","/community/","/services/","/shop/","/discover/","/api/"]},sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL}}
