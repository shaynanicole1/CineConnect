"use strict";

// Define the global variables
const titleInput = document.querySelector("#movie-title");
const MAX_MOVIES = 10;

////////////////////////////////////////////////////////////
//Test data
// the movie object is an example of the data that you will use as input to the functions
let movie = {
    posterUrl: "https://m.media-amazon.com/images/I/71r9HrZl0cL._AC_SY679_.jpg",
    title: "The Godfather",
    runtime: "176 min",
    rating: "PG-13",
    imdbRating: "9.2",
    rottentTomatesRating: "98%",
    streaming: [
        { service: "netflix", type: "buy", price: "$5.99", currency: "USD" },
        { service: "netflix", type: "rent", price: "$3.99", currency: "USD" },
        {
            service: "prime",
            type: "subscription",
            price: "9.99 CAD",
        },
    ],
    plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    genres: ["Crime", "Drama"],
    year: "1972",
    director: "Francis Ford Coppola",
    actors: "Marlon Brando, Al Pacino, James Caan",
};

// Alexis
// Create a function that will create a movie card and return it
//when user press "Detail" button, it will show the modal
function createMovieCard(movie) {
    let column = document.createElement("div");
    column.setAttribute(
        "class",
        "column is-12-tablet is-6-desktop is-4-widescreen is-3-fullhd"
    );

    let card = document.createElement("div");
    card.setAttribute("class", "card");

    column.appendChild(card);

    card.innerHTML = `<div class="card-image">
    <figure class="image is-4by3">
      <img
        src="${movie.posterUrl}"
        alt="${movie.title} poster"
      />
    </figure>
  </div>
  <div class="card-content">
    <div class="content">
        <h3>${movie.title}</h3>
        <span class="mr-2">${movie.year}</span>
        <span class="mr-2">${movie.imdbRating}/10</span>
        <span>${movie.runtime}</span>
        <p><strong>Rating:</strong> ${movie.rating}</p>
        <p><strong>Genres:</strong> ${movie.genres.join(", ")}</p>
        <p><strong>Streaming:</strong></p>
        <ul>
            ${movie.streaming
                .map((stream) => {
                    return `<li>${stream.service} - ${stream.type} - ${stream.price}`;
                })
                .join("")}
        </ul>
        <footer class="card-footer ">
            <button onclick="handleCardDetailBtn(event)" data-imdbid="${
                movie.imdbID
            }" class="button is-primary">Details...</button>
      </footer>
    </div>
  </div>`;

    return column;
}

function handleCardDetailBtn(event) {
    //search for the movie in the moviesList array by imdbId
    let imdbid = event.target.getAttribute("data-imdbid");
    let movie = moviesList.find((movie) => movie.imdbID === imdbid);
    if (movie) {
        let modal = createModalDlg(movie);
        modal.classList.add("is-active");
    } else {
        console.error("Movie not found!");
    }
}

function makeCardsEqualSize() {
    let maxHeight = Math.max.apply(
        null,
        $(".card")
            .map(function () {
                return $(this).height();
            })
            .get()
    );
    let maxWidth = Math.max.apply(
        null,
        $(".card")
            .map(function () {
                return $(this).width();
            })
            .get()
    );
    // Set the height of all cards to the tallest one
    $(".card").height(maxHeight);
    $(".card").width(maxWidth);
}

//Preeya

function createModalDlg(movie) {
    let modal = document.createElement("div");
    modal.setAttribute("id", "modal_dialog");
    modal.setAttribute("class", "modal");

    modal.innerHTML = `<div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">${movie.title}</p>
        <button id="close-modal" class="delete" aria-label="close" onclick="document.getElementById('modal_dialog').classList.remove('is-active');"></button>
      </header>
      <section class="modal-card-body">
      <img
        src="${movie.posterUrl}"
        alt="movie poster"
      />
      <h2 class="is-size-3">${movie.title}</h2>
      <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
      <p><strong>Runtime:</strong> ${movie.runtime}</p>
      <p><strong>Rating:</strong> ${movie.rating}</p>
      <p><strong>Genres:</strong> ${movie.genres.join(", ")}</p>
      <p><strong>Year:</strong> ${movie.year}</p>
      <p><strong>Plot:</strong> <blockquote style="padding:0px 10px;">${
          movie.plot
      }</blockquote></p>
      <p><strong>Cast:</strong> ${movie.actors}</p>
      <p><strong>Director:</strong> ${movie.director}</p>
      <p><strong>Streaming Services:</strong></p>
      <ul style="padding-left:2rem;">
          ${movie.streaming
              .map((stream) => {
                  return `<li>${stream.service} - ${stream.type} - ${stream.price}`;
              })
              .join("")}
      </ul>
  
      </section>
      <footer class="modal-card-foot ">
        <div class="buttons">
        <button onclick="handleAddToWatchList(event)" data-imdbid="${
            movie.imdbID
        }" class="button is-primary">Add to Watch List</button>
        </div>
      </footer>
    </div>`;

    let container = document.getElementById("modal-dialog-container");
    container.innerHTML = "";
    container.appendChild(modal);

    return modal;
}


