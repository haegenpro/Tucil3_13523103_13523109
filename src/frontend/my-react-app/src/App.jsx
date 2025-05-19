import { useState, useEffect, useRef } from 'react'
import './index.css'

function App() {
  const [selectedAlgoritma, setSelectedAlgoritma] = useState('1');
  const [selectedHeuristik, setSelectedHeuristik] = useState('1');

  const [rowValue, setRowValue] = useState(1)
  const [columnValue, setColumnValue] = useState(1)
  const [nValue, setNValue] = useState(1)

  const [solverOutput, setSolverOutput] = useState('')
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed]       = useState(1000)
  const [currentIdx, setCurrentIdx] = useState(0)
  const intervalRef = useRef(null)

  const handleAlgoritmaChange = (event) => {
    setSelectedAlgoritma(event.target.value);
  };

  const handleHeuristikChange = (event) => {
    setSelectedHeuristik(event.target.value);
  };

  const isHeuristikDisabled = selectedAlgoritma === '1';

  const [configText, setConfigText] = useState('')

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowValue,
          columnValue,
          nValue,
          configText,
          algorithm: selectedAlgoritma, 
          heuristic: selectedHeuristik, 
        }),
      })

      console.log('algo:', selectedAlgoritma)
      console.log('heuristik:', selectedHeuristik)
      const json = await res.json()
      if (json.success) {
        alert('Berhasil menyimpan testWeb.txt!')
        const data = JSON.parse(json.result)
        setSolverOutput(data)
        setCurrentIdx(0)
      } else {
        alert('Gagal simpan: Konfigurasi Papan Anda Bermasalah!'  + json.error)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  useEffect(() => {
    if (solverOutput?.solution) {
      setCurrentIdx(0)
    }
  }, [solverOutput])

  useEffect(() => {
    clearInterval(intervalRef.current)

    if (isPlaying && solverOutput?.solution) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx(i => {
          const len = solverOutput.solution.length
          return (i + 1) % len
        })
      }, speed)
    }

    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed, solverOutput])
  

  return (
    <div className="flex h-screen">
      {/* Sidebar (search space) 40% */}
      <aside className="w-2/5 bg-gray-100 p-6">
        <h2 className="text-2xl font-semibold mb-4">Rush Hour</h2>
        <div className="flex gap-4 mb-4">

        {/* Dropdown Algoritma */}
        <div className="flex-1">
          <label htmlFor="algoritma-select" className="block text-sm font-medium text-gray-700 mb-1">
            Algoritma:
          </label>
          <select
            id="algoritma-select" 
            value={selectedAlgoritma} 
            onChange={handleAlgoritmaChange} 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" // Contoh styling dengan Tailwind
          >
            <option value="1">UCS</option>
            <option value="2">GBFS</option>
            <option value="3">A*</option>
            <option value="4">BEAM</option>
          </select>
        </div>

        {/* Dropdown Heuristik */}
        <div className="flex-1"> 
          <label htmlFor="heuristik-select" className="block text-sm font-medium text-gray-700 mb-1">
            Heuristik:
          </label>
          <select
            id="heuristik-select" 
            value={selectedHeuristik}
            onChange={handleHeuristikChange}
            disabled={isHeuristikDisabled}
             className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" // Contoh styling dengan Tailwind
          >
            <option value="1">heuristik</option>
            <option value="2">heuristik2</option>
            <option value="3">heuristik3</option>
          </select>
        </div>
      </div>

       {/* --- Input Row dan Column --- */}
      <div className="flex gap-4 mb-6">
        {/* Row */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Row:
          </label>
          <input
            type="number"
            min = "1"
            value={rowValue}
            onFocus={e => e.target.select()}
            onChange={(e) => setRowValue(Number(e.target.value))}
            className="min-w-0 border border-gray-300 rounded px-3 py-2 text-center focus:outline-none"
          />
        </div>

        {/* Column */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Column:
          </label>
          <input
            type="number"
            min = "1"
            value={columnValue}
            onFocus={e => e.target.select()}
            onChange={(e) => setColumnValue(Number(e.target.value))}
            className="min-w-0 border border-gray-300 rounded px-3 py-2 text-center focus:outline-none"
          />
        </div>
      
      </div>

      {/* --- Input N  --- */}
      <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            N:
          </label>
          <input
            type="number"
            min = "1"
            value={nValue}
            onFocus={e => e.target.select()}
            onChange={(e) => setNValue(Number(e.target.value))}
            className="min-w-0 border border-gray-300 rounded px-3 py-2 text-center focus:outline-none"
          />
      </div>

      {/* --- Input Papan --- */}
      <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Konfigurasi Papan:
          </label>
          <textarea
            rows={Math.max(7, rowValue)}
            className="w-full font-mono border border-gray-300 rounded p-2 focus:outline-none"
            value={configText}
            onChange={e => setConfigText(e.target.value)}
            placeholder={`Contoh:\nAAB..F\n..BCDF\nGPPCDFK\n…`}
          />
        </div>

        {/* ---Tombol Search--- */}
      <button
          onClick={handleSaveConfig}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Cari solusi
      </button>

      {/* ---Animation Controls--- */}
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium">
            Speed: {speed} ms/step
          </label>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(p => !p)}
              className="flex-1 px-3 py-1 bg-blue-600 text-white rounded"
            >
              {isPlaying ? '⏸ Pause' : '▶️ Play'}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false)
                setCurrentIdx(0)
              }}
              className="flex-1 px-3 py-1 bg-red-600 text-white rounded"
            >
              ■ Restart
            </button>
          </div>
        </div>

      </aside>

      {/* Main content 60% */}
      <main className="w-3/5 p-10 overflow-auto font-mono bg-white flex justify-center">
      {solverOutput ? (
        solverOutput.solution ? (
          <div>
            <p>⏱ Waktu Eksekusi: {solverOutput.elapsedTime} ms</p>
            <p>🔍 Jumlah Ekspansi: {solverOutput.expansions}</p>
            {(() => {
              const { step, move, board } =
                solverOutput.solution[currentIdx] || {}
              return (
                <div key={step} className="mb-4">
                  <h4 className="font-semibold">
                    Step {step}
                    {move
                      ? `: ${move.id}-${
                          move.delta > 0
                            ? board[0].length > move.delta
                              ? 'right'
                              : 'down'
                            : 'left'
                        }`
                      : ' (initial)'}
                  </h4>
                  <pre className="bg-gray-100 p-2 rounded">
                    {board
                      .map(row => row.map(c => (c ?? '.')).join(' '))
                      .join('\n')}
                  </pre>
                </div>
              )
            })()}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-lg">
            Tidak Ada Solusi
          </div>
        )
      ) : null}
    </main>
    </div>
  )
}

export default App
