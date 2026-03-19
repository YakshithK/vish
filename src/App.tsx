import { SetupScreen } from "./components/SetupScreen";
import { IndexingScreen } from "./components/IndexingScreen";
import { SearchBar } from "./components/SearchBar";
import { ResultList } from "./components/ResultList";
import { SettingsPanel } from "./components/Settings/SettingsPanel";
import { useSearch } from "./hooks/useSearch";
import { useAppState } from "./hooks/useAppState";
import { VishLogo } from "./components/VishLogo";
import { Settings, Loader2 } from "lucide-react";
import { useState } from "react";

import "./App.css";

function App() {
  const { screen, setScreen } = useAppState();
  const { results, isSearching, error, search } = useSearch();
  const [showSettings, setShowSettings] = useState(false);

  // Loading state
  if (screen === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/3 to-transparent" />
        <div className="flex flex-col items-center gap-4 animate-fade-in z-10">
          <VishLogo size={48} glowing />
          <Loader2 className="w-5 h-5 text-cyan-400/50 animate-spin" />
        </div>
      </div>
    );
  }

  // Setup screen
  if (screen === "setup") {
    return <SetupScreen onStartIndexing={() => setScreen("indexing")} />;
  }

  // Indexing screen
  if (screen === "indexing") {
    return (
      <IndexingScreen
        onComplete={() => setScreen("search")}
        onCancel={() => setScreen("setup")}
      />
    );
  }

  // Search screen (main app)
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute top-[-30%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-cyan-400/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[300px] rounded-full bg-violet-500/3 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className={`flex items-center justify-between px-8 py-5 z-20 transition-all duration-700 ${results.length === 0 && !isSearching ? "opacity-0 translate-y-[-20px] pointer-events-none" : "opacity-100 translate-y-0"}`}>
        <div className="flex items-center gap-3">
          <VishLogo size={32} />
          <span className="text-xl font-display font-bold gradient-text tracking-wide">
            Vish
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              showSettings
                ? "bg-cyan-400/10 text-cyan-400"
                : "text-frost/40 hover:text-cyan-400 hover:bg-cyan-400/10"
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mb-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
        </div>
      )}

      {showSettings ? (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onReindex={() => {
            setShowSettings(false);
            setScreen("setup");
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col z-10">
          {/* Search section */}
          <div
            className={`flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              results.length === 0 && !isSearching
                ? "flex-1 justify-center -mt-20"
                : "pt-2"
            }`}
          >
            {results.length === 0 && !isSearching && (
              <div className="text-center mb-10 px-8 animate-fade-in-up">
                <VishLogo size={80} glowing className="mx-auto mb-8 drop-shadow-2xl" />
                <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4 tracking-tight">
                  What are you looking for?
                </h2>
                <p className="text-frost/50 text-xl font-medium max-w-lg mx-auto leading-relaxed">
                  Search through your local files, code, and documents using natural language.
                </p>
              </div>
            )}
            <SearchBar
              onSearch={search}
              isLoading={isSearching}
              onSettingsClick={() => setShowSettings(true)}
              compact={results.length > 0 || isSearching}
            />
          </div>

          {results.length > 0 && (
            <div className="animate-fade-in flex-1 overflow-hidden">
              <ResultList results={results} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default App;
