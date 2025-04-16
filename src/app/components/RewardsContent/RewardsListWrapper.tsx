import { getAllCourses } from "@/app/utils/mdx";
import RewardsList from "./RewardsList";
import { Suspense } from "react";
import Loading from "../Loading/Loading";

export default async function RewardsListWrapper() {
  const courses = await getAllCourses();

  return (
    <Suspense fallback={<Loading />}>
      <RewardsList initialCourses={courses} />
    </Suspense>
  );
}