function handleAddToWatchList(event) {
    // add the movie to the local storage
    // get the imdbId from the event
    console.log("Add to watch list button clicked!");
    let imdbId = event.target.getAttribute("data-imdbid");
    console.log("IMDB ID: ", imdbId);
    let movie = moviesList.find((movie) => movie.imdbID === imdbId);
    console.log("Movie to add to watch list: ", movie);
    if (movie) {
        let watchList = JSON.parse(localStorage.getItem("watchList")) || [];
        // check if the movie is already in the watch list
        if (watchList.find((m) => m.imdbID === imdbId)) {
            return;
        }
        watchList.push(movie);
        localStorage.setItem("watchList", JSON.stringify(watchList));
    }
}

//Ehsan
// Create a function that will search for movies and return the list of movies
// The function will use the titleInput value to search for movies
// If the titleInput is empty, it will search by other parameters (year, genre, streaming service and price)
async function search() {
    let streamingData = null;
    if (titleInput.value.trim() !== "") {
        streamingData = await getStreamingDataByTitle(titleInput.value.trim());
    } else {
        let params = createFilterSearchParams(
            2024,
            2024,
            null,
            ["prime", "netflix"],
            false
        );
        streamingData = await getStreamingData(params, API_URL.Filter_Search);
    }

    return createMovieList(streamingData);
}

async function createMovieList(streamingData) {
    let moviesList = [];
    for (
        let i = 0;
        moviesList.length < MAX_MOVIES && i < streamingData.result.length;
        i++
    ) {
        //if the movie is not available in Canada skip it
        if (
            !streamingData.result[i].streamingInfo.ca ||
            streamingData.result[i].streamingInfo.ca.length === 0
        ) {
            continue;
        }

        let imdbId = streamingData.result[i].imdbId;
        let ratingData = await getRatingData(imdbId, API_URL.IMDb_Rating);

        if (
            ratingData &&
            ratingData.Response === "True" &&
            ratingData.Poster !== "N/A"
        ) {
            let movie = new Movie(streamingData.result[i], ratingData);
            moviesList.push(movie);
        }
    }
    return sortMovies(moviesList, "imdbRating"); // Justin: for testing the sorting function
}

/*
Usage Example:
const sortedMoviesByYear = sortMovies(movies, "year");
const sortedMoviesByIMDBRating = sortMovies(movies, "imdbRating");
*/
function sortMovies(moviesList, sortingKey) {
    // Check if the sortingKey is valid
    if (!moviesList.length || !moviesList[0][sortingKey]) {
        console.error("Invalid sorting key or empty movie list");
        return [];
    }

    // Sorting function based on the sortingKey
    const sortingFunction = (a, b) => {
        const valueA = a[sortingKey];
        const valueB = b[sortingKey];

        // For numeric values, convert them to numbers before comparison
        if (!isNaN(parseFloat(valueA)) && !isNaN(parseFloat(valueB))) {
            return parseFloat(valueB) - parseFloat(valueA);
        }

        // For strings, perform lexicographic comparison
        return valueA.localeCompare(valueB);
    };

    // Sort the moviesList array
    return moviesList.slice().sort(sortingFunction);
}

//Ehsan
function showResults(movies) {
    const movieContainer = document.querySelector("#movie-container");
    movieContainer.innerHTML = "";
    // create the movie cards and display them
    for (let movie of movies) {
        console.log(movie);
        let movieCard = createMovieCard(movie);
        movieContainer.appendChild(movieCard);
    }
        makeCardsEqualSize();
}

//Hussein
// this code will be called when the watch list page is loaded
function loadWatchList() {
    // load the watchlist from the local storage
    // create the movie cards and display them
}

async function handleSearch(e) {
    let movies = await search();

    showResults(movies);
}

//On page load get the streaming data for the new movies and shows them
async function initPage() {
    const currentYear = new Date().getFullYear();
    let params = createFilterSearchParams(
        currentYear,
        currentYear,
        ["Comedy"],
        ["prime", "netflix"],
        false
    );
    let streamingData = await getStreamingData(params, API_URL.Filter_Search);
    let moviesList = await createMovieList(streamingData);
    showResults(moviesList);
}
document.addEventListener("DOMContentLoaded", function () {
    document
        .querySelector("#search-btn")
        .addEventListener("click", handleSearch);
    initPage();
});
