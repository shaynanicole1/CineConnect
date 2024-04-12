"use strict";

// Define the global variables
const titleInput = document.querySelector("#movie-title");
const MAX_MOVIES = 5;

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

// The Movie object can be created by using Movie function (let movie = new Movie(streamingData, ratingData);
// Shayna will create the Movie objects using the Movie function.
//others just use the movie object as input to the functions
////////////////////////////////////////////////////////////
// streamingData comes from https://streaming-availability.p.rapidapi.com/
// ratingData comes from http://www.omdbapi.com
function Movie(streamingData, ratingData) {
    this.posterUrl = ratingData.Poster;
    this.title = ratingData.Title;
    this.imdbRating = ratingData.Ratings[0].Value;
    this.streaming = [];

    for (let streamingService of streamingData.streamingInfo.ca) {
        let price = "";
        if (
            streamingService.streamingType === "buy" ||
            streamingService.streamingType === "rent"
        ) {
            price = streamingService.price.formatted;
        } else {
            price = streamingService.streamingType;
        }
        this.streaming.push({
            service: streamingService.service,
            type: streamingService.streamingType,
            price: price,
        });
    }
}

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

//Shayna
//the function will get the streaming data just for Canada
// the X-RapidAPI-Key value is the key that you need to use to access the API. You can use it as it is or get your own key
async function getStreamingData() {
    let url = "https://streaming-availability.p.rapidapi.com/search/title";
    let params = {
        title: titleInput.value.trim(),
        country: "ca",
        show_type: "all",
        output_language: "en",
    };
    const headers = {
        "X-RapidAPI-Key": "cf33ab62edmshde9293530f976e1p11beacjsn53110b32fe2d",
        "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com",
    };

    //create the complete URL with the query string
    let searchParams = new URLSearchParams(params);
    url += "?" + searchParams.toString();

    try {
        const responce = await fetch(url, {
            headers: headers,
        });
        const data = await responce.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

//Shayna
//the function will get the rating data from the OMDB API
// the apikey value is the key that you need to use to access the API. You can use it as it is or get your own key
async function getRatingData(imdbId) {
    let url = "https://www.omdbapi.com";
    let params = {
        apikey: "5769dc6",
        i: imdbId,
    };

    let searchParams = new URLSearchParams(params);
    url += "?" + searchParams.toString();

    try {
        const responce = await fetch(url);
        const data = await responce.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

//Shayna
// Create a function that will search for the movie and display the movie card
// the functions: getStreamingData and getRatingData will be called in this function and you can change their code if needed
async function search() {
    let streamingData = await getStreamingData();
    let moviesList = [];
    for (let i = 0; i < MAX_MOVIES; i++) {
        //if the movie is not available in Canada skip it
        if (
            !streamingData.result[i].streamingInfo.ca ||
            streamingData.result[i].streamingInfo.ca.length === 0
        ) {
            continue;
        }

        let imdbId = streamingData.result[i].imdbId;
        let ratingData = await getRatingData(imdbId);

        if (ratingData) {
            let movie = new Movie(streamingData.result[i], ratingData);
            moviesList.push(movie);
        }
    }
    return sortMovies(moviesList,"imdbRating"); // Justin: for testing the sorting function
}

//Justin
// movies is an array of Movie objects
// sortingKey is the key that you want to sort the movies by for example "year", "imdbRating", "rottentTomatesRating", etc.
// you  can use Array.sort() function to sort the movies or implement the sorting algorithm yourself
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

document.addEventListener("DOMContentLoaded", function () {
    document
        .querySelector("#search-btn")
        .addEventListener("click", handleSearch);
});
