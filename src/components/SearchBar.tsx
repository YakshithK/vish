import { FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  value: string;
  onValueChange: (query: string) => void;
  variant?: "hero" | "window";
}

export function SearchBar({
  onSearch,
  isLoading,
  value,
  onValueChange,
  variant = "hero",
}: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const isHero = variant === "hero";

  if (isHero) {
    return (
      <div className="forest-search-shell mx-auto">
        <form onSubmit={handleSubmit}>
          <label
            className="forest-search-input flex items-center gap-4 px-6 py-5 md:px-8 md:py-6"
          >
            <input
              type="text"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="ask vish anything..."
              className="mono-ui min-w-0 flex-1 bg-transparent text-2xl font-medium text-white outline-none italic placeholder:not-italic md:text-[2.6rem]"
              style={{ caretColor: "rgba(155,255,215,0.9)" }}
              autoFocus
            />

            {isLoading && (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[var(--text-dim)]" />
            )}

            {!isLoading && (
              <kbd
                className="mono-ui shrink-0"
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-dim)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 5,
                  padding: "2px 6px",
                  opacity: value ? 0.9 : 0.4,
                  transition: "opacity 150ms",
                }}
              >
                ↵
              </kbd>
            )}
          </label>
        </form>
      </div>
    );
  }

  // Compact top-bar variant
  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <label className="vish-search-compact flex items-center gap-2">
        {isLoading ? (
          <Loader2
            style={{ width: 14, height: 14, flexShrink: 0, color: "var(--text-dim)" }}
            className="animate-spin"
          />
        ) : (
          <Search
            style={{ width: 14, height: 14, flexShrink: 0, color: "var(--text-dim)" }}
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="search..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "0.8rem",
            color: "var(--text-main)",
            fontFamily: "inherit",
          }}
          className="placeholder:text-[var(--text-dim)]"
        />
        {value && (
          <kbd
            style={{
              fontSize: "0.6rem",
              color: "var(--text-dim)",
              border: "1px solid var(--border-faint)",
              borderRadius: 3,
              padding: "1px 4px",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            ↵
          </kbd>
        )}
      </label>
    </form>
  );
}
