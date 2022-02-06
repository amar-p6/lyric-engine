//server.js
var fs = require('fs'); 
const songDirectory = './data/';

let data = { songs: [] }
getSongLibrary();

function getSongLibrary() {
    fs.promises.readdir(songDirectory)
        .then(filenames => {
            readAllSongItems(filenames);
        })
        .catch(err => {
            console.log(err)
        });
}

function readAllSongItems(filesnames) {
    var readAllFiles = filesnames.map(readSong);
    Promise.all(readAllFiles).then(function() {
        writeSongDatabase();
    })
}

function readSong(filename) {
    return new Promise(resolve => 
        fs.readFile(songDirectory + filename, 'utf-8', function(err, content) {
            if (err) {
                onError(err);
                return;
            }
            console.log("Reading file: " + filename);
            addSongIndex(JSON.parse(content));
            resolve();
        })
    );
}

function addSongIndex(song) {
    console.log("Adding song (ID: " + song.id + "): " + song.title);
    data.songs.push({
        id: song.id,
        title: song.title
    });
}

function writeSongDatabase() {
    const songs = JSON.stringify(data);
    
    fs.writeFile('db.json', songs, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}