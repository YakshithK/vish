import { invoke } from "@tauri-apps/api/core";
import {
  Search,
  ExternalLink,
  FolderOpen,
  FileText,
  FileImage,
  FileCode,
  Music,
  Video,
  File,
  Braces,
} from "lucide-react";
import { SearchResult } from "../hooks/useSearch";

interface ResultListProps {
  results: SearchResult[];
  query?: string;
}

interface TypeConfig {
  Icon: React.ElementType;
  color: string;
  label: string;
}

function getTypeConfig(fileType: string, path: string): TypeConfig {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const t = fileType.toLowerCase();

  if (t.includes("pdf") || ext === "pdf")
    return { Icon: FileText, color: "#F97316", label: "PDF" };
  if (t.includes("image") || ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp"].includes(ext))
    return { Icon: FileImage, color: "#22C55E", label: "IMG" };
  if (["mp3", "wav", "m4a", "flac", "ogg", "aac"].includes(ext) || t.includes("audio"))
    return { Icon: Music, color: "#A855F7", label: "AUD" };
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext) || t.includes("video"))
    return { Icon: Video, color: "#EF4444", label: "VID" };
  if (["json", "yaml", "yml", "toml", "ini"].includes(ext))
    return { Icon: Braces, color: "#F59E0B", label: "CFG" };
  if (
    ["rs", "py", "js", "ts", "tsx", "jsx", "go", "c", "cpp", "java", "rb", "php", "cs", "swift", "kt"].includes(ext) ||
    t.includes("code")
  )
    return { Icon: FileCode, color: "#3B82F6", label: ext.toUpperCase().slice(0, 3) || "COD" };
  if (["md", "txt", "log", "csv"].includes(ext))
    return { Icon: FileText, color: "#6ddba8", label: ext.toUpperCase() };
  if (t.includes("doc") || ["docx", "doc", "odt", "rtf"].includes(ext))
    return { Icon: FileText, color: "#F59E0B", label: "DOC" };

  return { Icon: File, color: "#4a9e7a", label: ext.toUpperCase().slice(0, 3) || "FIL" };
}

function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

function getDirPath(path: string): string {
  const parts = path.split(/[\\/]/);
  if (parts.length <= 1) return path;
  const dir = parts.slice(0, -1).join("/");
  const home = "/home/";
  if (dir.startsWith(home)) {
    const afterHome = dir.slice(home.length);
    const slash = afterHome.indexOf("/");
    if (slash !== -1) return "~/" + afterHome.slice(slash + 1);
    return "~";
  }
  return dir;
}

export function ResultList({ results, query }: ResultListProps) {
  const handleOpen = async (path: string) => {
    try {
      await invoke("open_file", { path });
    } catch (e) {
      console.error("Failed to open file:", e);
    }
  };

  const handleReveal = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    try {
      await invoke("reveal_in_explorer", { path });
    } catch (e) {
      console.error("Failed to reveal file:", e);
    }
  };

  if (results.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "rgba(155,255,215,0.04)",
            border: "1px solid rgba(155,255,215,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Search
            style={{ width: 22, height: 22, color: "rgba(155,255,215,0.4)" }}
            strokeWidth={1.5}
          />
        </div>
        {query ? (
          <>
            <p
              className="inter-ui"
              style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-soft)", margin: 0 }}
            >
              No results for "{query}"
            </p>
            <p
              className="mono-ui"
              style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 6 }}
            >
              Try different terms or check your indexed folders
            </p>
          </>
        ) : (
          <p
            className="mono-ui"
            style={{ fontSize: "0.75rem", color: "var(--text-dim)", margin: 0 }}
          >
            Submit a query to search your files
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", paddingTop: 10 }}>
      {results.map((result, idx) => {
        const fileName = getFileName(result.path);
        const dirPath = getDirPath(result.path);
        const { Icon, color, label } = getTypeConfig(result.file_type, result.path);
        const snippet = result.text_excerpt?.trim();

        return (
          <div
            key={`${result.path}-${idx}`}
            className="result-row"
            style={{
              animationDelay: `${Math.min(idx, 9) * 35}ms`,
              '--row-accent': color,
            } as React.CSSProperties}
            onClick={() => handleOpen(result.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleOpen(result.path);
            }}
          >
            {/* Icon well */}
            <div
              className="result-icon-well"
              style={{
                background: `${color}12`,
                border: `1px solid ${color}30`,
                boxShadow: `0 0 14px ${color}18`,
                color,
              }}
              title={label}
            >
              <Icon style={{ width: 17, height: 17 }} strokeWidth={1.6} />
            </div>

            {/* Center: name + path + snippet */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="inter-ui"
                style={{
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.35,
                }}
              >
                {fileName}
              </div>

              <div
                className="mono-ui"
                style={{
                  fontSize: "0.67rem",
                  color: "var(--text-mono)",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.3,
                }}
                title={dirPath}
              >
                {dirPath}
              </div>

              {snippet && (
                <div
                  className="inter-ui"
                  style={{
                    fontSize: "0.74rem",
                    color: "var(--text-soft)",
                    marginTop: 6,
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                    opacity: 0.82,
                  }}
                >
                  "{snippet}"
                </div>
              )}
            </div>

            {/* Right: action buttons — visible on row hover via CSS */}
            <div className="result-row-actions">
              <button
                className="result-action-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen(result.path);
                }}
              >
                <ExternalLink style={{ width: 10, height: 10 }} />
                Open
              </button>
              <button
                className="result-action-btn"
                type="button"
                onClick={(e) => handleReveal(e, result.path)}
              >
                <FolderOpen style={{ width: 10, height: 10 }} />
                Reveal
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
