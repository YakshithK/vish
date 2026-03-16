// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod indexer;
pub mod embedding;
pub mod store;
pub mod search;
pub mod commands;

fn main() {
    // Use the app's local data directory for storing vectors
    let data_dir = dirs::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("sensedesk");

    let app_state = commands::AppState::new(data_dir);

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::set_api_key,
            commands::start_indexing,
            commands::pause_indexing,
            commands::resume_indexing,
            commands::stop_indexing,
            commands::get_indexer_status,
            commands::search,
            commands::open_file,
            commands::reveal_in_explorer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
