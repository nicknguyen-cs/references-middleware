const express = require('express');
const app = express();
const port = 3000;

// Middleware function
const logMiddleware = (req, res, next) => {
    console.log('Middleware is called');
    next(); // Pass control to the next handler
};

// Define the endpoint with a route handler
app.get('/references', (req, res) => {
    console.log(req.query);
    res.send('This is the example endpoint');
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
