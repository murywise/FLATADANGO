let currentMovie = null;
const filmsList = document.getElementById('films');
const movieDetails = document.getElementById('movie-details');

// DOM Elements
const poster = document.getElementById('poster');
const title = document.getElementById('title');
const runtime = document.getElementById('runtime');
const showtime = document.getElementById('showtime');
const ticketCount = document.getElementById('ticket-count');
const buyButton = document.getElementById('buy-ticket');
const description = document.getElementById('description');

// API URL
const API_URL = 'http://localhost:3000/films';

// Fetch all films
async function fetchFilms() {
    try {
        const response = await fetch(API_URL);
        const films = await response.json();
        displayFilms(films);
        // Display first movie by default
        if (films.length > 0) {
            displayMovieDetails(films[0]);
            currentMovie = films[0];
        }
    } catch (error) {
        console.error('Error fetching films:', error);
    }
}

// Display films in the menu
function displayFilms(films) {
    filmsList.innerHTML = ''; // Clear any existing content
    
    films.forEach(film => {
        const li = document.createElement('li');
        li.className = 'film item';
        if (film.tickets_sold >= film.capacity) {
            li.classList.add('sold-out');
        }
        
        const filmTitle = document.createElement('span');
        filmTitle.textContent = film.title;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = (e) => deleteFilm(e, film.id);
        
        li.appendChild(filmTitle);
        li.appendChild(deleteBtn);
        
        li.addEventListener('click', () => {
            displayMovieDetails(film);
            currentMovie = film;
            // Remove active class from all films
            document.querySelectorAll('#films li').forEach(item => {
                item.classList.remove('active');
            });
            // Add active class to selected film
            li.classList.add('active');
        });
        
        filmsList.appendChild(li);
    });
}

// Display movie details
function displayMovieDetails(movie) {
    poster.src = movie.poster;
    poster.alt = movie.title;
    title.textContent = movie.title;
    runtime.textContent = movie.runtime;
    showtime.textContent = movie.showtime;
    description.textContent = movie.description;
    
    const availableTickets = movie.capacity - movie.tickets_sold;
    ticketCount.textContent = availableTickets;
    
    // Update button state
    if (availableTickets <= 0) {
        buyButton.textContent = 'Sold Out';
        buyButton.disabled = true;
    } else {
        buyButton.textContent = 'Buy Ticket';
        buyButton.disabled = false;
    }
}

// Buy ticket
buyButton.addEventListener('click', async () => {
    if (!currentMovie) return;
    
    const availableTickets = currentMovie.capacity - currentMovie.tickets_sold;
    
    if (availableTickets <= 0) {
        alert('Sorry, this showing is sold out!');
        return;
    }
    
    try {
        // Update tickets_sold on the server
        const response = await fetch(`${API_URL}/${currentMovie.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tickets_sold: currentMovie.tickets_sold + 1
            })
        });
        
        if (response.ok) {
            // Update local state
            currentMovie.tickets_sold++;
            displayMovieDetails(currentMovie);
            
            // Update the films list to reflect the change
            const films = await fetch(API_URL).then(res => res.json());
            displayFilms(films);
        } else {
            throw new Error('Failed to update ticket count');
        }
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        alert('Failed to purchase ticket. Please try again.');
    }
});

// Delete a film
async function deleteFilm(e, filmId) {
    e.stopPropagation(); // Prevent triggering the film selection
    
    if (!confirm('Are you sure you want to delete this film?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${filmId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Refresh the films list
            const films = await fetch(API_URL).then(res => res.json());
            displayFilms(films);
            
            // If the deleted movie was being displayed, clear the details
            if (currentMovie && currentMovie.id === filmId) {
                clearMovieDetails();
                currentMovie = null;
            }
        } else {
            throw new Error('Failed to delete film');
        }
    } catch (error) {
        console.error('Error deleting film:', error);
        alert('Failed to delete film. Please try again.');
    }
}

// Clear movie details
function clearMovieDetails() {
    poster.src = '';
    poster.alt = '';
    title.textContent = 'No Movie Selected';
    runtime.textContent = '';
    showtime.textContent = '';
    description.textContent = '';
    ticketCount.textContent = '0';
    buyButton.disabled = true;
    buyButton.textContent = 'Select a Movie';
}

// Initialize the app
function init() {
    fetchFilms();
}

// Start the application
init();
