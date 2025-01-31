const { spawn } = require('child_process');

const indexBot = spawn('node', ['index.js']);
const aiBot = spawn('node', ['indeo.js']);
const statusBot = spawn('node', ['status.js']);
const voiceBot = spawn('node', ['voice.js']);
const gameBot = spawn('node', ['game.js']);

function logOutput(botName, botProcess) {
    botProcess.stdout.on('data', (data) => {
        console.log(`${botName}: ${data}`);
    });

    botProcess.stderr.on('data', (data) => {
        console.error(`Error from ${botName}: ${data}`);
    });

    botProcess.on('close', (code) => {
        console.log(`${botName} exited with code ${code}`);
    });
}

logOutput('Index Bot', indexBot);
logOutput('AI Bot', aiBot);
logOutput('Status Bot', statusBot);
logOutput('Voice Bot', voiceBot);
logOutput('Game Bot', gameBot);
