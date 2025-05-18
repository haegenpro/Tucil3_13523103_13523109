import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [selectedAlgoritma, setSelectedAlgoritma] = useState('1');
  const [selectedHeuristik, setSelectedHeuristik] = useState('1');

  const [rowValue, setRowValue] = useState(1)
  const [columnValue, setColumnValue] = useState(1)
  const [nValue, setNValue] = useState(1)

  const [solverOutput, setSolverOutput] = useState('')

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
      } else {
        alert('Gagal simpan: Konfigurasi Papan Anda Bermasalah!'  + json.error)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

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

      </aside>

      {/* Main content 60% */}
      <main className="w-3/5 p-10 overflow-auto font-mono bg-white">
        {solverOutput && (
          <div>
            <p>⏱ Waktu Eksekusi: {solverOutput.elapsedTime} ms</p>
            <p>🔍 Jumlah Ekspansi: {solverOutput.expansions}</p>

            {solverOutput.solution.map(({ step, move, board }) => (
              <div key={step} className="mb-4">
                <h4 className="font-semibold">
                    Step {step}
                    {move
                      ? `: ${move.id}-${
                          move.delta > 0
                            ? (board[0].length > move.delta ? 'right' : 'down')
                            : (move.delta < 0 ? 'left' : 'up')
                        }`
                      : ' (initial)'}
                </h4>
                <pre className="bg-gray-100 p-2 rounded">
                  {board
                    .map(row =>
                      row
                        .map(cell => (cell === null ? '.' : cell))
                        .join(' ')
                    )
                    .join('\n')}
                </pre>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
