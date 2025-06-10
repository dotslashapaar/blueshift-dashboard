import ChallengePageContainer from "@/app/components/Challenges/ChallengePageContainer";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";

interface ChallengePageProps {
  params: Promise<{
    challengeSlug: string;
    pageSlug: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const { challengeSlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const pathname = getPathname({
    locale,
    href: `/challenges/${challengeSlug}`,
  });

  const ogImage = {
    src: `/graphics/challenge-banners/${challengeSlug}.png`,
    width: 1200,
    height: 630,
  };

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      type: "website",
      description: t("description"),
      siteName: t("title"),
      url: pathname,
      images: [
        {
          url: ogImage.src,
          width: ogImage.width,
          height: ogImage.height,
        },
      ],
    },
  };
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  return <ChallengePageContainer params={params} />;
}
