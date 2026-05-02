import { apiRequest } from "./api.js";

export async function protectPage(adminOnly = false) {
    try {
        const data = await apiRequest("accounts/api/check-auth/");

        // 1. Check if logged in
        if (!data || !data.is_logged_in) {
            window.location.href = "../pages/dashboard.html";
            return null;
        }

        // 2. Check Admin privilege if required
        // console.log("Full User Data from Backend:", data);
        if (adminOnly && !data.is_admin) {
            alert("Admin access required!");
            window.location.href = "dashboard.html"; // Student ko dashboard bhej do
            return null;
        }

        return data; // User ka data return karo taaki page use kar sake
    } catch (err) {
        window.location.href = "../index.html";
    }
}