import { invoke } from "@tauri-apps/api/core";
import { ExternalLink, FileQuestion, FolderOpen, Loader2, X } from "lucide-react";
import type { SearchResult } from "../hooks/useSearch";
import { usePreview } from "../hooks/usePreview";

interface PreviewPaneProps {
  result: SearchResult | null;
  onClose?: () => void;
  isOverlay?: boolean;
}

function getDirPath(path: string): string {
  const parts = path.split(/[\\/]/);
  if (parts.length <= 1) return path;
  return parts.slice(0, -1).join("/");
}

export function PreviewPane({ result, onClose, isOverlay = false }: PreviewPaneProps) {
  const { data, isLoading, error } = usePreview(result?.path ?? null);

  const handleOpen = async () => {
    if (!result) return;
    try {
      await invoke("open_file", { path: result.path });
    } catch (e) {
      console.error("Failed to open file:", e);
    }
  };

  const handleReveal = async () => {
    if (!result) return;
    try {
      await invoke("reveal_in_explorer", { path: result.path });
    } catch (e) {
      console.error("Failed to reveal file:", e);
    }
  };

  if (!result) {
    return (
      <aside className={`preview-pane ${isOverlay ? "preview-pane-overlay" : ""}`}>
        <div className="preview-empty-state">
          <FileQuestion style={{ width: 24, height: 24 }} />
          <p className="inter-ui" style={{ margin: 0 }}>
            Select a result to preview it.
          </p>
        </div>
      </aside>
    );
  }

  const title = data?.title ?? result.path.split(/[\\/]/).pop() ?? result.path;
  const fileType = (data?.file_type || result.file_type || "file").toUpperCase();
  const previewError = error || (data?.kind === "error" ? data.message : null);

  return (
    <aside className={`preview-pane ${isOverlay ? "preview-pane-overlay" : ""}`}>
      <div className="preview-pane-header">
        <div style={{ minWidth: 0 }}>
          <div className="preview-type-pill">{fileType}</div>
          <h2 className="inter-ui preview-pane-title">{title}</h2>
          <p className="mono-ui preview-pane-path" title={result.path}>
            {getDirPath(result.path)}
          </p>
        </div>

        <div className="preview-pane-actions">
          <button className="result-action-btn" type="button" onClick={handleOpen}>
            <ExternalLink style={{ width: 10, height: 10 }} />
            Open
          </button>
          <button className="result-action-btn" type="button" onClick={handleReveal}>
            <FolderOpen style={{ width: 10, height: 10 }} />
            Reveal
          </button>
          {onClose && (
            <button className="preview-close-btn" type="button" onClick={onClose} aria-label="Close preview">
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
      </div>

      <div className="preview-pane-body">
        {isLoading && (
          <div className="preview-loading-state">
            <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
            <span className="mono-ui">Loading preview…</span>
          </div>
        )}

        {!isLoading && previewError && (
          <div className="preview-message-card">
            <p className="inter-ui" style={{ margin: 0 }}>
              {previewError}
            </p>
          </div>
        )}

        {!isLoading && !previewError && data?.kind === "text" && (
          <div className="preview-content-stack">
            <pre className="preview-text-block">{data.content}</pre>
            {data.truncated && (
              <div className="preview-footnote mono-ui">Preview truncated for quick scanning.</div>
            )}
          </div>
        )}

        {!isLoading && !previewError && data?.kind === "image" && (
          <div className="preview-media-stage">
            <img src={data.data_url} alt={title} className="preview-image" />
          </div>
        )}

        {!isLoading && !previewError && data?.kind === "pdf" && (
          <div className="preview-content-stack">
            <div className="preview-pdf-frame-wrap">
              <iframe src={data.data_url} title={title} className="preview-pdf-frame" />
            </div>
            {data.text_excerpt && <pre className="preview-text-block preview-text-secondary">{data.text_excerpt}</pre>}
          </div>
        )}

        {!isLoading && !previewError && data?.kind === "unsupported" && (
          <div className="preview-content-stack">
            <div className="preview-message-card">
              <p className="inter-ui" style={{ margin: 0 }}>
                {data.message}
              </p>
            </div>
            {data.text_excerpt && <pre className="preview-text-block preview-text-secondary">{data.text_excerpt}</pre>}
          </div>
        )}
      </div>
    </aside>
  );
}
