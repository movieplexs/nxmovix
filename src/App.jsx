const API_KEY = 'e07ff3f0a793158b92b5bb6029b2ce4a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const SEARCH_URL = `${BASE_URL}/search/movie`;

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');

// Fetch movie data from TMDb API
async function fetchMovies(query) {
  const url = `${SEARCH_URL}?api_key=${API_KEY}&query=${query}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

// Render movies
function renderMovies(movies) {
  gallery.innerHTML = '';

  movies.forEach(movie => {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');

    const image = document.createElement('img');
    image.src = `${IMAGE_BASE_URL}/${movie.poster_path}`;
    image.alt = movie.title;

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const overlayContent = document.createElement('div');
    overlayContent.classList.add('overlay-content');
    overlayContent.textContent = movie.title;

    overlay.appendChild(overlayContent);
    movieElement.appendChild(image);
    movieElement.appendChild(overlay);

    // Open movie link on click
    movieElement.addEventListener('click', () => {
      const movieId = movie.id;
      const movieUrl = `https://filmku.online/embed/${movieId}`;


      window.open(movieUrl, '_blank');
    });

    gallery.appendChild(movieElement);
  });
}

// Perform search on input change
searchInput.addEventListener('input', async () => {
  const query = searchInput.value;
  if (query.trim() !== '') {
    const movies = await fetchMovies(query);
    renderMovies(movies);
  } else {
    gallery.innerHTML = '';
  }
});


import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { fetchDataFromApi } from "./utils/api";

import { useSelector, useDispatch } from "react-redux";
import { getApiConfiguration, getGenres } from "./store/homeSlice";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Details from "./pages/details/Details";
import SearchResult from "./pages/searchResult/SearchResult";
import Explore from "./pages/explore/Explore";
import PageNotFound from "./pages/404/PageNotFound";

function App() {
    const dispatch = useDispatch();
    const { url } = useSelector((state) => state.home);
    console.log(url);

    useEffect(() => {
        fetchApiConfig();
        genresCall();
    }, []);

    const fetchApiConfig = () => {
        fetchDataFromApi("/configuration").then((res) => {
            console.log(res);

            const url = {
                backdrop: res.images.secure_base_url + "original",
                poster: res.images.secure_base_url + "original",
                profile: res.images.secure_base_url + "original",
            };

            dispatch(getApiConfiguration(url));
        });
    };

    const genresCall = async () => {
        let promises = [];
        let endPoints = ["tv", "movie"];
        let allGenres = {};

        endPoints.forEach((url) => {
            promises.push(fetchDataFromApi(`/genre/${url}/list`));
        });

        const data = await Promise.all(promises);
        console.log(data);
        data.map(({ genres }) => {
            return genres.map((item) => (allGenres[item.id] = item));
        });

        dispatch(getGenres(allGenres));
    };

    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:mediaType/:id" element={<Details />} />
                <Route path="/search/:query" element={<SearchResult />} />
                <Route path="/explore/:mediaType" element={<Explore />} />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

export default App;
