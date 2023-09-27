// integrating socket.io
let socket = io();

let searchForm = document.getElementById('searchForm');
let searchBtn = document.getElementById('searchBtn');
let resultsContainer = document.getElementById('results');
let favouritesContainer = document.getElementById('favourites_div');
let favouritesToggle = document.getElementById('favourites');
let audio = document.getElementById('audio')
let countdown = document.getElementById('countdown')
let inp_query = document.getElementById('query');

// player
const fullscreenPlayer = document.getElementById('fullscreenPlayer');
const backgroundElement = document.querySelector('.background'); // Get the background element
const audioFullscreen = document.getElementById('audio');
const closePlayer = document.getElementById('closePlayer');





searchForm.addEventListener('submit', async (event) => {

    event.preventDefault();
    resultsContainer.innerHTML = ''; // Clear previous results
    favouritesContainer.style.display = 'none'
    resultsContainer.style.display = 'block'
    const query = document.getElementById('query').value;

    if (query.trim() === '') {
        return;
    }
    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        data.videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.setAttribute('id', `${video.videoId}`)
            videoElement.classList.add('div')

            videoElement.innerHTML = `
                <div class="image">
                    <img src="${video.thumbnail}"></img>
                </div>
                <div id="title-and-favourites">
                    <div class="title">Title: ${video.title}</div>
                    <i id="add-in-list-${video.videoId}" data-id="${video.videoId}" data-thumbnail="${video.thumbnail}" data-title="${video.title}" class="fa-regular fa-heart add-in-list"></i>
                </div>
                `;
            resultsContainer.appendChild(videoElement);

            // functionality of the favourites playlist
            const addInListId = `add-in-list-${video.videoId}`;
            const addInList = document.getElementById(addInListId);

            if (addInList) {
                // Add a click event listener to the heart icon
                addInList.addEventListener('click', (event) => {
                    event.stopPropagation();

                    // Toggle the class for the clicked element
                    // for adding element to local storage
                    if (addInList.classList.contains('fa-regular')) {

                        refreshFavouriteSongs()

                        addInList.classList.add('fa-solid');
                        addInList.classList.remove('fa-regular');
                        addInList.style.color = 'red';

                        const thumbnailOfDiv = addInList.getAttribute('data-thumbnail');
                        const titleOfDiv = addInList.getAttribute('data-title');
                        const idOfDiv = addInList.getAttribute('data-id');

                        let data = localStorage.getItem("data")

                        if (data == null) {
                            let json = []
                            json.push({
                                thumbnail: thumbnailOfDiv,
                                title: titleOfDiv,
                                id: idOfDiv
                            })
                            alert('saved the song')
                            localStorage.setItem("data", JSON.stringify(json))
                        }

                        else {
                            let json = JSON.parse(localStorage.getItem("data"))
                            json.push({
                                thumbnail: thumbnailOfDiv,
                                title: titleOfDiv,
                                id: idOfDiv
                            })
                            alert('saved')
                            localStorage.setItem("data", JSON.stringify(json))
                        }
                    }

                    // for removing element from local storage
                    else {
                        addInList.classList.remove('fa-solid');
                        addInList.classList.add('fa-regular');
                        addInList.style.color = 'white';

                        // Remove the song from local storage
                        const idOfDiv = addInList.getAttribute('data-id');
                        removeSongFromLocalStorage(idOfDiv);
                    }
                });
            }
            // playing of song after clicking on div of results
            videoElement.addEventListener('click', () => {
                audio.pause()
                startplayer(video.videoId);
                showThumbnail(video.thumbnail);
            });
        });
        console.log(data)
    } catch (error) {
        console.error('Error:', error);
    }
});


// displaying favourites from the local storage
function refreshFavouriteSongs() {

    favouritesContainer.innerHTML = ''

    let data = localStorage.getItem('data')
    if (data == null) {
        favouritesContainer.innerHTML = `
        no songs added here
        to add songs click on the heart in the result thumbnail box
        `
    }
    else {
        let arr = JSON.parse(data)
        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];


            const favouriteElement = document.createElement('div');
            favouriteElement.setAttribute('id', `${element.id}`)
            favouriteElement.classList.add('div')

            favouriteElement.innerHTML = `
                <div class="image">
                <img src="${element.thumbnail}"></img>
            </div>
            <div id="title-and-favourites">
                <div class="title">Title: ${element.title}</div>
                <i id="remove-from-list-${element.id}" data-id="${element.id}" data-thumbnail="${element.thumbnail}"
                    data-title="${element.title}" class="fa-solid fa-heart remove-from-list"></i>
            </div>
                `;

            favouritesContainer.appendChild(favouriteElement);


            // playing of song in the favourites section
            favouriteElement.addEventListener('click', () => {
                audio.pause()
                startplayer(element.id);
                showThumbnail(element.thumbnail);
            });

            // removing song from local storage if clicked on heart
            let removeFromListId = `remove-from-list-${element.id}`;
            let removeFromList = document.getElementById(removeFromListId);

            removeFromList.addEventListener('click', (event) => {
                event.stopPropagation();
                const idOfDiv = removeFromList.getAttribute('data-id');
                removeSongFromLocalStorage(idOfDiv);
            })


        }
    }

}





// for removing the particular song from the local storage
function removeSongFromLocalStorage(idToRemove) {
    let data = localStorage.getItem("data");

    if (data !== null) {
        let json = JSON.parse(data);

        // Finding the index of the song with the matching ID
        const indexToRemove = json.findIndex(item => item.id === idToRemove);

        if (indexToRemove !== -1) {
            json.splice(indexToRemove, 1);
            localStorage.setItem("data", JSON.stringify(json));
            alert('removed the song');
        }
    }

    refreshFavouriteSongs()
}



// player
function showThumbnail(thumbnailUrl) {
    // Update the background image
    backgroundElement.style.backgroundImage = `url(${thumbnailUrl})`;
}


// main player for fetching and starting the player
async function startplayer(audio_ID) {


    try {
        console.log('request sent!')
        const response = await fetch(`/audio?id=${encodeURIComponent(audio_ID)}`, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            const audioUrl = data.url;


            audio.setAttribute('src', `${audioUrl}`)

            console.log(data.url)

            audio.play()

        } else {
            console.error('Error:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


favouritesToggle.addEventListener('click', () => {

    // refreshing favourite songs once on page load
    refreshFavouriteSongs()

    if (favouritesContainer.style.display == 'none') {
        resultsContainer.style.display = 'none'
        favouritesContainer.style.display = 'block'
    }
    else {
        favouritesContainer.style.display = 'none'
    }
})