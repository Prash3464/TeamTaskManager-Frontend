// const BASE_URL = "http://127.0.0.1:8000"; // Aapka Django Server Address
// const BASE_URL = "http://192.168.137.1:8000"; //public network ip
// const BASE_URL = "http://10.94.156.38:8000";// mobile network ip
const BASE_URL = "https://teamtaskmanager-backend.onrender.com";//backend server deploy url

/**
 * Common function for all API calls
 * @param {string} endpoint - API path (e.g., 'api/login/')
 * @param {string} method - GET, POST, etc.
 * @param {object} body - Data to send (optional)
 */
async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method: method,
        headers: {},
        // CRITICAL: Ye line Cookie-based JWT ke liye zaruri hai
        credentials: "include", 
    };

    if (body) {
        // AGAR BODY FORMDATA HAI (Jaise Image upload)
        if (body instanceof FormData) {
            // Content-Type set NA KAREIN! Browser khud boundary set karega
            options.body = body;
        } 
        // AGAR BODY NORMAL OBJECT HAI (JSON)
        else {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, options);
        
        // Agar response 401 (Unauthorized) hai toh logout logic handle karein
        if (response.status === 401) {
            console.warn("Session expired or unauthorized");
        }

        if (response.status === 204){
            return {success: true}
        }

        // 2. Sirf tabhi json() chalao jab body mein kuch ho
        const text = await response.text(); 
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
}

        return data
    } catch (error) {
        console.error("API Error:", error);
        return { error: "Server connection failed" };
    }
}

// Export functions for use in home.js
export { apiRequest };