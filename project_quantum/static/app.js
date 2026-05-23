let authToken = null;

async function apiFetch(endpoint, options = {}) {
    // STAGE 6 BUG: Broken Fetch Interceptor
    // The interceptor forgets to attach the Authorization header
    // It also tries to return response.text() instead of response.json()
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Missing Authorization header injection here!
    
    const response = await fetch(endpoint, { ...options, headers });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Bug: returns text instead of parsing json
    return await response.text();
}

async function login() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        
        authToken = data.token;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // Render Stage 6 key if available in the login response
        if(data.key_stage_6) {
            console.log("Stage 6 Key:", data.key_stage_6);
        }
    } catch(e) {
        document.getElementById('login-error').innerText = e.message;
    }
}

async function loadProtectedData() {
    try {
        const data = await apiFetch('/api/protected');
        // Will fail because apiFetch returns text and doesn't send token
        document.getElementById('protected-data').innerText = JSON.stringify(data);
    } catch(e) {
        document.getElementById('protected-data').innerText = 'Error loading secure data';
    }
}

async function loadUsers() {
    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        const list = document.getElementById('users-list');
        list.innerHTML = '';
        
        // STAGE 7 BUG: Javascript Closure / Variable Scope Bug
        // Using var inside a setTimeout loop causes it to bind to the final value
        for (var i = 0; i < data.users.length; i++) {
            setTimeout(function() {
                const li = document.createElement('li');
                // 'i' will be out of bounds, data.users[i] is undefined
                li.innerText = data.users[i].username + " (" + data.users[i].role + ")";
                list.appendChild(li);
            }, 100);
        }
        
        // Calculate key 7
        const key7 = data.users.reduce((acc, u) => acc + u.id, 0);
        console.log("Calculated Key 7:", key7);
        
    } catch(e) {
        console.error(e);
    }
}
