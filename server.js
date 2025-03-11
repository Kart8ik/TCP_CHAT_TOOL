import {createServer} from 'net'
const clients = [];

const server = createServer(socket => {
    console.log('📞 New client connected:', socket.remoteAddress);
    clients.push(socket);
    socket.on('data', data => {
        clients.forEach(client => {
            if (client !== socket) client.write(data);
        });
    });
    socket.on('end', () => {
        clients.splice(clients.indexOf(socket), 1);
    });
});

server.listen(2000, () => console.log('Server running on port 2000'));