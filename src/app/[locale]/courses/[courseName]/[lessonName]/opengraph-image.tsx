import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 1200,
  height: 675,
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  params,
}: {
  params: { courseName: string };
}) {
  const { courseName } = params;

  // Determine base URL
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_APP_URL is not defined.");
    throw Error("Base URL is not defined.");
  }
  // Ensure baseUrl doesn't have a trailing slash if image paths start with one
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const primaryImagePublicPath = `/graphics/lessons/og-${courseName}.png`;
  const fallbackImagePublicPath = `/graphics/meta-image.png`;

  const primaryImageUrl = `${baseUrl}${primaryImagePublicPath}`;
  const fallbackImageUrl = `${baseUrl}${fallbackImagePublicPath}`;


  let imageUrlToUse: string;

  try {
    // Attempt to fetch the primary image using a HEAD request to save bandwidth
    const response = await fetch(primaryImageUrl, { method: 'HEAD' });
    if (response.ok) {
      imageUrlToUse = primaryImageUrl;
    } else {
      console.warn(`Primary image '${primaryImageUrl}' not found (status: ${response.status}). Using fallback.`);
      imageUrlToUse = fallbackImageUrl;
    }
  } catch (error) {
    console.error(`Error fetching primary image '${primaryImageUrl}':`, error);
    imageUrlToUse = fallbackImageUrl; // Fallback on any fetch error
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
        }}
      >
        <img
          src={imageUrlToUse}
          alt={`OpenGraph image for ${courseName}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover", // Ensures the image covers the area, might crop
          }}
        />
      </div>
    )
  )
}
