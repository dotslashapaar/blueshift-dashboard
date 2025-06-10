import { getTranslations } from "next-intl/server";
import MdxLayout from "@/app/mdx-layout";
import { getChallenge } from "@/app/utils/mdx";
import { ChallengeMetadata, challengeColors } from "@/app/utils/challenges";
import Icon from "@/app/components/Icon/Icon";
import Divider from "@/app/components/Divider/Divider";
import TableOfContents from "@/app/components/TableOfContents/TableOfContents";
import { Link } from "@/i18n/navigation";
import Button from "@/app/components/Button/Button";
import LessonTitle from "@/app/components/LessonTitle/LessonTitle";
import CrosshairCorners from "@/app/components/Graphics/CrosshairCorners";
import { notFound } from "next/navigation";
import { Connection, PublicKey } from "@solana/web3.js";
import { decodeCoreCollectionNumMinted } from "@/lib/nft/decodeCoreCollectionNumMinted";
import ContentPagination from "@/app/components/CoursesContent/ContentPagination";

interface ChallengePageProps {
  params: Promise<{
    challengeSlug: string;
    pageSlug: string;
    locale: string;
  }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const t = await getTranslations();
  const { challengeSlug, pageSlug, locale } = await params;

  let Page;
  let challengeMetadata: ChallengeMetadata | undefined;
  try {
    challengeMetadata = await getChallenge(challengeSlug);
    if (!challengeMetadata) {
      console.error(`No metadata found for challenge: ${challengeSlug}`);
      notFound();
    }

    const pageExists = challengeMetadata.pages?.some(
      (p) => p.slug === pageSlug,
    );
    if (!pageExists) {
      notFound();
    }

    const mdxModule = await import(
      `@/app/content/challenges/${challengeSlug}/${locale}/pages/${pageSlug}.mdx`
    );

    Page = mdxModule.default;
  } catch (error) {
    console.error(error);
    notFound();
  }

  if (!challengeMetadata) {
    console.error(`No metadata found for challenge: ${challengeSlug}`);
    notFound();
  }

  const currentPageIndex = challengeMetadata.pages?.findIndex(
    (p) => p.slug === pageSlug,
  );
  const nextPage =
    currentPageIndex !== undefined &&
    currentPageIndex > -1 &&
    challengeMetadata.pages
      ? challengeMetadata.pages[currentPageIndex + 1]
      : null;

  const challengePageTitle = t(`challenges.${challengeSlug}.title`);
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;

  if (!rpcEndpoint) {
    throw new Error("NEXT_PUBLIC_RPC_ENDPOINT is not set");
  }

  let collectionSize: number | null = null;

  const collectionMintAddress = challengeMetadata.collectionMintAddress;

  if (collectionMintAddress) {
    try {
      const connection = new Connection(rpcEndpoint, { httpAgent: false });
      const collectionPublicKey = new PublicKey(collectionMintAddress);
      const accountInfo = await connection.getAccountInfo(collectionPublicKey);

      if (accountInfo) {
        collectionSize = decodeCoreCollectionNumMinted(accountInfo.data);

        if (collectionSize === null) {
          console.error(
            `Failed to decode num_minted for collection ${collectionMintAddress}`,
          );
        }
      } else {
        console.error(
          `Failed to fetch account info for ${collectionMintAddress}`,
        );
      }
    } catch (error) {
      console.error(
        `Failed to fetch collection details for ${collectionMintAddress}:`,
        error,
      );
    }
  }

  return (
    <div className="flex flex-col w-full border-b border-b-border">
      <div
        className="w-full"
        style={{
          background: `linear-gradient(180deg, rgb(${
            challengeColors[challengeMetadata.language]
          },0.05) 0%, transparent 100%)`,
        }}
      >
        <div className="px-4 py-14 pb-20 md:px-8 lg:px-14 max-w-app w-full mx-auto flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2 relative w-max">
              <CrosshairCorners
                size={5}
                spacingTop={2}
                spacingBottom={2}
                spacingX={6}
                style={{
                  color: `rgb(${
                    challengeColors[challengeMetadata.language]
                  },1)`,
                }}
              />
              <div
                className="w-[24px] h-[24px] rounded-sm flex items-center justify-center text-brand-primary"
                style={{
                  backgroundColor: `rgb(${
                    challengeColors[challengeMetadata.language]
                  },0.10)`,
                }}
              >
                <Icon name={challengeMetadata.language} size={16 as 14} />
              </div>
              <span
                className="font-medium text-lg font-mono relative top-0.25"
                style={{
                  color: `rgb(${challengeColors[challengeMetadata.language]})`,
                }}
              >
                {challengeMetadata.language}
              </span>
            </div>
            <span className="sr-only">
              {t(`challenges.${challengeMetadata.slug}.title`)}
            </span>
            <LessonTitle title={challengePageTitle} />
            {collectionMintAddress && typeof collectionSize === "number" && (
              <Link
                href={`https://solana.fm/address/${collectionMintAddress}`}
                target="_blank"
              >
                <p
                  className="text-secondary mt-1 text-sm"
                  style={{
                    color: `rgb(${
                      challengeColors[challengeMetadata.language]
                    })`,
                  }}
                >
                  {collectionSize.toString()} Graduates
                </p>
              </Link>
            )}
          </div>
        </div>{" "}
      </div>

      <Divider />

      <div className="max-w-app flex flex-col gap-y-8 h-full relative px-4 md:px-8 lg:px-14 mx-auto w-full mt-[36px]">
        <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-13 gap-y-24 lg:gap-y-0 gap-x-0 lg:gap-x-6">
          <ContentPagination
            type="challenge"
            challenge={challengeMetadata}
            currentPageSlug={pageSlug}
          />
          <div className="pb-8 pt-[36px] -mt-[36px] order-2 lg:order-1 col-span-1 md:col-span-7 flex flex-col gap-y-8 lg:border-border lg:border-x border-border lg:px-6">
            <MdxLayout>
              <Page />
            </MdxLayout>

            <div className=" w-full flex items-center flex-col gap-y-10">
              {nextPage ? (
                <Link
                  href={`/challenges/${challengeMetadata.slug}/${nextPage.slug}`}
                  className="flex justify-between items-center w-full bg-background-card border border-border group py-5 px-5 rounded-xl"
                >
                  <div className="flex items-center gap-x-2">
                    <span className="text-mute text-sm font-mono pt-1">
                      Next Page
                    </span>
                    <span className="font-medium text-primary">
                      {t(
                        `challenges.${challengeMetadata.slug}.pages.${nextPage.slug}.title`,
                      )}
                    </span>
                  </div>
                  <Icon
                    name="ArrowRight"
                    className="text-mute text-sm group-hover:text-primary group-hover:translate-x-1 transition"
                  />
                </Link>
              ) : (
                <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group -mt-12 pt-24 pb-16 px-8 [background:linear-gradient(180deg,rgba(0,255,255,0)_0%,rgba(0,255,255,0.08)_50%,rgba(0,255,255,0)_100%)]">
                  <span className="text-primary w-auto flex-shrink-0 font-mono">
                    {t("lessons.take_challenge_cta")}
                  </span>
                  <Link
                    href={`/challenges/${challengeSlug}/verify`}
                    className="w-max"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      label={t("lessons.take_challenge")}
                      icon="Challenge"
                      className="disabled:opacity-40 w-full disabled:cursor-default"
                    ></Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <TableOfContents />
        </div>
      </div>
    </div>
  );
} 