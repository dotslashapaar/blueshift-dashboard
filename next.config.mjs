import createMDX from "@next/mdx";
import pkg from "./next-i18next.config.js";
const { i18n } = pkg;
import rehypePrettyCode from "rehype-pretty-code";
import oneDarkPro from 'shiki/themes/one-dark-pro.mjs'

const nextConfig = {
  i18n,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig); 