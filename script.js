const apiKey = '4e10e3f8d441452abd3df66a4c1b2019'; 
// const apiKey = '5b0b334b957e4c1786851ba6483ea420';
const resultsDiv = document.getElementById('results');
const aiResultsDiv = document.getElementById('ai-results');
const popularIndianList = document.getElementById('popular-indian-list');
const weeklyPlanResults = document.getElementById('weekly-plan-results');

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

// Search Recipes
document.getElementById('search-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const query = document.getElementById('search-input').value;
    const cuisine = document.getElementById('cuisine-select').value;
    const dietary = document.getElementById('dietary-select').value;
    const lifestyle = document.getElementById('lifestyle-select').value;
    if (query.trim() === '') {
        alert('Please enter a search term.');
        return;
    }
    await searchRecipes(query, cuisine, dietary, lifestyle);
});

async function searchRecipes(query, cuisine = '', dietary = '', lifestyle = '') {
    let url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}&number=12`;
    if (cuisine) url += `&cuisine=${cuisine}`;
    if (dietary) {
        if (['glutenfree', 'vegan', 'vegetarian'].includes(dietary)) url += `&diet=${dietary}`;
        else if (['lactose', 'nut', 'dairy'].includes(dietary)) url += `&intolerances=${dietary}`;
    }
    if (lifestyle) {
        if (lifestyle === 'gym') url += '&minProtein=30';
        else if (lifestyle === 'diet') url += '&maxCalories=500';
        else if (lifestyle === 'bulking') url += '&minCalories=700';
        else if (lifestyle === 'keto') url += '&diet=ketogenic';
        else if (lifestyle === 'paleo') url += '&diet=paleo';
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        if (data.results.length === 0) {
            resultsDiv.innerHTML = `<p>No ${cuisine ? cuisine + ' ' : ''}${dietary ? dietary + ' ' : ''}${lifestyle ? lifestyle + ' ' : ''}recipes found.</p>`;
        } else {
            displayResults(data.results, resultsDiv);
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        resultsDiv.innerHTML = '<p>Failed to fetch recipes. Please try again later.</p>';
    }
}

// AI Recipe Suggestions
document.getElementById('ingredient-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const ingredients = document.getElementById('ingredient-input').value;
    const dietary = document.getElementById('dietary-select').value;
    const lifestyle = document.getElementById('lifestyle-select').value;
    if (ingredients.trim() === '') {
        alert('Please enter at least one ingredient.');
        return;
    }
    await suggestRecipes(ingredients, dietary, lifestyle);
});

async function suggestRecipes(ingredients, dietary = '', lifestyle = '') {
    let url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&cuisine=indian&apiKey=${apiKey}&number=5`;
    if (dietary) {
        if (['glutenfree', 'vegan', 'vegetarian'].includes(dietary)) url += `&diet=${dietary}`;
        else if (['lactose', 'nut', 'dairy'].includes(dietary)) url += `&intolerances=${dietary}`;
    }
    if (lifestyle) {
        if (lifestyle === 'gym') url += '&minProtein=30';
        else if (lifestyle === 'diet') url += '&maxCalories=500';
        else if (lifestyle === 'bulking') url += '&minCalories=700';
        else if (lifestyle === 'keto') url += '&diet=ketogenic';
        else if (lifestyle === 'paleo') url += '&diet=paleo';
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        if (data.length === 0) {
            aiResultsDiv.innerHTML = `<p>No Indian ${dietary ? dietary + ' ' : ''}${lifestyle ? lifestyle + ' ' : ''}recipes found.</p>`;
        } else {
            displayResults(data, aiResultsDiv);
        }
    } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        aiResultsDiv.innerHTML = '<p>Failed to fetch suggestions. Please try again later.</p>';
    }
}

// Weekly Meal Plan
document.getElementById('weekly-plan-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const dietary = document.getElementById('weekly-dietary-select').value;
    const lifestyle = document.getElementById('weekly-lifestyle-select').value;
    await generateWeeklyPlan(dietary, lifestyle);
});

async function generateWeeklyPlan(dietary = '', lifestyle = '') {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=7`;
    if (dietary) {
        if (['glutenfree', 'vegan', 'vegetarian'].includes(dietary)) url += `&diet=${dietary}`;
        else if (['lactose', 'nut', 'dairy'].includes(dietary)) url += `&intolerances=${dietary}`;
    }
    if (lifestyle) {
        if (lifestyle === 'gym') url += '&minProtein=30';
        else if (lifestyle === 'diet') url += '&maxCalories=500';
        else if (lifestyle === 'bulking') url += '&minCalories=700';
        else if (lifestyle === 'keto') url += '&diet=ketogenic';
        else if (lifestyle === 'paleo') url += '&diet=paleo';
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        if (data.results.length < 7) {
            weeklyPlanResults.innerHTML = '<p>Not enough recipes found for a full week. Try adjusting filters.</p>';
        } else {
            displayWeeklyPlan(data.results, days);
        }
    } catch (error) {
        console.error('Error generating weekly plan:', error);
        weeklyPlanResults.innerHTML = '<p>Failed to generate weekly plan. Please try again later.</p>';
    }
}

function displayWeeklyPlan(recipes, days) {
    weeklyPlanResults.innerHTML = days.map((day, index) => `
        <div class="recipe-card">
            <h3>${day}: ${recipes[index].title}</h3>
            <img src="${recipes[index].image}" alt="${recipes[index].title}" onclick="showRecipeDetails(${recipes[index].id})">
            <button onclick="addToFavorites(${recipes[index].id}, '${recipes[index].title}', '${recipes[index].image}')">Add to Favorites</button>
        </div>
    `).join('');
}

// Fetch Popular Indian Dishes
async function fetchPopularIndianDishes() {
    const url = `https://api.spoonacular.com/recipes/complexSearch?cuisine=indian&apiKey=${apiKey}&number=6`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        displayResults(data.results, popularIndianList);
    } catch (error) {
        console.error('Error fetching popular Indian dishes:', error);
    }
}

// Display Results (for Search, AI Suggestions, and Popular Indian Dishes)
function displayResults(recipes, container) {
    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <img src="${recipe.image}" alt="${recipe.title}" onclick="showRecipeDetails(${recipe.id})">
            <h3 onclick="showRecipeDetails(${recipe.id})">${recipe.title}</h3>
            <button onclick="addToFavorites(${recipe.id}, '${recipe.title}', '${recipe.image}')">Add to Favorites</button>
        </div>
    `).join('');
}

// Add to Favorites
async function addToFavorites(recipeId, recipeTitle, recipeImage) {
    const favorite = { id: recipeId, title: recipeTitle, image: recipeImage };
    try {
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(favorite),
        });
        if (!response.ok) throw new Error('Failed to add to favorites.');
        alert('Added to favorites!');
    } catch (error) {
        console.error('Error adding to favorites:', error);
        alert('Failed to add to favorites. Please try again later.');
    }
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

// Initial display of popular Indian dishes
fetchPopularIndianDishes();