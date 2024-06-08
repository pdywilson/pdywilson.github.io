document.addEventListener('DOMContentLoaded', async () => {
    const loginContainer = document.getElementById('login-container');
    const recipeContainer = document.getElementById('recipe-container');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const googleLoginButton = document.getElementById('google-login');
    const newRecipeInput = document.getElementById('new-recipe');
    const addRecipeButton = document.getElementById('add-recipe');
    const recipeList = document.getElementById('recipe-list');
    const recipeDetailContainer = document.getElementById('recipe-detail-container');
    const recipeNameInput = document.getElementById('recipe-name');
    const recipeInstructionsInput = document.getElementById('recipe-instructions');
    const updateRecipeButton = document.getElementById('update-recipe');
    let recipes = [];
    let currentRecipeId = null;

    if (pb.token) {
        loginContainer.classList.add('hidden');
        recipeContainer.classList.remove('hidden');
        await fetchRecipes();
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            await pb.authWithPassword(email, password);
            loginContainer.classList.add('hidden');
            recipeContainer.classList.remove('hidden');
            await fetchRecipes();
        } catch (error) {
            console.error('Login failed', error);
        }
    });

    googleLoginButton.addEventListener('click', async () => {
        try {
            const url = await pb.getOAuth2Url('google');
            window.location.href = url;
        } catch (error) {
            console.error('Google login failed', error);
        }
    });

    addRecipeButton.addEventListener('click', async () => {
        const newRecipe = await pb.addRecipe("", "");
        await pb.getRecipes();
        await fetchRecipes();
        showRecipe(newRecipe.id);
    });

    recipeList.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
            const id = e.target.dataset.id;
            await pb.deleteRecipe(id);
            await fetchRecipes();
        } else if (e.target.tagName === 'LI') {
            const id = e.target.dataset.id;
            showRecipe(id);
        }
    });

    updateRecipeButton.addEventListener('click', async () => {
        const name = recipeNameInput.value;
        const instructions = recipeInstructionsInput.value;
        if (currentRecipeId && name && instructions) {
            await pb.updateRecipe(currentRecipeId, name, instructions);
            await fetchRecipes();
        }
    });

    async function fetchRecipes() {
        const recipeData = await pb.getRecipes();
        recipes = recipeData.items;
        renderRecipeList();
    }

    function renderRecipeList() {
        recipeList.innerHTML = recipes.map(recipe => `
      <li data-id="${recipe.id}">
        ${recipe.name}
        <button data-id="${recipe.id}">Delete</button>
      </li>
    `).join('');
    }

    function showRecipe(id) {
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
            currentRecipeId = recipe.id;
            recipeNameInput.value = recipe.name;
            recipeInstructionsInput.value = recipe.instructions;
            recipeDetailContainer.classList.remove('hidden');
        } else {
            console.error('recipe undefined')
        }
    }
});