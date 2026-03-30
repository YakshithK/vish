use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SearchResult {
    pub chunk_id: String,
    pub file_id: String,
    pub path: String,
    pub file_type: String,
    pub text_excerpt: Option<String>,
    pub thumbnail_path: Option<String>,
    pub score: f32,
    pub rank: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SearchFilters {
    pub file_type: Option<String>,
    pub path_prefix: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum PreviewPayload {
    Text {
        title: String,
        path: String,
        file_type: String,
        content: String,
        truncated: bool,
    },
    Image {
        title: String,
        path: String,
        file_type: String,
        data_url: String,
    },
    Pdf {
        title: String,
        path: String,
        file_type: String,
        data_url: String,
        text_excerpt: Option<String>,
    },
    Unsupported {
        title: String,
        path: String,
        file_type: String,
        message: String,
        text_excerpt: Option<String>,
    },
    Error {
        title: String,
        path: String,
        file_type: String,
        message: String,
    },
}
