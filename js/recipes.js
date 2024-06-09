document.addEventListener('DOMContentLoaded', async () => {
    const loginContainer = document.getElementById('login-container');
    const recipeContainer = document.getElementById('recipe-container');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const googleLoginButton = document.getElementById('google-login');
    const previousVersionButton = document.getElementById('previous-version');
    const nextVersionButton = document.getElementById('next-version');
    const addRecipeButton = document.getElementById('add-recipe');
    const deleteRecipeButton = document.getElementById('delete-recipe')
    const recipeList = document.getElementById('recipe-list');
    const recipeDetailContainer = document.getElementById('recipe-detail-container');
    const recipeNameInput = document.getElementById('recipe-name');
    const recipeInstructionsInput = document.getElementById('recipe-instructions');
    const saveRecipeButton = document.getElementById('save-recipe');
    const title = document.getElementById('title');
    let recipes = [];
    // e.g. [{ recipeId: 1, version: 1 }, { recipeId: 1, version: 2 }, { recipeId: 2, version: 1 }]
    let latestRecipes = [];
    let currentRecipeId = null;
    let currentVersion = null;

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
        const newRecipeId = recipes.reduce((max, recipe) => {
            return recipe.recipeId > max ? recipe.recipeId : max;
        }, 0) + 1;
        const newRecipe = await pb.addRecipe(newRecipeId, 1, "", "");
        await fetchRecipes();
        showRecipe(newRecipe.recipeId, newRecipe.version);
    });

    saveRecipeButton.addEventListener('click', async () => {
        const name = recipeNameInput.value;
        const instructions = recipeInstructionsInput.value;
        const isNewRecipe = currentVersion === getLatestVersion();
        if (currentRecipeId && name && instructions) {
            if (isNewRecipe) {
                const newVersion = currentVersion + 1;
                await pb.addRecipe(currentRecipeId, newVersion, name, instructions);
                currentVersion = newVersion;
            } else {
                const recipe = getCurrentRecipe();
                await pb.updateRecipe(recipe.id, name, instructions);
            }
            await fetchRecipes();
        }
    });

    deleteRecipeButton.addEventListener('click', async () => {
        const recipe = recipes.find(r => r.recipeId === currentRecipeId && r.version === currentVersion);
        const id = recipe.id;
        await pb.deleteRecipe(id);
        await fetchRecipes();
        currentVersion = currentVersion - 1;
        if (currentVersion < 1) {
            currentVersion = null;
            recipeDetailContainer.classList.add('hidden');
        } else {
            showRecipe(currentRecipeId, currentVersion);
        }
    });

    recipeList.addEventListener('click', async (e) => {
        if (e.target.tagName === 'LI') {
            const id = parseInt(e.target.dataset.id);
            showRecipe(id);
        }
    });

    previousVersionButton.addEventListener('click', async () => {
        if (currentVersion > 1) {
            currentVersion = currentVersion - 1;
            showRecipe(currentRecipeId, currentVersion);
        }
    });

    nextVersionButton.addEventListener('click', async () => {
        const latestVersion = getLatestVersion();
        if (currentVersion < latestVersion) {
            currentVersion = currentVersion + 1;
            showRecipe(currentRecipeId, currentVersion);
        }
    });

    async function fetchRecipes() {
        const recipeData = await pb.getRecipes();
        recipes = recipeData.items;
        latestRecipes = getLatestVersions(recipes);
        renderRecipeList();
    }

    function renderRecipeList() {
        recipeList.innerHTML = latestRecipes.map(recipe => `
      <li data-id="${recipe.recipeId}">
        ${recipe.name}
      </li>
    `).join('');
    }

    function showRecipe(recipeId, version) {
        let recipe;
        if (version)
            recipe = recipes.find(r => r.recipeId === recipeId && r.version === version);
        else
            recipe = latestRecipes.find(r => r.recipeId === recipeId);
        if (recipe) {
            currentRecipeId = recipe.recipeId;
            currentVersion = recipe.version;
            recipeNameInput.value = recipe.name;
            recipeInstructionsInput.value = recipe.instructions;
            recipeDetailContainer.classList.remove('hidden');
            title.innerText = "Recipe version " + currentVersion;
        } else {
            console.error('recipe undefined')
        }
        if (currentVersion === getLatestVersion()) {
            deleteRecipeButton.classList.remove('hidden');
        } else {
            deleteRecipeButton.classList.add('hidden');
        }
    }

    function getLatestVersions(recipes) {
        const latestVersions = {};

        recipes.forEach(recipe => {
            const { recipeId, version } = recipe;

            if (!latestVersions[recipeId] || latestVersions[recipeId].version < version) {
                latestVersions[recipeId] = recipe;
            }
        });

        return Object.values(latestVersions);
    }

    function getLatestVersion() {
        return getLatestVersions(recipes).find(r => r.recipeId === currentRecipeId).version
    }

    function getCurrentRecipe() {
        return recipes.find(r => r.recipeId === currentRecipeId && r.version === currentVersion);
    }
});