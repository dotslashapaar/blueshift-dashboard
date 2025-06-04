import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CourseLanguages,
  courseLanguages,
} from "@/app/utils/course";
import { Certificate } from "@/lib/challenges/types";
import { challengeStatus, ChallengeStatus } from "@/app/utils/challenges";

export type ChallengeStatuses = "open" | "completed" | "claimed";

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

  // Challenge Center
  selectedChallengeStatus: ReadonlyArray<ChallengeStatus>;
  toggleChallengeStatus: (status: ChallengeStatus) => void;
  clearChallengeStatus: () => void;

  // Wallet Recommended Modal
  connectionRecommendedViewed: boolean;
  setConnectionRecommendedViewed: (viewed: boolean) => void;

  // Authentication
  authToken: string | null;
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;

  // Certificates
  certificates: Record<string, Certificate>;
  setCertificate: (courseSlug: string, certificate: Certificate) => void;

  // Challenge Statuses
  challengeStatuses: Record<string, ChallengeStatuses>;
  setChallengeStatus: (slug: string, status: ChallengeStatuses) => void;
}

type V0PersistentStore = Omit<PersistentStore, 'challengeStatuses' | 'setNewChallengeStatus'> & {
  courseStatus?: Record<string, "Locked" | "Unlocked" | "Claimed">;
};

const migrate = (persistedState: unknown, version: number): Partial<PersistentStore> => {
  if (version === 0) {
    const oldState = persistedState as V0PersistentStore;
    const newChallengeStatuses: Record<string, ChallengeStatuses> = {};
    if (oldState.courseStatus) {
      for (const slug in oldState.courseStatus) {
        const courseSpecificStatus = oldState.courseStatus[slug];
        if (courseSpecificStatus === "Unlocked") {
          newChallengeStatuses[slug] = "completed";
        } else if (courseSpecificStatus === "Claimed") {
          newChallengeStatuses[slug] = "claimed";
        } else {
          newChallengeStatuses[slug] = "open";
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { courseStatus, ...rest } = oldState;
    return { ...rest, challengeStatuses: newChallengeStatuses };
  }

  return persistedState as Partial<PersistentStore>;
};

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

      // Challenge Center
      selectedChallengeStatus: challengeStatus,
      toggleChallengeStatus: (status) =>
        set((state) => ({
          selectedChallengeStatus: state.selectedChallengeStatus.includes(status)
            ? state.selectedChallengeStatus.filter((s) => s !== status)
            : [...state.selectedChallengeStatus, status],
        })),
      clearChallengeStatus: () => set({ selectedChallengeStatus: [] }),

      // Wallet Connection Recommended Viewed
      connectionRecommendedViewed: false,
      setConnectionRecommendedViewed: (viewed) =>
        set({ connectionRecommendedViewed: viewed }),

      // Authentication
      authToken: null,
      setAuthToken: (token) => set({ authToken: token }),
      clearAuthToken: () => set({ authToken: null }),

      // Certificates
      certificates: {},
      setCertificate: (courseSlug, certificate) =>
        set((state) => ({
          certificates: {
            ...state.certificates,
            [courseSlug]: certificate,
          },
        })),

      challengeStatuses: {},
      setChallengeStatus: (slug, status) =>
        set((state) => ({
          challengeStatuses: { ...state.challengeStatuses, [slug]: status },
        })),
    }),
    {
      name: "blueshift-storage",
      version: 1,
      migrate,
    }
  )
);
