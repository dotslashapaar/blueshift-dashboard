import { getAllChallenges } from "@/app/utils/mdx";
import ChallengesList from "./ChallengesList";
import { Suspense } from "react";
import Loading from "../Loading/Loading";

export default async function ChallengesListWrapper() {
  const challenges = await getAllChallenges();

  console.log(challenges)

  return (
    <Suspense fallback={<Loading />}>
      <ChallengesList initialChallenges={challenges} />
    </Suspense>
  );
}
