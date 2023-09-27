const http = require('http')
const express = require('express')
const axios = require('axios')
const ytdl = require('ytdl-core');

// express dependency
const app = express()
const path = require('path')
const server = http.createServer(app)

// socket.io dependency integration
const { Server } = require("socket.io");
const io = new Server(server);



// for youtube data api 
const API_KEY = 'AIzaSyA_N8Xqxa3ub_YCZbS0E1338-WKOw3IzYw';
// Base URL for the YouTube Data API
const BASE_URL = 'https://www.googleapis.com/youtube/v3/';


// specifiying path for rendering index.html
app.use(express.static(__dirname + '/client'));

// rendering the index.html at '/' 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
})


// socket io connections and disconnections
io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


// to retrieve the audio from ytdl-core
app.get('/audio', (req, res) => {
    const { id } = req.query;

    const videoUrl = `https://www.youtube.com/watch?v=${id}`;

    (async () => {
        try {
            const info = await ytdl.getInfo(videoUrl, {
                lang: 'en', // Language preference
            });

            const audioFormats = ytdl.filterFormats(info.formats, format =>
                format.mimeType.includes('audio')
            );

            if (audioFormats.length === 0) {
                console.log('No audio formats found for the video.');
                return;
            }

            const highestQualityAudio = audioFormats[0];
            let url = highestQualityAudio.url

            res.json({ url })
        } catch (error) {
            console.error('Error fetching video info:', error);
        }
    })();

})



// Defining a route to search for YouTube videos from the youtube API
app.get('/search', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter missing' });
    }

    const params = {
        key: API_KEY,
        part: 'snippet',
        q: query,
        type: 'video',
    };

    axios.get(BASE_URL + 'search', { params })
        .then(response => {
            const items = response.data.items;
            const videos = items.map(item => ({
                title: item.snippet.title,
                videoId: item.id.videoId,
                thumbnail: item.snippet.thumbnails.high.url
            }));
            res.json({ videos });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Error fetching data' });
        });
});


// listening the server at port 3000 and rendering
server.listen(3000, () => {
    console.log('listening on http://localhost:3000')
})