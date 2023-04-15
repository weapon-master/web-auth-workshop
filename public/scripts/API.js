const API = {
    endpoint: "/auth/",
    // ADD HERE ALL THE OTHER API FUNCTIONS
    login: async (user) => API.makePostRequest(`${API.endpoint}login`, user),
    register: async (user) => API.makePostRequest(`${API.endpoint}register`, user),
    loginFromGoogle: async (data) => API.makePostRequest(`${API.endpoint}google-login`, data),
    makePostRequest: async (url, data) => {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

}

export default API;
