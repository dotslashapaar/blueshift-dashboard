import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CourseLanguages,
  courseLanguages,
  rewardsStatus,
  RewardsStatus,
} from "@/app/utils/course";

interface Store {
  // Global Modal
  openedModal: string | null;
  setOpenedModal: (modal: string | null) => void;
  closeModal: () => void;
  // Search
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const useStore = create<Store>()((set) => ({
  // Global Modal
  openedModal: null,
  setOpenedModal: (modal) => set({ openedModal: modal }),
  closeModal: () => set({ openedModal: null }),

  // Search
  searchValue: "",
  setSearchValue: (value) => set({ searchValue: value }),
}));

interface PersistentStore {
  // User's View Preference
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;

  // Course Progress
  courseProgress: Record<string, number>; // key: course slug, value: current lesson number
  setCourseProgress: (courseSlug: string, lessonNumber: number) => void;

  // Filters
  selectedLanguages: CourseLanguages[];
  toggleLanguage: (language: CourseLanguages) => void;
  clearLanguages: () => void;

  // Rewards
  selectedRewardStatus: RewardsStatus[];
  toggleRewardStatus: (status: RewardsStatus) => void;
  clearRewardStatus: () => void;

  // Wallet Recommended Modal
  connectionRecommendedViewed: boolean;
  setConnectionRecommendedViewed: (viewed: boolean) => void;
}

export const usePersistentStore = create<PersistentStore>()(
  persist(
    (set) => ({
      // User's View Preference
      view: "grid",
      setView: (view) => set({ view }),

      // Course Progress
      courseProgress: {},
      setCourseProgress: (courseSlug, lessonNumber) =>
        set((state) => ({
          courseProgress: {
            ...state.courseProgress,
            [courseSlug]: lessonNumber,
          },
        })),

      // Filters
      selectedLanguages: Object.keys(courseLanguages) as CourseLanguages[],
      toggleLanguage: (language) =>
        set((state) => ({
          selectedLanguages: state.selectedLanguages.includes(language)
            ? state.selectedLanguages.filter((l) => l !== language)
            : [...state.selectedLanguages, language],
        })),
      clearLanguages: () => set({ selectedLanguages: [] }),

      // Rewards
      selectedRewardStatus: Object.keys(rewardsStatus) as RewardsStatus[],
      toggleRewardStatus: (status) =>
        set((state) => ({
          selectedRewardStatus: state.selectedRewardStatus.includes(status)
            ? state.selectedRewardStatus.filter((s) => s !== status)
            : [...state.selectedRewardStatus, status],
        })),
      clearRewardStatus: () => set({ selectedRewardStatus: [] }),

      // Wallet Connection Recommended Viewed
      connectionRecommendedViewed: false,
      setConnectionRecommendedViewed: (viewed) =>
        set({ connectionRecommendedViewed: viewed }),
    }),
    {
      name: "blueshift-storage",
    }
  )
);
