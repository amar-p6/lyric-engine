//server.js
var fs = require('fs'); 
const jsonServer = require('json-server');
let songs = [];

buildSongsDatabase();

// Return only base file name without dir
function buildSongsDatabase() {
    let data = { songs: [] }
    fs.readdir("./data/", function(err, files) {
        files.forEach(function(file) {
            let song = require('./data/' + file);
            songs[song.id] = song;
            data.songs.push({
                id: song.id,
                title: song.title
            });
        });
        startJsonServer(data);
    });
}

function startJsonServer(database) {
    const server = jsonServer.create()
    const router = addSongContentForSongRequest(jsonServer.router(database));
    const middlewares = jsonServer.defaults()
    
    server.use(middlewares)
    server.use(router)
    server.listen(3000, () => {
        console.log('JSON Server is running')
    })
}

function addSongContentForSongRequest(router) {
    router.render = (req, res) => {
        if (res.locals.data.id !== "undefined" && res.locals.data.hasOwnProperty('id')) {
            res.locals.data.content = songs[res.locals.data.id].content;
        }
        res.jsonp(res.locals.data)
    }
    return router;
}