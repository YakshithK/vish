use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

const DIMENSION: usize = 768;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StoredPoint {
    pub id: u64,
    pub vector: Vec<f32>,
    pub payload: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, Default)]
struct VectorIndex {
    points: Vec<StoredPoint>,
}

pub struct ScoredPoint {
    pub id: u64,
    pub score: f32,
    pub payload: HashMap<String, String>,
}

pub struct VectorStore {
    storage_path: PathBuf,
    index: tokio::sync::Mutex<VectorIndex>,
}

impl VectorStore {
    pub fn new(storage_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&storage_dir)
            .context("Failed to create vector storage directory")?;

        let index_path = storage_dir.join("vectors.json");
        let index = if index_path.exists() {
            let data = std::fs::read_to_string(&index_path)
                .context("Failed to read vector index")?;
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            VectorIndex::default()
        };

        Ok(Self {
            storage_path: storage_dir,
            index: tokio::sync::Mutex::new(index),
        })
    }

    /// Clear all stored vectors
    pub async fn clear(&self) -> Result<()> {
        let mut idx = self.index.lock().await;
        idx.points.clear();
        self.persist(&idx).await
    }

    /// Add points to the store
    pub async fn upsert(&self, points: Vec<StoredPoint>) -> Result<()> {
        if points.is_empty() {
            return Ok(());
        }
        let mut idx = self.index.lock().await;
        idx.points.extend(points);
        self.persist(&idx).await
    }

    /// Cosine similarity search — returns top `limit` results sorted by score
    pub async fn search(&self, query_vector: Vec<f32>, limit: usize) -> Result<Vec<ScoredPoint>> {
        let idx = self.index.lock().await;

        if idx.points.is_empty() {
            return Ok(Vec::new());
        }

        let query_norm = norm(&query_vector);
        if query_norm == 0.0 {
            return Ok(Vec::new());
        }

        let mut scored: Vec<ScoredPoint> = idx.points.iter().map(|p| {
            let dot: f32 = p.vector.iter().zip(query_vector.iter()).map(|(a, b)| a * b).sum();
            let p_norm = norm(&p.vector);
            let score = if p_norm > 0.0 { dot / (query_norm * p_norm) } else { 0.0 };
            ScoredPoint {
                id: p.id,
                score,
                payload: p.payload.clone(),
            }
        }).collect();

        scored.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        scored.truncate(limit);
        Ok(scored)
    }

    pub async fn point_count(&self) -> usize {
        self.index.lock().await.points.len()
    }

    async fn persist(&self, idx: &VectorIndex) -> Result<()> {
        let path = self.storage_path.join("vectors.json");
        let data = serde_json::to_string(idx).context("Failed to serialize vector index")?;
        tokio::fs::write(&path, data).await.context("Failed to write vector index")?;
        Ok(())
    }
}

fn norm(v: &[f32]) -> f32 {
    v.iter().map(|x| x * x).sum::<f32>().sqrt()
}
