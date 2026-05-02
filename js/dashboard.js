import { apiRequest } from "./api.js";

async function init() {
    try {
        // 1. Auth Check
        const authData = await apiRequest("accounts/api/check-auth/");
        if (!authData || !authData.is_logged_in) {
            window.location.href = "../home.HTML";
            return;
        }

        // 2. Profile & Dashboard Data
        const profileData = await apiRequest("accounts/api/profile_view/");
        // console.log(profileData)
        updateUI(profileData);
        loadProjects();
        await loadDashboardStats();

    } catch (e) {
        console.error("Init Error:", e);
    }
}

// UI Update (Name & Badge)
function updateUI(data) {
    document.getElementById('welcome-name').innerText = `Hi, ${data.first_name || data.username}`;
    const badge = document.getElementById('user-role-badge');
    badge.innerText = data.is_admin ? "Admin" : "User";
    badge.className = data.is_admin ? "badge admin-badge" : "badge student-badge";
}

// Projects Load Karein
async function loadProjects() {
    const projectList = document.getElementById('project-list');
    try {
        const projects = await apiRequest("accounts/api/projects/"); // Backend API
        // console.log(projects)
        
        // Stats update karein
        document.getElementById('stat-total-projects').innerText = projects.length;
        
        if (projects.length === 0) {
            projectList.innerHTML = "<p>No projects found. Create one to get started!</p>";
            return;
        }

        projectList.innerHTML = projects.map(proj => `
            <div class="project-card" onclick="window.location.href='projects.html?id=${proj.id}'">
                <h4>${proj.title}</h4>
                <p>${proj.description || 'No description'}</p>
            <!-- Sirf Admin ko Delete button dikhega -->
                ${proj.is_admin ? `<button onclick="handleDeleteProject(${proj.id})" class="btn-delete-proj">Delete Project</button>` : ''}
                <br>
                <small>Role: <strong>${proj.is_admin ? 'Admin' : 'Member'}</strong></small>
            </div>
            
        `).join('');

    } catch (err) {
        projectList.innerHTML = "<p>Error loading projects.</p>";
    }
}

// Create Project Logic
document.getElementById('create-project-btn').addEventListener('click', async () => {
    const title = document.getElementById('new-project-name').value;
    const desc = document.getElementById('new-project-desc');
    const description = desc ? desc.value : '';
    // console.log(title,desc)
    if (!title) { alert("Project name is required"); return; }

    // console.log(title,desc)

    const result = await apiRequest("accounts/api/projects/create/", "POST", { title: title, description:description });
    if (result) {
        alert("Project Created Successfully!");
        location.reload();
    }
});

// Logout Logic
document.getElementById('logout-btn').addEventListener('click', async () => {
    await apiRequest("accounts/api/logout/", "POST");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "../home.HTML";
});

// open manu
document.querySelector('.menu-toggle').addEventListener('click', () => {
    const sidebar = document.querySelector(".sidebar-nav")
    if (sidebar.style.display === "none") {
        sidebar.style.display = "block";
    } else {
        sidebar.style.display = "none";
    }
} )

async function loadDashboardStats() {
    const stats = await apiRequest("accounts/api/dashboard-stats/");
    // console.log("Dashboard Stats:", stats);
    
    if (stats) {
        // 1. Pending Tasks (Todo + In Progress)
        const pendingCount = stats.status_counts.todo + stats.status_counts.in_progress;
        document.getElementById('stat-pending-tasks').innerText = pendingCount;

        // 2. Done Tasks Card
        document.getElementById('stat-done-tasks').innerText = stats.status_counts.done;

        // 3. Overdue Tasks
        document.getElementById('stat-overdue-tasks').innerText = stats.overdue_tasks;

        // 4. Tasks Per User List
        const userTaskList = document.getElementById('user-tasks-list');
        
        if (stats.tasks_per_user && stats.tasks_per_user.length > 0) {
            userTaskList.innerHTML = stats.tasks_per_user.map(u => `
                <li class="user-stat-item" style="list-style: none; padding: 10px; border-bottom: 1px solid #eee;">
                    <span><strong>${u.assigned_to__username || 'Unassigned'}</strong></span>: 
                    <span class="badge">${u.count} tasks</span>
                </li>
            `).join('');
        } else {
            userTaskList.innerHTML = "<li>No tasks assigned yet.</li>";
        }
    }
}

async function handleDeleteProject(projectId) {
    if (confirm("Pura project delete ho jayega. Kya aap sure hain?")) {
        const result = await apiRequest(`accounts/api/projects/${projectId}/delete/`, "DELETE");
        if (result) {
            alert("Project Deleted!");
            location.reload();
        }
    }
}
window.handleDeleteProject = handleDeleteProject

document.addEventListener('DOMContentLoaded', init);