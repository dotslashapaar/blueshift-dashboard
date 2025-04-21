import { AnchorIcon } from "./Anchor";
import { ArrowLeftIcon } from "./ArrowLeft";
import { ArrowRightIcon } from "./ArrowRight";
import { ChallengeIcon } from "./Challenge";
import { ChevronIcon } from "./Chevron";
import { ClaimIcon } from "./Claim";
import { ClaimedIcon } from "./Claimed";
import { CopyIcon } from "./Copy";
import { DiscordIcon } from "./Discord";
import { FilterIcon } from "./Filter";
import { FlagIcon } from "./Flag";
import { FlameIcon } from "./Flame";
import { GithubIcon } from "./Github";
import { GridViewIcon } from "./GridView";
import { LessonsIcon } from "./Lessons";
import { LinkIcon } from "./Link";
import { ListViewIcon } from "./ListView";
import { LockedIcon } from "./Locked";
import { RewardsIcon } from "./Rewards";
import { RustIcon } from "./Rust";
import { SearchIcon } from "./Search";
import { ShiftArrowIcon } from "./ShiftArrow";
import { SuccessIcon } from "./Success";
import { TableIcon } from "./Table";
import { TargetIcon } from "./Target";
import { TypescriptIcon } from "./Typescript";
import { UnclaimedIcon } from "./Unclaimed";
import { UploadIcon } from "./Upload";
import { WalletIcon } from "./Wallet";
import { WarningIcon } from "./Warning";
import { XIcon } from "./X";

export const IconComponents = {
  Anchor: AnchorIcon,
  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,
  Challenge: ChallengeIcon,
  Chevron: ChevronIcon,
  Claim: ClaimIcon,
  Claimed: ClaimedIcon,
  Copy: CopyIcon,
  Discord: DiscordIcon,
  Filter: FilterIcon,
  Flag: FlagIcon,
  Flame: FlameIcon,
  Github: GithubIcon,
  GridView: GridViewIcon,
  Lessons: LessonsIcon,
  Link: LinkIcon,
  ListView: ListViewIcon,
  Locked: LockedIcon,
  Rewards: RewardsIcon,
  Rust: RustIcon,
  Search: SearchIcon,
  ShiftArrow: ShiftArrowIcon,
  Success: SuccessIcon,
  Table: TableIcon,
  Target: TargetIcon,
  Typescript: TypescriptIcon,
  Unclaimed: UnclaimedIcon,
  Upload: UploadIcon,
  Wallet: WalletIcon,
  Warning: WarningIcon,
  X: XIcon,
} as const;

export type IconName = keyof typeof IconComponents;
