# youtube-music-player

this is a music player which fetches the search results from the ecndpoint of youtube API from node.js,

for playing the music it uses the node library youtubedl-core (ytdl-core) converting the mp4 to mp3 and then instead of downloading the link (which is the sole purpose of the library),we just catch the link and from the endpoint we display it through DOM manipulation

for the favourites feature of adding songs into the particular playlist 'favourites' it just uses your local device storage as currently i am incapable of using a database :)

enjoy :)
