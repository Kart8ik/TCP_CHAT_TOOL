import {createConnection} from 'net'
let client;

function connectToServer(host, port) {
    console.log(`Attempting to connect to ${host}:${port}`);
    client = createConnection({ host, port }, () => {
        console.log('Connected to server');
    });
    client.on('data', data => {
        document.getElementById('chat-box').innerHTML += `<p>${data}</p>`;
    });
}

function sendMessage(msg) {
    if (client) client.write(msg);
}

if (window.electron && typeof window.electron.receive === 'function') {
    window.electron.receive('connect', (host, port) => connectToServer(host, port));
    window.electron.receive('message', msg => sendMessage(msg));
} else {
    console.error('electron API not available');
}