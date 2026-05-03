
// Jab DOM puri tarah load ho jaye
document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Listeners ---
    document.getElementById('btn-courses')?.addEventListener('click', () => {
        window.location.href = "pages/course.html";
    });

    document.getElementById('start-btn')?.addEventListener('click', async () => {
    // Button ko thodi der ke liye disable kar do taaki baar-baar click na ho
    const btn = document.getElementById('start-btn');
    btn.innerText = "Checking...";
    
    const isLoggedIn = await checkUserStatus();

    if (isLoggedIn) {
        // Agar login hai toh seedha Dashboard
        window.locationh.href = " pages/dashboard.html";
    } else {
        // Agar login nahi hai toh Login Modal kholo
        btn.innerText = "Get Started"; // Button text wapas sahi karo
        openModal('login');
    }
});



    document.getElementById('btn-about')?.addEventListener('click', () => {
        window.location.href = "pages/aboutus.html";
    });

    document.getElementById('btn-contact')?.addEventListener('click', () => {
        window.location.href = "pages/contact.html";
    });

    // --- Modal Control Listeners ---
    document.getElementById('btn-login-modal')?.addEventListener('click', () => {
        openModal('login');
    });

    document.getElementById('menuToggle')?.addEventListener('click', toggleMenu);

    // --- Form Toggle Listeners ---
    document.getElementById('switch-to-signup')?.addEventListener('click', toggleForm);
    document.getElementById('switch-to-login')?.addEventListener('click', toggleForm);

    // --- API Action Listeners ---
    document.getElementById('submit-login')?.addEventListener('click', login);
    document.getElementById('submit-signup')?.addEventListener('click', signup);

    // Modal close when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('modal');
        if (e.target === modal) closeModal();
    });

    // Auth UI update check karein
    updateAuthUI();


    const usernameField = document.getElementById('signup-username');
    if (usernameField) {
        usernameField.addEventListener('input', handleUsernameCheck);
    }
    
// Auto update year in footer
document.getElementById('year').textContent = new Date().getFullYear();
});

// Toggle mobile menu
function toggleMenu(){
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('show');
}

// Button click animation
const buttons = document.querySelectorAll('.btn');
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.style.transform = "scale(0.95)";
        setTimeout(() => btn.style.transform = "scale(1)", 150);
    });
});

// Modal logic
function openModal(type){
    document.getElementById('modal').style.display='flex';
    if(type==='login'){
        document.getElementById('login-form').style.display='block';
        document.getElementById('signup-form').style.display='none';
    }
}


