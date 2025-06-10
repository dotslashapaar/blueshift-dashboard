import ChallengePageContainer from "@/app/components/Challenges/ChallengePageContainer";

interface ChallengePageProps {
  params: Promise<{
    challengeSlug: string;
    pageSlug: string;
    locale: string;
  }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  return <ChallengePageContainer params={params} />;
} 