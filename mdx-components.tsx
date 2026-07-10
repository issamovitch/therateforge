import type { MDXComponents } from "mdx/types";

/**
 * Default MDX component mapping for Next.js App Router.
 * Maps standard HTML elements to themselves so MDX files render with the
 * site's existing prose styles (defined in .rf-guide-prose in rateforge.css).
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 {...props} />,
    h2: (props) => <h2 {...props} />,
    h3: (props) => <h3 {...props} />,
    p: (props) => <p {...props} />,
    ul: (props) => <ul {...props} />,
    ol: (props) => <ol {...props} />,
    li: (props) => <li {...props} />,
    a: (props) => <a {...props} />,
    strong: (props) => <strong {...props} />,
    em: (props) => <em {...props} />,
    code: (props) => <code {...props} />,
    blockquote: (props) => <blockquote {...props} />,
    table: (props) => <table {...props} />,
    thead: (props) => <thead {...props} />,
    tbody: (props) => <tbody {...props} />,
    tr: (props) => <tr {...props} />,
    th: (props) => <th {...props} />,
    td: (props) => <td {...props} />,
    ...components,
  };
}
