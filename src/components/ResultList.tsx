import { invoke } from "@tauri-apps/api/core";
import { SearchResult } from "../hooks/useSearch";
import { FileIcon, ImageIcon, FileTextIcon, FolderOpen, VideoIcon, CodeIcon, ExternalLink } from "lucide-react";

interface ResultListProps {
  results: SearchResult[];
}

export function ResultList({ results }: ResultListProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-fade-in">
        <p>No results found. Try a different query.</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
      case "docx":
      case "txt":
      case "md":
        return <FileTextIcon className="w-4 h-4 text-blue-400" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "webp":
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case "rs":
      case "js":
      case "ts":
      case "py":
      case "tsx":
      case "jsx":
        return <CodeIcon className="w-4 h-4 text-amber-400" />;
      case "mp4":
      case "mov":
        return <VideoIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <FileIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleOpen = async (path: string) => {
    try {
      await invoke("open_file", { path });
    } catch (e) {
      console.error("Failed to open file:", e);
    }
  };

  const handleReveal = async (path: string) => {
    try {
      await invoke("reveal_in_explorer", { path });
    } catch (e) {
      console.error("Failed to reveal file:", e);
    }
  };

  // Deduplicate: keep only the highest-scoring result per file path
  const seen = new Map<string, SearchResult>();
  for (const r of results) {
    const existing = seen.get(r.path);
    if (!existing || r.score > existing.score) {
      seen.set(r.path, r);
    }
  }
  const uniqueResults = Array.from(seen.values())
    .sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-2 px-6 py-2 overflow-y-auto max-w-2xl mx-auto w-full">
      <p className="text-xs text-muted-foreground mb-1">
        {uniqueResults.length} result{uniqueResults.length !== 1 ? "s" : ""}
      </p>
      {uniqueResults.map((result, idx) => (
        <div
          key={`${result.path}-${idx}`}
          className="flex items-center justify-between gap-3 p-3 rounded-xl glass hover:bg-white/[0.06] transition-all cursor-pointer group animate-fade-in"
          style={{ animationDelay: `${idx * 40}ms` }}
          onClick={() => handleOpen(result.path)}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors shrink-0">
              {getIcon(result.file_type)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm text-foreground truncate">
                {result.path.split("/").pop() || result.path.split("\\").pop()}
              </h3>
              <p className="text-xs text-muted-foreground/70 truncate" title={result.path}>
                {result.path}
              </p>
              {result.text_excerpt && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {result.text_excerpt.substring(0, 120)}...
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
              {(result.score * 100).toFixed(0)}%
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleReveal(result.path); }}
              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
              title="Reveal in Explorer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="p-1.5 opacity-0 group-hover:opacity-100 transition-all">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
