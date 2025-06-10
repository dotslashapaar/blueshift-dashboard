import ChallengePageContainer from "@/app/components/Challenges/ChallengePageContainer";

interface ChallengePageProps {
  params: Promise<{
    challengeSlug: string;
    locale: string;
  }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  return <ChallengePageContainer params={params} />;
}
