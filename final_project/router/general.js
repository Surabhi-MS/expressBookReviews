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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Using Promise to simulate async operation for concurrent users
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(books);
    }, 10);
  }).then((allBooks) => {
    res.status(200).json(allBooks);
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        resolve(null);
      }
    }, 10);
  }).then((book) => {
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({message: "Book not found"});
    }
  });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const matchedBooks = {};
      for (let isbn in books) {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
          matchedBooks[isbn] = books[isbn];
        }
      }
      resolve(matchedBooks);
    }, 10);
  }).then((matchedBooks) => {
    if (Object.keys(matchedBooks).length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({message: "No books found by this author"});
    }
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const matchedBooks = {};
      for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
          matchedBooks[isbn] = books[isbn];
        }
      }
      resolve(matchedBooks);
    }, 10);
  }).then((matchedBooks) => {
    if (Object.keys(matchedBooks).length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({message: "No books found with this title"});
    }
  });
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

module.exports.general = public_users;
