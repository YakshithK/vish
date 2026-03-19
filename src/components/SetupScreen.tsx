import { useState, useRef, DragEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ArrowRight, FolderOpen, Check, X } from "lucide-react";
import { VishLogo } from "./VishLogo";

interface SetupScreenProps {
  onStartIndexing: () => void;
}

export function SetupScreen({ onStartIndexing }: SetupScreenProps) {
  const [folderPath, setFolderPath] = useState("");
  const [folders, setFolders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFolder = (path: string) => {
    const trimmed = path.trim();
    if (trimmed && !folders.includes(trimmed)) {
      setFolders((prev) => [...prev, trimmed]);
      setFolderPath("");
      // Trigger ripple animation
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 1500);
    }
  };

  const removeFolder = (path: string) => {
    setFolders((prev) => prev.filter((f) => f !== path));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && folderPath.trim()) {
      addFolder(folderPath);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const items = e.dataTransfer.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            addFolder((file as any).path || file.name);
          }
        }
      }
    }
  };

  const handleContinue = async () => {
    if (folders.length === 0) {
      setError("Please add at least one folder to index.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await invoke("start_indexing", { folders });
      onStartIndexing();
    } catch (e: any) {
      setError(e.toString());
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/5 blur-[120px] animate-float" />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Sonar ripple on folder add */}
      {showRipple && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-40 h-40 rounded-full border border-cyan-400/30 animate-sonar" />
          <div className="absolute w-40 h-40 rounded-full border border-cyan-400/20 animate-sonar" style={{ animationDelay: "0.3s" }} />
        </div>
      )}

      <div className="animate-fade-in-up z-10 flex flex-col items-center max-w-2xl w-full">
        {/* Logo */}
        <VishLogo size={72} glowing className="mb-8" />
        <h1 className="text-5xl font-display font-bold gradient-text-cyan tracking-tight mb-3">
          Casting the Net
        </h1>
        <p className="text-xl font-medium text-frost/70 mb-10">
          Where should Vish look?
        </p>

        {/* Drop Zone */}
        <div
          className={`w-full rounded-[2rem] p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 drop-zone ${isDragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="w-20 h-20 rounded-2xl bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center mb-6 shadow-2xl">
            <FolderOpen className="w-10 h-10 text-cyan-400/80" />
          </div>
          <p className="text-lg text-frost/60 text-center font-body">
            Drop your Documents, Code, or Projects here.
          </p>
        </div>

        {/* Manual path input */}
        <div className="w-full mt-4 relative">
          <input
            ref={inputRef}
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste directory path (e.g., C:\Users\YourUser\Documents)"
            className="w-full px-6 py-5 pr-14 rounded-2xl border border-cyan-400/20 bg-deepsea-light/40 text-frost placeholder:text-frost/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all text-base font-mono shadow-inner"
          />
          {folderPath.trim() && (
            <button
              onClick={() => addFolder(folderPath)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-all font-bold"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Folder list */}
        {folders.length > 0 && (
          <div className="w-full mt-4 space-y-2">
            {folders.map((folder, idx) => (
              <div
                key={folder}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl glass-card animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-base text-frost/90 truncate flex-1 font-mono">
                  {folder}
                </span>
                <button
                  onClick={() => removeFolder(folder)}
                  className="p-1 rounded-lg hover:bg-white/5 text-frost/30 hover:text-frost/60 transition-all shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="w-full mt-3 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-fade-in">
            {error}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={isLoading || folders.length === 0}
          className="mt-10 px-12 py-4 rounded-2xl font-display font-bold text-lg tracking-widest transition-all flex items-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed
                     bg-gradient-to-r from-cyan-400 to-cyan-500 text-deepsea hover:from-cyan-300 hover:to-cyan-400 glow-cyan-strong hover:-translate-y-1"
        >
          {isLoading ? "INITIALIZING..." : "CONTINUE"}
          {!isLoading && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
