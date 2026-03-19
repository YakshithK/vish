use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

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
    dirty: tokio::sync::Mutex<bool>,
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
            dirty: tokio::sync::Mutex::new(false),
        })
    }

    /// Check if the store has any indexed points
    pub async fn has_points(&self) -> bool {
        !self.index.lock().await.points.is_empty()
    }

    /// Clear all stored vectors
    pub async fn clear(&self) -> Result<()> {
        let mut idx = self.index.lock().await;
        idx.points.clear();
        self.persist(&idx).await
    }

    /// Delete all points whose payload[key] == value (used to remove old vectors before re-indexing a file)
    pub async fn delete_by_payload(&self, key: &str, value: &str) -> Result<usize> {
        let mut idx = self.index.lock().await;
        let before = idx.points.len();
        idx.points.retain(|p| {
            p.payload.get(key).map(|v| v.as_str()) != Some(value)
        });
        let removed = before - idx.points.len();
        if removed > 0 {
            *self.dirty.lock().await = true;
        }
        Ok(removed)
    }

    /// Prune vectors for files that no longer exist on the physical disk
    pub async fn prune_missing_files(&self) -> Result<usize> {
        let mut idx = self.index.lock().await;
        let before = idx.points.len();
        println!("prune_missing_files: Checking {} points...", before);
        
        idx.points.retain(|p| {
            if let Some(path_str) = p.payload.get("path") {
                let exists = std::path::Path::new(path_str).exists();
                if !exists {
                    println!("prune_missing_files: Path missing: {}", path_str);
                }
                exists
            } else {
                false // remove if no path
            }
        });
        
        let removed = before - idx.points.len();
        println!("prune_missing_files: Removed {} ghost points out of {}", removed, before);
        if removed > 0 {
            *self.dirty.lock().await = true;
        }
        Ok(removed)
    }

    /// Add points to the store (buffers writes, call flush() to persist)
    pub async fn upsert(&self, points: Vec<StoredPoint>) -> Result<()> {
        if points.is_empty() {
            return Ok(());
        }
        let mut idx = self.index.lock().await;
        idx.points.extend(points);
        *self.dirty.lock().await = true;

        // Auto-flush every 200 points to avoid losing too much on crash
        if idx.points.len() % 200 < 10 {
            self.persist(&idx).await?;
            *self.dirty.lock().await = false;
        }
        Ok(())
    }

    /// Explicitly flush buffered writes to disk
    pub async fn flush(&self) -> Result<()> {
        let dirty = *self.dirty.lock().await;
        if dirty {
            let idx = self.index.lock().await;
            self.persist(&idx).await?;
            *self.dirty.lock().await = false;
        }
        Ok(())
    }

    /// Cosine similarity search — returns top `limit` results sorted by score.
    /// Results below `MIN_SCORE_THRESHOLD` are discarded so only genuinely
    /// relevant results are surfaced.
    pub async fn search(&self, query_vector: Vec<f32>, limit: usize) -> Result<Vec<ScoredPoint>> {
        const MIN_SCORE_THRESHOLD: f32 = 0.35;

        let idx = self.index.lock().await;

        if idx.points.is_empty() {
            return Ok(Vec::new());
        }

        let query_norm = norm(&query_vector);
        if query_norm == 0.0 {
            return Ok(Vec::new());
        }

        let mut scored: Vec<ScoredPoint> = idx.points.iter().filter_map(|p| {
            let dot: f32 = p.vector.iter().zip(query_vector.iter()).map(|(a, b)| a * b).sum();
            let p_norm = norm(&p.vector);
            let score = if p_norm > 0.0 { dot / (query_norm * p_norm) } else { 0.0 };
            if score >= MIN_SCORE_THRESHOLD {
                Some(ScoredPoint {
                    id: p.id,
                    score,
                    payload: p.payload.clone(),
                })
            } else {
                None
            }
        }).collect();

        scored.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        scored.truncate(limit);
        Ok(scored)
    }

    pub async fn point_count(&self) -> usize {
        self.index.lock().await.points.len()
    }

    /// Returns the maximum point ID in the store, or None if empty.
    /// Used to derive the next safe ID (avoids collisions after deletions).
    pub async fn max_point_id(&self) -> Option<u64> {
        self.index.lock().await.points.iter().map(|p| p.id).max()
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
