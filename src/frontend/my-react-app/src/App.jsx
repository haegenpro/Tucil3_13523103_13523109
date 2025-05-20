import { useState, useEffect, useRef } from "react"
import "./index.css"

function App() {
  const [selectedAlgoritma, setSelectedAlgoritma] = useState("1")
  const [selectedHeuristik, setSelectedHeuristik] = useState("1")

  const [rowValue, setRowValue] = useState(1)
  const [columnValue, setColumnValue] = useState(1)
  const [nValue, setNValue] = useState(1)

  const [solverOutput, setSolverOutput] = useState("")
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1000)
  const [currentIdx, setCurrentIdx] = useState(0)
  const intervalRef = useRef(null)

  const handleAlgoritmaChange = (event) => {
    setSelectedAlgoritma(event.target.value)
  }

  const handleHeuristikChange = (event) => {
    setSelectedHeuristik(event.target.value)
  }

  const isHeuristikDisabled = selectedAlgoritma === "1"

  const [configText, setConfigText] = useState("")

  const handleSaveConfig = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowValue,
          columnValue,
          nValue,
          configText,
          algorithm: selectedAlgoritma,
          heuristic: selectedHeuristik,
        }),
      })

      console.log("algo:", selectedAlgoritma)
      console.log("heuristik:", selectedHeuristik)
      const json = await res.json()
      if (json.success) {
        alert("Berhasil menyimpan testWeb.txt!")
        const data = JSON.parse(json.result)
        setSolverOutput(data)
        setCurrentIdx(0)
        console.log("Solver Output:", data)
      } else {
        alert("Gagal simpan: Konfigurasi Papan Anda Bermasalah!" + json.error)
      }
    } catch (err) {
      alert("Error: " + err.message)
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
        setCurrentIdx((i) => {
          const len = solverOutput.solution.length
          return (i + 1) % len
        })
      }, speed)
    }

    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed, solverOutput])

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 z-0 animate-gradient-background"></div>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent animate-pulse-slow-delay"></div>
      </div>

      {/* Sidebar (search space) 40% */}
      <aside className="w-2/5 p-5 overflow-auto z-10 relative">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-5 h-full overflow-auto">
          <h2 className="text-2xl font-bold mb-5 text-purple-800 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
              <path d="M15 3v18" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
            </svg>
            Rush Hour Solver
          </h2>

          <div className="space-y-4">
            <div className="bg-white/70 p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold mb-2 text-purple-700">Algoritma & Heuristik</h3>
              <div className="flex gap-3 mb-0">
                {/* Dropdown Algoritma */}
                <div className="flex-1">
                  <label htmlFor="algoritma-select" className="block text-xs font-medium text-gray-600 mb-1">
                    Algoritma:
                  </label>
                  <select
                    id="algoritma-select"
                    value={selectedAlgoritma}
                    onChange={handleAlgoritmaChange}
                    className="block w-full pl-2 pr-8 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 rounded-md transition-all"
                  >
                    <option value="1">UCS</option>
                    <option value="2">GBFS</option>
                    <option value="3">A*</option>
                    <option value="4">BEAM</option>
                  </select>
                </div>

                {/* Dropdown Heuristik */}
                <div className="flex-1">
                  <label htmlFor="heuristik-select" className="block text-xs font-medium text-gray-600 mb-1">
                    Heuristik:
                  </label>
                  <select
                    id="heuristik-select"
                    value={selectedHeuristik}
                    onChange={handleHeuristikChange}
                    disabled={isHeuristikDisabled}
                    className={`block w-full pl-2 pr-8 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 rounded-md transition-all ${isHeuristikDisabled ? "bg-gray-100 text-gray-500" : ""}`}
                  >
                    <option value="1">Direct Blockers</option>
                    <option value="2">Recurisve Blockers</option>
                    <option value="3">MinSteps</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/70 p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold mb-2 text-purple-700">Dimensi Papan</h3>
              {/* --- Input Row dan Column --- */}
              <div className="flex gap-3 mb-3">
                {/* Row */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Row:</label>
                  <input
                    type="number"
                    min="1"
                    value={rowValue}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setRowValue(Number(e.target.value))}
                    className="min-w-0 w-full border border-gray-300 rounded-md px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                {/* Column */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Column:</label>
                  <input
                    type="number"
                    min="1"
                    value={columnValue}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setColumnValue(Number(e.target.value))}
                    className="min-w-0 w-full border border-gray-300 rounded-md px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* --- Input N  --- */}
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">N:</label>
                <input
                  type="number"
                  min="1"
                  value={nValue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setNValue(Number(e.target.value))}
                  className="min-w-0 w-full border border-gray-300 rounded-md px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="bg-white/70 p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold mb-2 text-purple-700">Konfigurasi</h3>
              {/* --- Input Papan --- */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Konfigurasi Papan:</label>
                <textarea
                  rows={Math.max(5, rowValue)}
                  className="w-full font-mono border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  placeholder={`Contoh:\nAAB..F\n..BCDF\nGPPCDFK\n…`}
                />
              </div>

              {/* ---Tombol Search--- */}
              <button
                onClick={handleSaveConfig}
                className="w-full px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Cari solusi
              </button>
            </div>

            {/* ---Animation Controls--- */}
            <div className="bg-white/70 p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold mb-2 text-purple-700">Animasi</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Speed: {speed} ms/step</label>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="flex-1 px-2 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-1 text-xs"
                  >
                    {isPlaying ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                        Pause
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Play
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false)
                      setCurrentIdx(0)
                    }}
                    className="flex-1 px-2 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1 text-xs"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    </svg>
                    Restart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content 60% */}
      <main className="w-3/5 p-5 overflow-auto z-10 relative">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-5 h-full overflow-auto">
          {solverOutput ? (
            solverOutput.solution ? (
              <div className="max-w-2xl w-full mx-auto">
                <div className="flex gap-4 mb-4">
                  <div className="bg-white/70 p-3 rounded-lg shadow-sm flex-1 flex items-center gap-2">
                    <div className="bg-purple-100 p-1.5 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-purple-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Waktu Eksekusi</p>
                      <p className="text-sm font-semibold text-gray-800">{solverOutput.elapsedTime} ms</p>
                    </div>
                  </div>

                  <div className="bg-white/70 p-3 rounded-lg shadow-sm flex-1 flex items-center gap-2">
                    <div className="bg-purple-100 p-1.5 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-purple-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12h20" />
                        <path d="M12 2v20" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jumlah Ekspansi</p>
                      <p className="text-sm font-semibold text-gray-800">{solverOutput.expansions}</p>
                    </div>
                  </div>
                </div>

                {(() => {
                  const { step, move, board, cars } = solverOutput.solution[currentIdx] || {}
                  return (
                    <div key={step} className="bg-white/70 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <h4 className="font-semibold text-sm text-gray-800">Step {step}</h4>
                        {move && (
                          <span className = "px-2">
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {move.id}-{move.delta > 0 ? (cars.find(c => c.id === move.id)?.orientation==="H" ? "right" : "down") : (cars.find(c=> c.id === move.id)?.orientation==="H" ? "left" : "up")}
                          </span>
                          </span>
                        )}
                      </div>
                      <pre className="bg-white p-3 rounded-md border border-gray-200 overflow-x-auto text-gray-700 text-sm">
                        {board.map((row, rowIndex) => (
                          <div key={rowIndex} className="whitespace-pre">
                            {row.map((c, colIndex) => (
                              <span key={`${rowIndex}-${colIndex}`} className={c === 'P' ? 'text-red-600' : 'text-gray-700'}>
                                {c ?? "."}{" "}
                              </span>
                            ))}
                          </div>
                        ))}
                      </pre>

                      {/* Slider */}
                      <div className="mt-4">
                        <input
                          type="range"
                          min={0}
                          max={solverOutput.solution.length - 1}
                          value={currentIdx}
                          onChange={e => setCurrentIdx(Number(e.target.value))}
                          className="w-full accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>{solverOutput.solution.length - 1}</span>
                        </div>
                      </div>
                    </div>

                  )
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-300 mb-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-lg font-medium">Tidak Ada Solusi</p>
                <p className="mt-1 text-gray-400 text-sm">Coba konfigurasi papan yang berbeda</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-300 mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
              </svg>
              <p className="text-lg font-medium">Konfigurasi Papan Rush Hour</p>
              <p className="mt-1 text-gray-400 text-sm">Masukkan konfigurasi dan klik "Cari solusi"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
