import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Markdown renderer for assistant replies and interview-prep.
 * Styling lives in the `.md` scope in globals.css. Links open in a new tab.
 *
 * NOTE: syntax highlighting (Shiki) is deferred — code blocks render with the
 * mono `.md pre` style for now. Add a rehype highlighter when needed.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("md", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
