import { apiRequest } from "./api.js";

// URL se Project ID nikalne ke liye (e.g. projects.html?id=1)
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

async function init() {
    if (!projectId) {
        alert("Project ID missing");
        window.location.href = "dashboard.html";
        return;
    }

    try {
        // 1. Project Details Fetch Karein
        const project = await apiRequest(`accounts/api/projects/${projectId}/`);
        const userData = await apiRequest("accounts/api/check-auth/");
        // console.log(project,userData)
        document.getElementById('project-title').innerText = project.title;
        
        // 2. Members List Update
        const memberList = document.getElementById('project-members-list');
        memberList.innerHTML = project.members.map(m => `<span class="member-badge">${m.first_name}</span>`).join('');

        // 3. Admin Logic Check
        const isAdmin = project.created_by === userData.user_id;
        if (isAdmin) {
            document.getElementById('admin-controls').style.display = "block";
            document.getElementById('role-badge').innerText = "Admin";
            document.getElementById('role-badge').classList.add('admin-badge');
            
            // Assignee Dropdown fill karein
            const assigneeSelect = document.getElementById('task-assignee');
            assigneeSelect.innerHTML = project.members.map(m => `<option value="${m.id}">${m.username}</option>`).join('');
        } else {
            document.getElementById('role-badge').innerText = "Member";
            document.getElementById('role-badge').classList.add('student-badge');
        }

        // 4. Tasks Load Karein
        loadTasks(isAdmin);

    } catch (err) {
        console.error("Init Error:", err);
    }
}

async function loadTasks(isAdmin) {
    const tasks = await apiRequest(`accounts/api/projects/${projectId}/tasks/`);
    const container = document.getElementById('task-list-container');
    
    if (tasks.length === 0) {
        container.innerHTML = "<p>No tasks found.</p>";
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="stat-card">
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p><small>Due: ${task.due_date} | Priority: <strong>${task.priority}</strong></small></p>
            <p>Assigned to: ${task.assigned_to_name}</p>
            <!-- Delete Button -->
            <button onclick="handleDeleteTask(${task.id})" class="btn-delete">🗑️</button><br>
            <label>Status:</label>
            <select onchange="updateStatus(${task.id}, this.value)">
                <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
            </select>
        </div>
    `).join('');
}

// Task Delete karne ke liye
async function handleDeleteTask(taskId) {
    if (confirm("Kya aap waqayi is task ko delete karna chahte hain?")) {
        const result = await apiRequest(`accounts/api/tasks/${taskId}/delete/`, "DELETE");
        if (result) {
            alert("Task Deleted!");
            location.reload(); // UI refresh karne ke liye
        }
    }
}
window.handleDeleteTask = handleDeleteTask;

// Status Update Logic
window.updateStatus = async (taskId, newStatus) => {
    try {
        await apiRequest(`accounts/api/tasks/${taskId}/update-status/`, "PATCH", { status: newStatus });
        alert("Status Updated!");
    } catch (err) {
        alert("Permission Denied: You can only update your own tasks.");
    }
};

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

// Add Member Logic (Admin Only)
document.getElementById('add-member-btn').onclick = async () => {
    const email = document.getElementById('member-email').value;
    await apiRequest(`accounts/api/projects/${projectId}/add-member/`, "POST", { email: email });
    alert("Member Added!");
    location.reload();
};


// Task Modal Controls
document.getElementById('open-task-modal').onclick = () => {
    document.getElementById('task-modal').style.display = 'flex';
};

document.getElementById('save-task-btn').onclick = async () => {
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        due_date: document.getElementById('task-due').value,
        priority: document.getElementById('task-priority').value,
        assigned_to: document.getElementById('task-assignee').value,
        project: projectId
    };
    await apiRequest(`accounts/api/tasks/create/`, "POST", taskData);
    alert("Task Created!");
    location.reload();
};

document.addEventListener('DOMContentLoaded', init);