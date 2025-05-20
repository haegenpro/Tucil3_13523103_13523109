const express = require('express')
const fs      = require('fs')
const path    = require('path')
const cors    = require('cors')
const { spawn }    = require('child_process')
const { execFileSync } = require('child_process')

const app = express()
app.use(cors())
app.use(express.json())


app.post('/api/save-config', (req, res) => {
    const { rowValue, columnValue, nValue, configText, algorithm, heuristic } = req.body

    const content =
        `${rowValue}` + ` ` + 
        `${columnValue}\n` +
        `${nValue}\n` +
        configText

    const targetDir = path.resolve(__dirname, '../../test')
    const targetFile = path.join(targetDir, 'testWeb.txt')

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    try {
        fs.writeFileSync(targetFile, content, 'utf8')
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, error: err.message })
    }

    const scriptPath = path.resolve(__dirname, '../main.js')
    const scriptTargetFile = path.resolve(__dirname, '../../test/testWeb.txt')

    const child = spawn('node', [
        scriptPath,
        scriptTargetFile,
        algorithm,
        heuristic
    ])

    let output = '', errOut = ''
    child.stdout.on('data', chunk => { output += chunk })
    child.stderr.on('data', chunk => { errOut += chunk })

    child.on('close', code => {
        if (code !== 0) {
        return res
        .status(500)
        .json({ success: false, error: errOut.trim() || `Exited with code ${code}` })
        }
        res.json({ success: true, result: output })
    })


})


// run server port 3001
const PORT = 3001
app.listen(PORT, () => {
  console.log(`🟢 Server running at http://localhost:${PORT}`)
})