function closeModal(){
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(e){
    const modal = document.getElementById('modal');
    if(e.target === modal){
        modal.style.display = "none";
    }
}

function toggleForm(){
    const login = document.getElementById('login-form');
    const signup = document.getElementById('signup-form');
    if(login.style.display==='block'){
        login.style.display='none';
        signup.style.display='block';
    } else {
        login.style.display='block';
        signup.style.display='none';
    }
}


import { apiRequest } from "./api.js";

// HANDLE LOGIN FUNCNALITY
async function login() {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;

    if (!u || !p) { alert("Username and password required"); return; }

    try {
        const data = await apiRequest('accounts/api/login/', "POST", {username:u,password:p});
        // console.log(data)

        if (data.msg === "Login Success") {
            // alert("Login Successful! Redirecting...");
            console.log("Login Successful! Redirecting...")
            closeModal();
            
            // User ko dashboard ya home page par bhejein
            window.location.href = "../index.html"; 
        } else {
            // alert(data.error || "Invalid Credentials");
            console.error(data.error || "Invalid Credentials")
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server error, please try again.");
    }
}

async function updateAuthUI() {
    try {
        const data = await apiRequest("accounts/api/check-auth/");
        console.log(data)

        const loginBtn = document.getElementById('btn-login-modal');
        const adminLink = document.getElementById('admin-dashboard-link');

        // Agar data milta hai aur koi error nahi hai
        if (data && data.is_logged_in) {
            if (loginBtn) {
                loginBtn.innerText = "Logout";
                loginBtn.onclick = logout; 
                console.log("Success: Logged in as", data.username);
            }

            // 2. Admin Specific UI
            if (data.is_admin) {
                console.log("Welcome, Admin!");
                if (adminLink) adminLink.style.display = "block";
                
                // Admin dashboard par redirect karne ka logic
                if (adminLink) {
                    adminLink.onclick = () => window.location.href = "../pages/dashboard.html";
                }
            } else {
                console.log("Welcome, Student!");
                // Student ke liye admin cheezein chhupayein
                if (adminLink) adminLink.style.display = "block";

                if (adminLink) {
                    adminLink.onclick = () => window.location.href = "../pages/dashboard.html";
                }
            }
        } else {
            // Agar data.error hai ya 401 aaya hai
            console.log("Status: User is not logged in (Guest)");
            if (loginBtn) {
                loginBtn.innerText = "Login";
                loginBtn.onclick = () => openModal('login');
            }
            if (adminLink) adminLink.style.display = "none";
        }
    } catch (err) {
        // Network error ke liye
        console.warn("User is not authenticated (Guest Mode)");
    }
}

async function logout() {
    try {
        const result = await apiRequest("accounts/api/logout/", "POST");
        if (result.msg || result.success) {
            console.log("Logout successful");
            // JavaScript se cookie delete karne ki koshish karne ki zarurat nahi hai (wo kaam nahi karega)
            window.location.reload(); // Seedha login page par bhejein ya reload karein
        }
    } catch (err) {
        console.error("Logout Error:", err);
        window.location.reload()
    }
}

window.logout = logout;

async function signup() {
    // HTML se values uthana
    const studentName = document.getElementById('signup-studentname').value;
    const username = document.getElementById('signup-username').value;
    const email = document.querySelector('input[name="email"]').value; // Name attribute se uthaya
    const password = document.getElementById('signup-password').value;
    const msgElement = document.getElementById('msg');

    // Basic Validation
    if (!studentName || !username || !email || !password) {
        msgElement.innerText = "Please fill all fields!";
        msgElement.style.color = "orange";
        return;
    }

    const signupData = {
        student_name: studentName,
        username: username,
        email: email,
        password: password
    };

    try {
        const result = await apiRequest("accounts/api/register/", "POST", signupData);


        if (result.msg === "User Created Successfully") {
            // alert("Registration Successful! Now you can login.");
            toggleForm(); // Login form par switch karein
        } else {
            const msgElement = document.getElementById('msg');
            msgElement.innerText = result.error || "Signup Failed";
            msgElement.style.color = "red";
        }
    } catch (error) {
        console.error("Signup Error:", error);
        msgElement.innerText = "Server error, please try again later.";
    }
}


// username exist or not function

// Debounce helper: Ye function baar-baar API call hone se rokta hai
let debounceTimer;

async function handleUsernameCheck() {
    const usernameInput = document.getElementById('signup-username');
    const msgElement = document.getElementById('msg');
    const username = usernameInput.value.trim();

    // Pehle purana timer clear karein
    clearTimeout(debounceTimer);

    // Agar username khali hai toh msg clear karein
    if (username.length === 0) {
        msgElement.innerText = "";
        return;
    }

    // Minimum 3 characters check
    if (username.length < 3) {
        msgElement.innerText = "Username too short";
        msgElement.style.color = "orange";
        return;
    }

    // Naya timer set karein (500ms wait karega typing rukne ka)
    debounceTimer = setTimeout(async () => {
        msgElement.innerText = "Checking availability...";
        msgElement.style.color = "blue";

        try {
            // Hamari apiRequest utility ka upyog
            const data = await apiRequest("accounts/api/check-username/", "POST", { username: username });

            if (data.available) {
                msgElement.innerText = "✅ " + data.msg;
                msgElement.style.color = "green";
            } else {
                msgElement.innerText = "❌ " + (data.error || "Username taken");
                msgElement.style.color = "red";
            }
        } catch (error) {
            console.error("Error:", error);
            msgElement.innerText = "Error checking username";
        }
    }, 1000); 
}

async function checkUserStatus() {
    try {
        // Humne jo apiRequest banayi thi uska use karenge
        const response = await apiRequest("accounts/api/check-auth/", "GET");
        
        if (response && response.username) {
            // Agar backend ne username bhej diya, matlab user authenticated hai
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}



document.getElementById('start-btn')?.addEventListener('click', async () => {
    // Button ko thodi der ke liye disable kar do taaki baar-baar click na ho
    const btn = document.getElementById('start-btn');
    btn.innerText = "Checking...";
    
    const isLoggedIn = await checkUserStatus();

    if (isLoggedIn) {
        // Agar login hai toh seedha Dashboard
        window.location.href = "../pages/dashboard.html";
    } else {
        // Agar login nahi hai toh Login Modal kholo
        btn.innerText = "Get Started"; // Button text wapas sahi karo
        openModal('login');
    }
});

window.toggleMenu = toggleMenu;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleForm = toggleForm;
window.login = login;
window.signup = signup;