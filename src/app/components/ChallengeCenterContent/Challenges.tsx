import ChallengeFilter from "../Filters/ChallengeFilter";
import ViewToggle from "../ViewToggle/ViewToggle";
import ChallengesListWrapper from "./ChallengesListWrapper";

export default function Challenges() {
  return (
    <div className="w-full flex flex-col gap-y-16 pb-24">
      <div className="relative">
        <div className="content-wrapper">
          <div className="flex flex-wrap md:flex-row gap-y-4 md:gap-y-0 md:items-center gap-x-3 w-full">
            <ChallengeFilter className="!w-[200px]" />
          </div>
        </div>
        <img
          src="/graphics/challenges-graphic.webp"
          alt="Challenges Graphic"
          className="absolute -bottom-16 right-16 hidden lg:block w-[350px] xl:w-[500px]"
        />
      </div>
      <div className="h-px w-full border-t-border border-t" />
      <div className="content-wrapper">
        <ChallengesListWrapper />
      </div>
    </div>
  );
}
