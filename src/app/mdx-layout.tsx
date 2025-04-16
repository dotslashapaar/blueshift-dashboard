export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="col-span-1 md:col-span-7 prose prose-invert max-w-none -mt-2
      prose-p:text-secondary
      prose-headings:text-primary
      prose-headings:font-semibold
      prose-strong:text-primary prose-strong:font-medium
      prose-ul:list-none prose-ul:pl-6 prose-ul:pb-3
      prose-ol:list-none prose-ol:pl-6 prose-ol:pb-3
      prose-li:m-0 prose-li:relative
      prose-headings:py-2
      prose-h1:tracking-[-0.025em]
      prose-p:empty:hidden
      md:prose-h1:text-[32px]
      md:prose-h2:text-[28px]
      md:prose-h3:text-[24px]
      md:prose-h4:text-[20px]
      sm:prose-h1:text-[28px]
      sm:prose-h2:text-[24px]
      sm:prose-h3:text-[20px]
      sm:prose-h4:text-base
      prose-blockquote:text-brand-secondary
      prose-blockquote:pr-4
      prose-blockquote:[font-style:normal]
      prose-blockquote:border-l-2
      prose-figure:my-0
      prose-code:[font-family:var(--font-geist-mono)]
      prose-code:font-medium
      prose-pre:bg-background-card prose-code:text-primary prose-code:rounded-lg prose-code:px-2 prose-code:py-1"
    >
      {children}
    </article>
  );
}
