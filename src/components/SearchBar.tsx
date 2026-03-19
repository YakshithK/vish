import { useState, FormEvent } from "react";
import { SearchIcon, Loader2, X, Settings } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  onSettingsClick?: () => void;
  onClose?: () => void;
  compact?: boolean;
}

export function SearchBar({
  onSearch,
  isLoading,
  onSettingsClick,
  onClose,
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className={`w-full px-6 ${compact ? "py-2" : "py-4"}`}>
      <div className="relative max-w-2xl mx-auto">
        {/* Violet glow behind bar when focused/searching */}
        <div
          className={`absolute -inset-3 rounded-3xl transition-all duration-700 pointer-events-none ${
            isFocused || isLoading
              ? "opacity-100"
              : "opacity-0"
          }`}
          style={{
            background: isLoading
              ? "radial-gradient(ellipse at center, rgba(112, 0, 255, 0.15) 0%, rgba(0, 245, 255, 0.05) 50%, transparent 80%)"
              : "radial-gradient(ellipse at center, rgba(0, 245, 255, 0.08) 0%, rgba(112, 0, 255, 0.04) 50%, transparent 80%)",
          }}
        />

        {/* Action buttons (non-compact mode) */}
        {!compact && (onClose || onSettingsClick) && (
          <div className="absolute right-0 top-[-40px] flex items-center gap-2">
            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="p-2 rounded-xl text-frost/40 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all font-bold"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-frost/40 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* The Command Bar */}
        <form onSubmit={handleSubmit} className="relative group">
          <div className={`absolute inset-y-0 left-6 flex items-center pointer-events-none transition-all duration-500`}>
            {isLoading ? (
              <Loader2 className={`${compact ? "w-5 h-5" : "w-8 h-8"} text-cyan-400 animate-spin`} />
            ) : (
              <SearchIcon className={`${compact ? "w-5 h-5" : "w-8 h-8"} text-frost/40 group-focus-within:text-cyan-400 transition-colors duration-300 drop-shadow`} />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask Vish anything... e.g. 'That PDF about marketing...' or 'Q3 Finances'"
            className={`w-full ${compact ? "pl-14 pr-6 py-4 text-base" : "pl-16 pr-8 py-6 text-xl md:text-2xl"} 
                       rounded-[2rem] text-frost placeholder:text-frost/30 font-display
                       focus:outline-none transition-all duration-500 glass-strong shadow-2xl
                       border ${isFocused ? "border-cyan-400/50 glow-cyan-strong" : "border-cyan-400/10"}
                       ${isLoading ? "border-violet-500/50 glow-violet-strong" : ""}`}
            autoFocus
          />
        </form>

        {/* Perspective grid below the bar (non-compact mode) */}
        {!compact && (
          <div className="w-full h-24 mt-2 perspective-grid rounded-b-2xl opacity-40" />
        )}
      </div>
    </div>
  );
}
