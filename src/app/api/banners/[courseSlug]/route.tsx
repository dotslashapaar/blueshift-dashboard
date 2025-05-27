import { generateBannerResponse } from "@/lib/banners/banner-generator";

export const dynamic = 'force-static';

export async function GET(_request: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  return generateBannerResponse(courseSlug);
}
