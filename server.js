const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'mysecretkey';

app.use(bodyParser.json());
app.use(cookieParser());

// Allow requests from React frontend
app.use(cors({
  origin: true,
  credentials: true
}));

// Dummy login API
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("login api call", email, password );
    // Simple validation
    if(email === 'test@test.com' && password === '123456') {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,        // REQUIRED for HTTPS
            sameSite: 'none'     // REQUIRED for cross-site cookies
        });

        return res.json({ message: 'Login successful',token });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

// Protected home API
app.get('/home', (req, res) => {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return res.json({ message: `Welcome ${decoded.email}`, data: [1,2,3] });
    } catch(err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

// Another protected API
app.get('/profile', (req, res) => {
    console.log("profile api call");
    
    const token = req.cookies.token;
    if(!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return res.json({ profile: { email: decoded.email, name: 'Dummy User' } });
        // res.send(`<h1>Welcome User!</h1><p>Your token: ${token}</p>`);
    } catch(err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});
app.get('/profile/view', (req, res) => {
    console.log("profile api call");
    const token = req.cookies.token;
    if(!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return res.send(`<h1>Welcome User!</h1><p>Your token: ${token}</p> <p>Profile: ${decoded.email}</p>`);
    } catch(err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
