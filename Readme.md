## 1. Final Project Structure

```
project/
│
├── backend/ (Django)
│   ├── users/
│   ├── courses/
│   ├── settings.py
│   ├── urls.py
│
├── frontend/
│   ├── index.html (login/signup)
│   ├── pages/
│   │   ├── home.html
│   │   ├── about.html
│   │   ├── courses.html
│   │   ├── dashboard.html ⭐
│   │   ├── contact.html
│   │
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │
│   ├── css/
│       ├── style.css
```

## 2. Authentication System (JWT + Cookies)

### Flow:
```
Signup/Login
   ↓
Django verifies user
   ↓
JWT tokens generate
   ↓
Refresh token → HttpOnly cookie
Access token → frontend use
   ↓
Protected pages (dashboard)
```
## 3. Backend APIs (Django)

### 📌 Auth APIs
```
API	Purpose
/api/register/	Signup
/api/login/	Login + token
/api/token/refresh/	Refresh access token
/api/logout/	Logout
```
### 📌 Protected APIs
```
API	Purpose
/api/profile/	User data
/api/courses/	Course list
/api/dashboard/	Dashboard data ⭐
```
## 6. API Helper (api.js)
```
export async function apiCall(url, options = {}) {
  let token = localStorage.getItem("access");

  let res = await fetch(`http://localhost:8000${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }
  });

  if (res.status === 401) {
    // refresh token call
    const refresh = await fetch("http://localhost:8000/api/token/refresh/", {
      method: "POST",
      credentials: "include"
    });

    const data = await refresh.json();
    localStorage.setItem("access", data.access);

    return fetch(`http://localhost:8000${url}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.access}`
      }
    });
  }

  return res.json();
}
```

## 🔐 8. Security Flow
```
✔ HttpOnly cookie → refresh token
✔ Access token → API calls
✔ Protected routes → Django verify
✔ Auto refresh → frontend handle
```
## 🚀 9. Final Features List
```
✔ Signup/Login system
✔ JWT authentication
✔ Auto token refresh
✔ Protected dashboard
✔ Courses system
✔ Logout system
✔ Multi-page frontend
```

## 🧠 10. Simple Understanding
```
👉 Login → token milega
👉 Dashboard → sirf login user dekh sakta hai
👉 Token expire → auto refresh
👉 Logout → access destroy
```