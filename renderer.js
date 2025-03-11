document.getElementById('connect-btn').addEventListener('click', () => {
    const host = document.getElementById('server-ip').value;
    const port = document.getElementById('server-port').value;
    
    // Call the API exposed by preload.js
    window.electronAPI.send('connect', { host, port });
});

document.getElementById('send-btn').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    window.electronAPI.send('message', message);
});