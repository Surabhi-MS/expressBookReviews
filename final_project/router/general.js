const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User registration
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Internal data endpoint (used by async tasks below)
public_users.get("/books", function (req, res) {
  return res.status(200).json(books);
});

// Task 10 — Get all books (async/await)
public_users.get("/", async function (req, res) {
  try {
    const allBooks = await Promise.resolve(books);
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11 — Get book by ISBN (Promises)
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
  .then((book) => res.status(200).json(book))
  .catch((err) => res.status(404).json({ message: err }));
});

// Task 12 — Get books by author (Promises)
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  new Promise((resolve, reject) => {
    const matchedBooks = {};
    for (let isbn in books) {
      if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
        matchedBooks[isbn] = books[isbn];
      }
    }
    if (Object.keys(matchedBooks).length > 0) {
      resolve(matchedBooks);
    } else {
      reject("No books found by this author");
    }
  })
  .then((matched) => res.status(200).json(matched))
  .catch((err) => res.status(404).json({ message: err }));
});

// Task 13 — Get books by title (Promises)
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    const matchedBooks = {};
    for (let isbn in books) {
      if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
        matchedBooks[isbn] = books[isbn];
      }
    }
    if (Object.keys(matchedBooks).length > 0) {
      resolve(matchedBooks);
    } else {
      reject("No books found with this title");
    }
  })
  .then((matched) => res.status(200).json(matched))
  .catch((err) => res.status(404).json({ message: err }));
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;