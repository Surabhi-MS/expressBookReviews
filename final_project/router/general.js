const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// User registration
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (isValid(username)) {
    return res.status(409).json({message: "User already exists"});
  }

  users.push({username, password});
  return res.status(201).json({message: "User successfully registered"});
});

const axios = require('axios');

// Internal endpoint to provide raw book data
public_users.get('/booksdb', function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/customer/booksdb');
    return res.status(200).json(response.data);
  } catch (error) {
    // Fallback if the local server isn't running the full URL
    return res.status(200).json(books);
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get('http://localhost:5000/customer/booksdb');
    const bookList = response.data;
    if (bookList[isbn]) {
      return res.status(200).json(bookList[isbn]);
    } else {
      return res.status(404).json({message: "Book not found"});
    }
  } catch (error) {
    // Fallback
    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    }
    return res.status(404).json({message: "Book not found"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get('http://localhost:5000/customer/booksdb');
    const bookList = response.data;
    const matchedBooks = {};
    for (let isbn in bookList) {
      if (bookList[isbn].author.toLowerCase() === author.toLowerCase()) {
        matchedBooks[isbn] = bookList[isbn];
      }
    }
    if (Object.keys(matchedBooks).length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({message: "No books found by this author"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error fetching book details"});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get('http://localhost:5000/customer/booksdb');
    const bookList = response.data;
    const matchedBooks = {};
    for (let isbn in bookList) {
      if (bookList[isbn].title.toLowerCase() === title.toLowerCase()) {
        matchedBooks[isbn] = bookList[isbn];
      }
    }
    if (Object.keys(matchedBooks).length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({message: "No books found with this title"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error fetching book details"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn].reviews);
      } else {
        resolve(null);
      }
    }, 10);
  }).then((reviews) => {
    if (reviews !== null) {
      return res.status(200).json(reviews);
    } else {
      return res.status(404).json({message: "Book not found"});
    }
  });
});

// Add or modify a book review (authenticated users)
public_users.put('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  
  // Check if user is authenticated via session
  if (!req.session.authorization) {
    return res.status(403).json({message: "User not logged in"});
  }
  
  const username = req.session.authorization.username;
  
  if (!review) {
    return res.status(400).json({message: "Review text is required"});
  }
  
  // Add or update the review for this user
  books[isbn].reviews[username] = review;
  return res.status(200).json({message: "Review successfully added/updated"});
});

// Delete a book review (authenticated users)
public_users.delete('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  
  // Check if user is authenticated via session
  if (!req.session.authorization) {
    return res.status(403).json({message: "User not logged in"});
  }
  
  const username = req.session.authorization.username;
  
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Review successfully deleted"});
  }
  return res.status(404).json({message: "Review not found"});
});

module.exports.general = public_users;
