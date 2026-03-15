import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])
  const [indexing, setIndexing] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const handleSearch = async () => {
    console.log('Search clicked')
    try {
      const res = await invoke<string[]>('search', { query })
      setResults(res)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleSelectFolders = async () => {
    console.log('Select folders clicked')
    try {
      const folders = await open({ directory: true, multiple: true })
      console.log('Folders selected:', folders)
      if (folders) {
        setSelectedFolders(Array.isArray(folders) ? folders : [folders])
      }
    } catch (error) {
      console.error('Folder selection failed:', error)
    }
  }

  const handleStartIndexing = async () => {
    console.log('Start indexing clicked', selectedFolders)
    if (selectedFolders.length === 0) return
    setIndexing(true)
    try {
      await invoke('start_indexing', { folders: selectedFolders })
      // In a real app, poll status or listen to events
    } catch (error) {
      console.error('Indexing failed:', error)
    } finally {
      setIndexing(false)
    }
  }

  const handleIndexTest = async () => {
    console.log('Index test clicked')
    setIndexing(true)
    try {
      await invoke('start_indexing', { folders: ['/home/yakshith/sensedesk'] })
    } catch (error) {
      console.error('Indexing failed:', error)
    } finally {
      setIndexing(false)
    }
  }

  const handleSaveSettings = async () => {
    console.log('Save settings clicked')
    try {
      await invoke('save_settings', { settings: { apiKey } })
    } catch (error) {
      console.error('Save settings failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">SenseDesk</h1>
      
      {/* Settings */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Settings</h2>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Gemini API Key"
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleSaveSettings} className="px-4 py-2 bg-green-500 text-white rounded">
          Save
        </button>
      </div>

      {/* Indexing */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Indexing</h2>
        <button onClick={handleSelectFolders} className="px-4 py-2 bg-purple-500 text-white rounded mr-2">
          Select Folders
        </button>
        <button 
          onClick={handleStartIndexing} 
          disabled={selectedFolders.length === 0 || indexing}
          className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
        >
          {indexing ? 'Indexing...' : 'Start Indexing'}
        </button>
        <button 
          onClick={handleIndexTest} 
          disabled={indexing}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 ml-2"
        >
          {indexing ? 'Indexing...' : 'Index Test Folder'}
        </button>
        <div className="mt-2">
          Selected: {selectedFolders.join(', ')}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your files..."
          className="flex-1 p-2 border rounded"
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded">
          Search
        </button>
      </div>
      <div>
        {results.length === 0 ? (
          <p>No results yet.</p>
        ) : (
          <ul>
            {results.map((result, i) => (
              <li key={i}>{result}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
