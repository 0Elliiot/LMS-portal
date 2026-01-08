const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const DATA_FILE = './users.json';

// Function: users.json se data load karne ke liye
const loadUsers = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return {};
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Function: users.json mein data save karne ke liye
const saveUsers = (users) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

// Home Route: lms.html file ko browser mein load karne ke liye
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'lms.html'));
});

// 1. Register Route: Naye user ko create karne ke liye
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    let users = loadUsers();
    if (users[username]) {
        res.json({ success: false, message: 'User already exists!' });
    } else {
        // Naya user structure: Profile ki empty fields ke saath
        users[username] = { 
            password: password, 
            progress: [],
            profile: {
                name: '',
                dob: '',
                mob: '',
                email: '',
                adhar: '',
                add: '',
                about: ''
            }
        };
        saveUsers(users);
        res.json({ success: true, message: 'Registered successfully!' });
    }
});

// 2. Login Route: Authentication ke liye
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    let users = loadUsers();
    if (users[username] && users[username].password === password) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid username or password' });
    }
});

// 3. Save Profile Route: User ki saari details save karne ke liye
app.post('/save-profile', (req, res) => {
    const { username, profileData } = req.body;
    let users = loadUsers();
    if (users[username]) {
        // Frontend se aane wale profileData ko seedha user ke profile object mein save karte hain
        users[username].profile = profileData;
        saveUsers(users);
        res.json({ success: true, message: 'Profile updated successfully!' });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

// 4. Get User Data: Login ke baad dashboard par profile aur progress dikhane ke liye
app.get('/get-user-data', (req, res) => {
    const { username } = req.query;
    let users = loadUsers();
    if (users[username]) {
        res.json({ 
            progress: users[username].progress || [], 
            profile: users[username].profile || {} 
        });
    } else {
        res.json({ progress: [], profile: {} });
    }
});

// 5. Update Progress Route: Jab user koi lesson complete kare
app.post('/update-progress', (req, res) => {
    const { username, lesson } = req.body;
    let users = loadUsers();
    if (users[username]) {
        if (!users[username].progress.includes(lesson)) {
            users[username].progress.push(lesson);
            saveUsers(users);
        }
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
