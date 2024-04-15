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
    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${movie.posterUrl}" class="card-img-top" alt="${movie.title}">
        <div class="card-body">
            <h3 >${movie.title}</h3>
            <h5 >${movie.imdbRating}</h5>
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                Detail
            </button>
        </div>
    `;

    return card;
}

//Preeya
// Create a function that will create a modal and show it.
// when user press "Add to Watchlist" button, it will add the movie to the watchlist and save it to the local storage
function createModal(movie) {}

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
        null,
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
