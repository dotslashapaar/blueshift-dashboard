export const courseLanguages = {
  Anchor: "Anchor",
  Rust: "Rust",
  Typescript: "TypeScript",
} as const;

export const courseColors = {
  Anchor: "221,234,224",
  Rust: "255,173,102",
  Typescript: "105,162,241",
} as const;

export const courseDifficulty = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Expert",
} as const;

export const difficultyColors = {
  1: "#00C7E6",
  2: "#00E66B",
  3: "#E6D700",
  4: "#FF285A",
} as const;

export const courseStatus = {
  Incomplete: "Incomplete",
  Complete: "Complete",
  Challenge_Completed: "Challenge_Completed",
} as const;

export const rewardsStatus = {
  Unclaimed: "Unclaimed",
  Locked: "Locked",
  Claimed: "Claimed",
} as const;

export type challengeMetadata = {
  apiPath: string;
  title: string;
  requirements: {
    title: string;
    description: string;
    instructionKey: string;
  }[]
}

export type CourseMetadata = {
  slug: string;
  title: string;
  language: CourseLanguages;
  color: string;
  difficulty: CourseDifficulty;
  isFeatured: boolean;
  status?: RewardsStatus;
  lessons: LessonMetadata[];
  challenge?: challengeMetadata;
};

export type LessonMetadata = {
  title: string;
  lessonNumber: number;
  slug: string;
};

export type RewardsStatus = keyof typeof rewardsStatus;
export type CourseLanguages = keyof typeof courseLanguages;
export type CourseDifficulty = keyof typeof courseDifficulty;

/**
  * Adds a lesson number to each lesson in the course metadata.
 * @param courses
 */
export function withCourseNumber(
  courses: CourseMetadataWithoutLessonNumber[]
): CourseMetadata[] {
  return courses.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson, index) => ({
      ...lesson,
      lessonNumber: index + 1,
    })),
  }));
}

type CourseMetadataWithoutLessonNumber = Omit<CourseMetadata, 'lessons'> & {
  lessons: Omit<LessonMetadata, 'lessonNumber'>[];
};
