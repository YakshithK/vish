import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Sparkles, XCircle } from "lucide-react";

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

        // If indexing finished, notify parent
        if (res.status === "idle" && res.files_done > 0 && res.files_done >= res.files_total) {
          onComplete();
        }
      } catch (e) {
        console.error("Failed to fetch status:", e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progress = status.files_total > 0
    ? Math.round((status.files_done / status.files_total) * 100)
    : 0;

  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleCancel = async () => {
    try {
      await invoke("stop_indexing");
      onCancel();
    } catch (e) {
      console.error("Failed to stop:", e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px] animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="animate-fade-in-up z-10 flex flex-col items-center">
        {/* Progress Ring */}
        <div className="relative mb-8">
          <svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90">
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="hsl(228, 10%, 16%)"
              strokeWidth="6"
            />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(262, 83%, 68%)" />
                <stop offset="100%" stopColor="hsl(320, 80%, 70%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold gradient-text">{progress}%</span>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-1">Indexing your files...</h2>
          <p className="text-muted-foreground text-sm">
            {status.files_done.toLocaleString()} of {status.files_total.toLocaleString()} files processed
          </p>
        </div>

        {/* Progress bar (secondary) */}
        <div className="w-72 h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 text-muted-foreground/50 mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium tracking-wider uppercase">Vish</span>
        </div>

        {/* Cancel */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
        >
          <XCircle className="w-4 h-4" />
          Cancel indexing
        </button>
      </div>
    </div>
  );
}
