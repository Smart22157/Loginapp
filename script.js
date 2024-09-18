const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());

// Connect to MongoDB
MongoClient.connect('mongodb://mongo:27017', (err, client) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Connected to MongoDB');

  // Create a collection for login credentials
  const db = client.db();
  const collection = db.collection('logins');

  // Handle login form submission
  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username and password fields are present
    if (!username || !password) {
      res.status(400).send('Username and password are required');
      return;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Check if a user with the same username already exists
    collection.findOne({ username }, (err, user) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error checking for existing user');
      } else if (user) {
        res.status(400).send('Username already exists');
      } else {
        // Insert the new user into the database
        collection.insertOne({ username, password: hashedPassword }, (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send('Error saving login credentials');
          } else {
            res.send('Login credentials saved successfully');
          }
        });
      }
    });
  });

  // Start the server
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
});