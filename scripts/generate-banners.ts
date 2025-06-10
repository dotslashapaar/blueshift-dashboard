import fs from "fs/promises";
import path from "path";
import { generateBannerData } from "@/lib/banners/banner-generator";
import { courses } from "@/app/content/courses/courses";
import { challenges } from "@/app/content/challenges/challenges";

const COURSE_BANNERS_DIR = path.join(
  process.cwd(),
  "public",
  "graphics",
  "course-banners",
);
const CHALLENGE_BANNERS_DIR = path.join(
  process.cwd(),
  "public",
  "graphics",
  "challenge-banners",
);

async function generateBannersFor(
  items: any[],
  type: "course" | "challenge",
  outputDir: string,
) {
  await fs.mkdir(outputDir, { recursive: true });
  console.log(`Output directory ensured: ${outputDir}`);

  if (!items || !Array.isArray(items) || items.length === 0) {
    console.error(`No ${type}s found to generate banners for.`);
    return;
  }

  console.log(`Found ${items.length} ${type}s to generate banners for.`);

  for (const item of items) {
    if (!item.slug) {
      console.warn(
        `${type} with no slug found, skipping: ${JSON.stringify(item)}`,
      );
      continue;
    }

    const itemSlug = item.slug;
    console.log(`Processing ${type} overview for: ${itemSlug}`);

    const bannerInfo = await generateBannerData({
      itemSlug,
      type,
    });

    if (bannerInfo && bannerInfo.data) {
      const safeItemSlug = itemSlug.replace(/[^a-zA-Z0-9_\-]/g, "");
      const filename = `${safeItemSlug}.png`;
      const filePath = path.join(outputDir, filename);

      await fs.writeFile(filePath, Buffer.from(bannerInfo.data));
      console.log(`Successfully generated and saved: ${filePath}`);
    } else {
      console.warn(
        `Skipped banner for ${itemSlug} (generation failed or no data returned).`,
      );
    }
  }
}

async function main() {
  await generateBannersFor(courses, "course", COURSE_BANNERS_DIR);
  await generateBannersFor(challenges, "challenge", CHALLENGE_BANNERS_DIR);

  console.log("Banner generation process complete.");
}

main().catch(error => {
  console.error("Unexpected error in main execution:", error);
  process.exit(1);
});
