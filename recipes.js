const apiKey = '4e10e3f8d441452abd3df66a4c1b2019'; // Replace with your Spoonacular API key
const recipeList = document.getElementById('recipe-list');
const searchBar = document.getElementById('search-bar');
const cuisineFilter = document.getElementById('cuisine-filter');

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

// Fetch Recipes with Pagination (to handle thousands)
async function fetchRecipes(query = '', cuisine = 'indian', offset = 0) {
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=100&offset=${offset}`;
    if (query) url += `&query=${query}`;
    if (cuisine) url += `&cuisine=${cuisine}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        displayRecipes(data.results);
        // Optionally fetch more if totalResults > current offset + number
        if (data.totalResults > offset + 100) {
            fetchRecipes(query, cuisine, offset + 100); // Recursive call for more recipes
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipeList.innerHTML = '<p>Failed to fetch recipes. Please try again later.</p>';
    }
}

// Display Recipes
function displayRecipes(recipes) {
    const html = recipes.map(recipe => `
        <div class="recipe-card" onclick="showRecipeDetails(${recipe.id})">
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <p>Click to view details</p>
            </div>
        </div>
    `).join('');
    recipeList.innerHTML += html; // Append to existing content
}

// Show Recipe Details
async function showRecipeDetails(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
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
    modalInstructions.innerHTML = recipe.instructions ? recipe.instructions.replace(/<[^>]+>/g, '') : 'No instructions available.';
    modal.style.display = 'block';
}

// Search Functionality
searchBar.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    recipeList.innerHTML = ''; // Clear previous results
    fetchRecipes(query, cuisineFilter.value || 'indian');
});

// Cuisine Filter Functionality
cuisineFilter.addEventListener('change', (e) => {
    const cuisine = e.target.value;
    recipeList.innerHTML = ''; // Clear previous results
    fetchRecipes(searchBar.value.trim(), cuisine || 'indian');
});

// Initial Fetch (default to Indian cuisine)
fetchRecipes('', 'indian');