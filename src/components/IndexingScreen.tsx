import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface IndexingScreenProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface IndexerStatus {
  status: string;
  files_done: number;
  files_total: number;
  eta_secs?: number;
}

function formatEta(secs: number): string {
  if (secs < 60) return `${Math.ceil(secs)}s`;
  const mins = Math.ceil(secs / 60);
  return `~${mins} min`;
}

export function IndexingScreen({ onComplete, onCancel }: IndexingScreenProps) {
  const [status, setStatus] = useState<IndexerStatus>({
    status: "running",
    files_done: 0,
    files_total: 0,
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res: IndexerStatus = await invoke("get_indexer_status");
        setStatus(res);

        if (res.status === "idle" && res.files_done > 0 && res.files_done >= res.files_total) {
          onComplete();
        }
      } catch (error) {
        console.error("Failed to fetch status:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progress =
    status.files_total > 0 ? Math.round((status.files_done / status.files_total) * 100) : 0;

  const handleCancel = async () => {
    try {
      await invoke("stop_indexing");
      onCancel();
    } catch (error) {
      console.error("Failed to stop indexing:", error);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Status label */}
      <div
        className="mono-ui"
        style={{
          fontSize: "0.68rem",
          letterSpacing: "0.18em",
          color: "var(--text-dim)",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        INDEXING · 8 concurrent workers
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="vish-progress-track" style={{ width: "100%" }}>
          <div
            className="vish-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats row */}
        <div
          className="mono-ui"
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.72rem",
            color: "var(--text-dim)",
          }}
        >
          <span>
            {status.files_done.toLocaleString()} / {status.files_total.toLocaleString()} files
          </span>
          <span>{progress}%</span>
          <span>
            {status.eta_secs && status.eta_secs > 0
              ? formatEta(status.eta_secs) + " remaining"
              : "estimating…"}
          </span>
        </div>
      </div>

      {/* Cancel */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <button
          type="button"
          onClick={handleCancel}
          className="mono-ui"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.72rem",
            color: "var(--text-dim)",
            letterSpacing: "0.05em",
            padding: "4px 8px",
            opacity: 0.7,
            transition: "opacity 150ms ease-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          cancel
        </button>
      </div>
    </div>
  );
}
