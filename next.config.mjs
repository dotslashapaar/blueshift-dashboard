import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import pkg from "./next-i18next.config.js";
const { i18n } = pkg;

const nextConfig = {
  i18n,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "dracula-soft",
          // aurora-x
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
await initOpenNextCloudflareForDev();
