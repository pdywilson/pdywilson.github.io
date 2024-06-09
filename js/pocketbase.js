class PocketBase {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.token = this.getTokenFromStorage();
    }

    async request(endpoint, method = 'GET', data = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseURL}/${endpoint}`, {
            method,
            headers,
            body: data ? JSON.stringify(data) : null,
        });

        if (response.ok) {
            if (method === 'GET' || method === 'POST') {
                return response.json();
            } else {
                return {};
            }
        } else {
            throw new Error('Request failed');
        }
    }

    async authWithPassword(identity, password) {
        const data = await this.request('collections/users/auth-with-password', 'POST', { identity, password });
        this.token = data.token;
        this.saveTokenToStorage(this.token);
        return data;
    }

    async getOAuth2Url(provider) {
        const response = await this.request(`collections/users/auth/${provider}/url`, 'GET');
        return response.url;
    }

    async authWithOAuth2(provider, code, state) {
        const data = await this.request('collections/users/auth-with-oauth2', 'POST', { provider, code, state });
        this.token = data.token;
        this.saveTokenToStorage(this.token);
        return data;
    }

    saveTokenToStorage(token) {
        localStorage.setItem('pocketbase_token', token);
    }

    getTokenFromStorage() {
        return localStorage.getItem('pocketbase_token');
    }

    async getRecipes() {
        return this.request('collections/recipes/records');
    }

    async addRecipe(user,  recipeId, version, name, instructions) {
        return this.request('collections/recipes/records', 'POST', {
            user, recipeId, version, name, instructions
        });
    }

    async deleteRecipe(id) {
        return this.request(`collections/recipes/records/${id}`, 'DELETE');
    }

    async updateRecipe(id, name, instructions) {
        return this.request(`collections/recipes/records/${id}`, 'PATCH', {
            name, instructions
        });
    }

    async logout() {
        this.token = null;
        localStorage.removeItem('pocketbase_token');
    }
}

const pb = new PocketBase('https://dinner.pockethost.io/api'); // Replace with your PocketBase URL