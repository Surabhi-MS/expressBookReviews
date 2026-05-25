# Book Review Application - Testing Guide

## Server Setup
Start the server with:
```bash
npm install
npm start
```

The server runs on `http://localhost:5000`

---

## API Testing with cURL

### 1. PUBLIC ROUTES (No Authentication Required)

#### Register a New User
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john_doe\",\"password\":\"password123\"}"
```

Expected Response (201):
```json
{"message":"User successfully registered"}
```

#### Register Another User
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"jane_smith\",\"password\":\"secure_pass\"}"
```

#### Get All Books
```bash
curl http://localhost:5000/
```

Expected Response (200) - List of all 10 books with their details and reviews.

#### Get Book by ISBN
```bash
curl http://localhost:5000/isbn/1
```

Expected Response (200):
```json
{
  "author": "Chinua Achebe",
  "title": "Things Fall Apart",
  "reviews": {}
}
```

#### Search Books by Author
```bash
curl http://localhost:5000/author/Jane%20Austen
```

Expected Response (200):
```json
{
  "8": {
    "author": "Jane Austen",
    "title": "Pride and Prejudice",
    "reviews": {}
  }
}
```

#### Search Books by Title
```bash
curl http://localhost:5000/title/Pride%20and%20Prejudice
```

#### Get Book Reviews
```bash
curl http://localhost:5000/review/1
```

Expected Response (200) - Empty object initially: `{}`

---

### 2. AUTHENTICATION ROUTES (Login)

#### User Login
```bash
curl -X POST http://localhost:5000/customer/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john_doe\",\"password\":\"password123\"}" \
  -c cookies.txt
```

Expected Response (200):
```json
{
  "message": "User successfully logged in",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** The `-c cookies.txt` saves the session cookie for subsequent authenticated requests.

---

### 3. AUTHENTICATED ROUTES (Login Required)

#### Add/Modify a Book Review (Must be logged in)
```bash
curl -X PUT http://localhost:5000/customer/auth/review/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"review\":\"This book is absolutely amazing! A classic that everyone should read.\"}"
```

Expected Response (200):
```json
{"message":"Review for ISBN 1 has been added/updated"}
```

#### Add Review to Another Book
```bash
curl -X PUT http://localhost:5000/customer/auth/review/8 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"review\":\"Pride and Prejudice is a timeless masterpiece of romance and wit.\"}"
```

#### Modify Your Own Review
```bash
curl -X PUT http://localhost:5000/customer/auth/review/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"review\":\"Updated review: Even better on re-reading!\"}"
```

#### Delete a Book Review (Must be logged in)
```bash
curl -X DELETE http://localhost:5000/customer/auth/review/1 \
  -b cookies.txt
```

Expected Response (200):
```json
{"message":"Review for ISBN 1 deleted by user john_doe"}
```

#### View Updated Reviews
```bash
curl http://localhost:5000/review/1
```

Expected Response (200) - Should now show the review(s).

---

### 4. MULTI-USER TESTING (Concurrent Access)

#### Login as Different User
```bash
curl -X POST http://localhost:5000/customer/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"jane_smith\",\"password\":\"secure_pass\"}" \
  -c cookies2.txt
```

#### User 2 Adds Review to Same Book
```bash
curl -X PUT http://localhost:5000/customer/auth/review/1 \
  -H "Content-Type: application/json" \
  -b cookies2.txt \
  -d "{\"review\":\"Jane's perspective: A powerful narrative on colonialism.\"}"
```

#### View All Reviews for the Book
```bash
curl http://localhost:5000/review/1
```

Expected Response (200) - Shows reviews from both users:
```json
{
  "john_doe": "Updated review: Even better on re-reading!",
  "jane_smith": "Jane's perspective: A powerful narrative on colonialism."
}
```

---

### 5. ERROR HANDLING TESTS

#### Try to Add Review Without Login
```bash
curl -X PUT http://localhost:5000/customer/auth/review/1 \
  -H "Content-Type: application/json" \
  -d "{\"review\":\"Should fail\"}"
```

Expected Response (403):
```json
{"message":"User not logged in"}
```

#### Try Invalid Login
```bash
curl -X POST http://localhost:5000/customer/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"invalid_user\",\"password\":\"wrong_pass\"}"
```

Expected Response (208):
```json
{"message":"Invalid Login. Check username and password"}
```

#### Try to Register Duplicate Username
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john_doe\",\"password\":\"newpass\"}"
```

Expected Response (409):
```json
{"message":"User already exists"}
```

#### Search for Non-existent Book
```bash
curl http://localhost:5000/isbn/999
```

Expected Response (404):
```json
{"message":"Book not found"}
```

---

## Features Implemented

✅ **Public Routes:**
- Register new users
- List all books
- Search by ISBN, author, title
- View book reviews

✅ **Authentication:**
- Session-based login
- JWT token generation
- Auth middleware for protected routes

✅ **User Operations:**
- Add reviews (authenticated users)
- Modify reviews (own reviews only)
- Delete reviews (own reviews only)

✅ **Concurrency:**
- Promises for async operations
- Multiple users can access simultaneously
- Each user's reviews are stored separately

✅ **Error Handling:**
- Validation for required fields
- Duplicate username prevention
- Unauthorized access prevention
- Resource not found handling

---

## Using Postman Instead of cURL

1. **Create New Request** → Select POST/GET/PUT/DELETE
2. **Enter URL** → `http://localhost:5000/[endpoint]`
3. **Body Tab** → Select "raw" and "JSON"
4. **Headers** → Add `Content-Type: application/json`
5. **Cookies** → Manage cookies in "Manage Cookies" (Postman will auto-save from login response)
6. **Send** → Click Send to test

---

## Performance Notes

- Promises with 10ms delays simulate async operations for concurrent users
- Multiple users can make simultaneous requests without blocking each other
- Session management allows user identification for review ownership
- JWT tokens expire after 60 minutes (3600 seconds)
