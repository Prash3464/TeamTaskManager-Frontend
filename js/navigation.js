// Ye file navigation control karegi

// 1. General Back: Kisi bhi normal page ke liye (e.g. Profile, Settings)
export function goBack() {
    if (document.referrer !== "") {
        window.history.back();
    } else {
        // Agar history na mile toh dashboard default hai
        window.location.href = "../pages/dashboard.html";
    }
}

// 2. Quiz Back: Jab user quiz ke beech mein ho
export function quitQuiz() {
    const confirmation = confirm("⚠️ Kya aap test chhodna chahte hain? Aapka score save nahi hoga!");
    
    if (confirmation) {
        // Agar user 'Yes' kahe toh wapas dashboard bhej do
        window.location.href = "../pages/dashboard.html";
    }
}

// Global access ke liye (taki HTML onclick se call ho sake)
window.goBack = goBack;
window.quitQuiz = quitQuiz;