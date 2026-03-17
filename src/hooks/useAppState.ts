import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export type AppScreen = "loading" | "setup" | "indexing" | "search";

export function useAppState() {
  const [screen, setScreen] = useState<AppScreen>("loading");
  const [apiKeySet, setApiKeySet] = useState(false);

  const checkState = async () => {
    try {
      // Check if API key is set
      const keyStatus: string = await invoke("get_api_key");
      const hasKey = keyStatus === "set";
      setApiKeySet(hasKey);

      // Check if index exists
      const hasIndex: boolean = await invoke("check_index_exists");

      // Check if currently indexing
      const status: { status: string } = await invoke("get_indexer_status");

      if (status.status === "running" || status.status === "paused") {
        setScreen("indexing");
      } else if (hasIndex) {
        setScreen("search");
      } else {
        setScreen("setup");
      }
    } catch (e) {
      console.error("Failed to check app state:", e);
      setScreen("setup");
    }
  };

  useEffect(() => {
    checkState();
  }, []);

  return {
    screen,
    setScreen,
    apiKeySet,
    setApiKeySet,
    refreshState: checkState,
  };
}
