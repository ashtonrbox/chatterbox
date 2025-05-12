function startServer() {
    const express = require('express')
    const http = require('http')
    const { Server } = require('socket.io')
    const path = require('path')
    const os = require('os')
    const ogs = require('open-graph-scraper')

    function getLocalIP() {
        const networkInterfaces = os.networkInterfaces();
        for (const interfaceName in networkInterfaces) {
            const interfaces = networkInterfaces[interfaceName];
            for (const interfaceInfo of interfaces) {
                if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
                    return interfaceInfo.address;
                }
            }
        }
        return null;
    }

    const localIP = getLocalIP();
    console.log(`Server is running at http://${localIP}:3000`);

    const app = express()
    const server = http.createServer(app)
    const io = new Server(server)

    const port = 3000

    app.use(express.static(path.join(__dirname, 'public')))

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'))
    })

    app.get('/server-info', (req, res) => {
        const ip = getLocalIP();
        res.json({ ip, port: 3000 });
    });

    app.get('/preview', async (req, res) => {
        let url = req.query.url;
        if (!url) return res.status(400).json({ error: 'Missing URL' });

        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            return res.status(400).json({ error: 'Blocked URL' })
        } else {
            try {
                let { result } = await ogs({ url });
                result.resolvedUrl = url;
                res.json(result)
            } catch (e) {
                res.status(500).json({ error: 'Failed' })
            }
        }

    })


    io.on('connection', (socket) => {

        socket.on('chat message', (msg) => {
            io.emit('chat message', msg)
        })

        socket.on('user connected', (user) => {
            io.emit('user connected', user);
        })

    })

    server.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`)
    })

}

if (require.main === module) {
    startServer()
}

module.exports = { startServer }
