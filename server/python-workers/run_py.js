const { spawn } = require('child_process');
const path = require('path');
 
function runPythonWorker(args = []) {
    const scriptPath = path.resolve(__dirname, '../python-workers/try.py');
    // Use "python" for Windows systems
    const python = spawn('python', [scriptPath, ...args]);
 
    python.stdout.on('data', (data) => {
        console.log(`[Python stdout] ${data.toString()}`);
    });
 
    python.stderr.on('data', (data) => {
        console.error(`[Python stderr] ${data.toString()}`);
    });
 
    python.on('close', (code) => {
        console.log(`[Python exit] Code ${code}`);
    });
}
 
module.exports = runPythonWorker;