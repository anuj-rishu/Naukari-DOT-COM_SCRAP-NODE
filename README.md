# Naukri Job Scraper API

A Node.js REST API that scrapes job listings from Naukri.com. Search jobs by location, view company job listings with pagination, and get detailed job information — all behind JWT authentication.

## Features

- Search freshers jobs by location with pagination
- View all jobs by a specific company (with pagination)
- JWT token-based authentication
- Clean JSON responses with job details, salary, experience, tags, and direct JD links
- CORS enabled
- Centralized error handling

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **HTTP Client:** Axios
- **Auth:** JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)

### Installation

```bash
git clone https://github.com/anuj-rishu/Naukari-DOT-COM_SCRAP-NODE.git
cd Naukari-DOT-COM_SCRAP-NODE
npm install
```

### Environment Variables

Copy the example env file and fill in the values:

```bash
cp example.env .env
```

| Variable     | Description              | Example              |
| ------------ | ------------------------ | -------------------- |
| `PORT`       | Server port              | `9004`               |
| `JWT_SECRET` | Secret key for JWT auth  | `your_jwt_secret_key`|

### Run

```bash
node server.js
```

The server will start at `http://localhost:<PORT>`.

## Authentication

All endpoints require a valid JWT token. Pass it in one of two ways:

- **Header:** `Authorization: Bearer <token>`
- **Query param:** `?token=<token>`

Generate a token using your `JWT_SECRET`:

```js
const jwt = require("jsonwebtoken");
const token = jwt.sign({ user: "yourUsername" }, "your_jwt_secret_key");
console.log(token);
```

## API Endpoints

### 1. Search Jobs

```
GET /api/jobs?location=chennai&page=1
```

| Query Param | Default    | Description           |
| ----------- | ---------- | --------------------- |
| `location`  | `chennai`  | City to search in     |
| `page`      | `1`        | Page number           |

**Response:**

```json
{
  "success": true,
  "totalJobsInLocation": 15432,
  "jobsOnThisPage": 20,
  "currentPage": 1,
  "results": [
    {
      "groupId": 12345,
      "logoPath": "https://...",
      "companyName": "TCS",
      "currency": "INR",
      "jdURL": "https://www.naukri.com/job-listings-...",
      "maximumExperience": 2,
      "minimumExperience": 0,
      "location": "Chennai",
      "salaryDetail": "1.5-3 Lacs PA",
      "vacancy": []
    }
  ]
}
```

### 2. Company Jobs (with Pagination)

```
GET /api/company/:groupId?page=1&limit=20
```

| Param / Query | Default | Description                     |
| ------------- | ------- | ------------------------------- |
| `groupId`     | —       | Company group ID (from search)  |
| `page`        | `1`     | Page number                     |
| `limit`       | `20`    | Results per page (max `50`)     |

**Response:**

```json
{
  "success": true,
  "groupId": 12345,
  "companyName": "TCS",
  "logoPath": "https://...",
  "staticUrl": "https://www.naukri.com/tcs-jobs",
  "totalJobs": 250,
  "jobsOnThisPage": 20,
  "currentPage": 1,
  "totalPages": 13,
  "resultsPerPage": 20,
  "hasNextPage": true,
  "hasPrevPage": false,
  "jobs": [
    {
      "jobId": "67890",
      "title": "Software Developer",
      "jdURL": "https://www.naukri.com/job-listings-...",
      "maximumExperience": 3,
      "minimumExperience": 0,
      "location": "Chennai",
      "salaryDetail": "3-5 Lacs PA",
      "currency": "INR",
      "vacancy": [],
      "postedDate": "09 Feb 2026",
      "tags": "Java, Spring Boot, REST API"
    }
  ]
}
```

## Project Structure

```
├── app.js                  # Express app setup
├── server.js               # Server entry point
├── example.env             # Environment variable template
├── package.json
├── config/
│   └── config.js           # App configuration & API headers
├── controllers/
│   └── jobController.js    # Route handlers
├── middleware/
│   ├── errorHandler.js     # Centralized error handler
│   └── verifyToken.js      # JWT authentication middleware
├── routes/
│   └── jobRoutes.js        # API route definitions
└── utils/
    └── helpers.js           # URL generation utilities
```

## License

GNU GENERAL PUBLIC LICENSE
