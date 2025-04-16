import RewardFilter from "../Filters/RewardFilter";
import ViewToggle from "../ViewToggle/ViewToggle";
import RewardsListWrapper from "./RewardsListWrapper";

export default function Rewards() {
  return (
    <div className="w-full flex flex-col gap-y-16">
      <div className="relative">
        <div className="content-wrapper">
          <div className="flex flex-wrap md:flex-row gap-y-4 md:gap-y-0 md:items-center gap-x-3 w-full">
            <RewardFilter />
            <ViewToggle layoutName="rewards-view-toggle" />
          </div>
        </div>
        <img
          src="/graphics/rewards-graphic.webp"
          alt="Rewards Graphic"
          className="absolute -bottom-16 right-16 hidden lg:block w-[350px] xl:w-[500px]"
        />
      </div>
      <div className="h-px w-full border-t-border border-t" />
      <div className="content-wrapper">
        <RewardsListWrapper />
      </div>
    </div>
  );
}
