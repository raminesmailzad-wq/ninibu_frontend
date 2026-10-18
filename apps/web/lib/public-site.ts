import type {
  KnowledgeContentListResponse,
  KnowledgeDetail,
  PublicCommunityExperience,
  PublicCommunityExperienceList,
} from "@ninibu/types";
import { rawBackend } from "@/lib/backend";

export const SITE_URL = (process.env.NEXT_PUBLIC_NINIBU_SITE_URL || "https://ninibu.com").replace(/\/$/, "");
export const PWA_URL = (process.env.NEXT_PUBLIC_NINIBU_PWA_URL || "https://app.ninibu.com").replace(/\/$/, "");
export const CAFEBAZAAR_URL = (process.env.NEXT_PUBLIC_NINIBU_CAFEBAZAAR_URL || "https://cafebazaar.ir/app/com.ninibu.app").trim();

export async function getPublicArticles(limit = 12, page = 1) {
  try {
    const result = await rawBackend<KnowledgeContentListResponse>(`/api/v1/content?language=fa&page=${page}&limit=${limit}`);
    return result.body.success ? result.body.data : { items: [], pagination: { page, limit, total: 0, total_pages: 0 } };
  } catch {
    return { items: [], pagination: { page, limit, total: 0, total_pages: 0 } } as KnowledgeContentListResponse;
  }
}

export async function getPublicArticle(slug: string): Promise<KnowledgeDetail | null> {
  try {
    const result = await rawBackend<KnowledgeDetail>(`/api/v1/content/${encodeURIComponent(slug)}`);
    return result.body.success ? result.body.data : null;
  } catch {
    return null;
  }
}

export async function getPublicExperiences(limit = 12, page = 1): Promise<PublicCommunityExperienceList> {
  try {
    const result = await rawBackend<PublicCommunityExperienceList>(`/api/v1/public/community/experiences?page=${page}&limit=${limit}`);
    return result.body.success ? result.body.data : { items: [], pagination: { page, limit, total: 0, total_pages: 0 } };
  } catch {
    return { items: [], pagination: { page, limit, total: 0, total_pages: 0 } };
  }
}

export async function getPublicExperience(slug: string): Promise<PublicCommunityExperience | null> {
  try {
    const result = await rawBackend<PublicCommunityExperience>(`/api/v1/public/community/experiences/${encodeURIComponent(slug)}`);
    return result.body.success ? result.body.data : null;
  } catch {
    return null;
  }
}

export function faDate(value?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
  } catch {
    return "";
  }
}

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
