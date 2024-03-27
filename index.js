const express = require("express");
const fs = require("fs").promises; // Using promises version of fs
const bcrypt = require("bcrypt"); // for password encrypting
const app = express();
const port = 3006;
app.use(express.json());
app.use(express.static('public'))
app.set('view engine', 'ejs');
const path = require('path');
// Define Viewer counter variable
let counter = 0;

let successfulLogins = 0; // Counter for successful logins

// Endpoint to handle user registration
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Read existing users from users.json using async/await
        const data = await fs.readFile("users.json", "utf8");
        let users = JSON.parse(data);

        // Check if user already exists
        if (users.find(user => user.username === username)) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username: username, password: hashedPassword });

        // Write updated users array back to users.json
        await fs.writeFile("users.json", JSON.stringify(users, null, 2));

        return res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
userIsLoggedIn=false; // prevent user to access in portefolio website if not sign in
// Endpoint to handle user login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        // Read existing users from users.json using async/await
        const data = await fs.readFile("users.json", "utf8");
        let users = JSON.parse(data);
        // Find user
        const findUser = users.find((data) => username === data.username);
        if (!findUser) {
            res.status(400).json({ message: "Wrong username or password." });
            return;
        }
        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (passwordMatch) {
            userIsLoggedIn=true;
            counter+=1
            console.log("counter visit",counter)
            res.status(200).json({ message: "Logged in successfully!" });
        } else {
            res.status(400).json({ message: "Wrong username or password." });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware function to check if the user is authenticated
function isAuthenticated(req, res, next) {
    // Check if user is logged in 
    if (userIsLoggedIn) {
        next(); // If user is logged in, proceed to the next middleware or route handler
    } else {
        res.render('loginMessage', { message: "You should log in" }); // Render a page with the message
        res.redirect('/login'); // If user is not logged in, redirect to the login page
    }
}
// Get Method
app.get("/", (req, res) => {
    res.render('login');
});
app.get("/login", (req, res) => {
    res.render('login');
});
// Route handler for /index
app.get("/index", isAuthenticated, (req, res) => {
    // Send the counter value as JSON data
    res.json({ counter });
});

// Route handler to serve the HTML file
app.get("/index.html", isAuthenticated, (req, res) => {
    // Send the HTML file
    res.sendFile(path.join(__dirname, 'HTML/index.html'));
});
app.get("/register", (req, res) => {
    res.render('register');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    console.log("http://localhost:3006");
});
