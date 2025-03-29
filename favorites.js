const favoritesList = document.getElementById('favorites-list');

// Modal Elements
const modal = document.getElementById('recipe-modal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalIngredients = document.getElementById('modal-ingredients');
const modalInstructions = document.getElementById('modal-instructions');
const closeModal = document.querySelector('.close');

// Close Modal
closeModal.onclick = () => (modal.style.display = 'none');
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Fetch Favorites
async function fetchFavorites() {
    try {
        const response = await fetch('/api/favorites');
        if (!response.ok) {
            throw new Error('Failed to fetch favorites.');
        }
        const favorites = await response.json();
        displayFavorites(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        favoritesList.innerHTML = '<p>Failed to load favorites. Please try again later.</p>';
    }
}

// Display Favorites
function displayFavorites(favorites) {
    favoritesList.innerHTML = favorites.map(recipe => `
        <div class="recipe-card">
            <img src="${recipe.image}" alt="${recipe.title}" onclick="showRecipeDetails(${recipe.id})">
            <h3 onclick="showRecipeDetails(${recipe.id})">${recipe.title}</h3>
            <button onclick="removeFromFavorites(${recipe.id})">Delete</button>
        </div>
    `).join('');
}

// Remove from Favorites
async function removeFromFavorites(recipeId) {
    try {
        const response = await fetch(`/api/favorites/${recipeId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to remove from favorites.');
        }
        fetchFavorites(); // Refresh the list
    } catch (error) {
        console.error('Error removing from favorites:', error);
        alert('Failed to remove from favorites. Please try again later.');
    }
}

// Show Recipe Details
async function showRecipeDetails(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        displayModal(data);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        alert('Failed to fetch recipe details. Please try again later.');
    }
}

// Display Modal with Recipe Details
function displayModal(recipe) {
    modalTitle.textContent = recipe.title;
    modalImage.src = recipe.image;
    modalIngredients.innerHTML = recipe.extendedIngredients.map(ingredient => `
        <li>${ingredient.original}</li>
    `).join('');
    modalInstructions.textContent = recipe.instructions || 'No instructions available.';
    modal.style.display = 'block';
}

// Initial fetch of favorites
fetchFavorites();