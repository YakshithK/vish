import { useState, FormEvent } from "react";
import { SearchIcon, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full px-6 py-4">
      <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your files... e.g. 'physics notes about momentum'"
          className="w-full pl-12 pr-12 py-4 rounded-2xl border border-border/50 bg-card/50 text-foreground 
                   placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 
                   focus:ring-primary/20 transition-all text-base shadow-lg shadow-black/10 glass"
          autoFocus
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}
      </form>
    </div>
  );
}
