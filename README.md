# Alms Lite

Alms Lite is a full-stack donation platform that enables nonprofit organizations to launch fundraising campaigns and receive secure online donations through Stripe.

This project was built as a capstone for the Springboard Software Engineering program.


# Key Technical Concepts

- JWT authentication with protected routes
- Stripe Payment Intents API for secure payments
- RESTful API design
- Server-side file uploads using Multer
- MongoDB schema modeling with Mongoose
- Client/server separation using Next.js and Express

  
---

# Live Demo

Frontend  
https://almslite-frontend.onrender.com

Backend API  
https://almslite-backend.onrender.com

Example public campaigns page  
https://almslite-frontend.onrender.com/campaigns

---

# Features

### Donor Features
- Browse public fundraising campaigns
- View campaign details and progress
- Donate securely using Stripe
- Real-time funding progress display

### Nonprofit Features
- Secure authentication with JWT
- Create fundraising campaigns
- Edit campaign details and images
- Upload campaign images or use public image URLs
- Dashboard to manage campaigns

### Platform Features
- Stripe payment integration
- MongoDB database for persistent campaign data
- Image upload support
- REST API backend
- Responsive UI
- Protected routes for nonprofit dashboard

---

# Tech Stack

Frontend
- Next.js
- React
- CSS Modules
- Stripe.js

Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Multer (image uploads)
- JWT authentication

Payments
- Stripe Payment Intents API

Deployment
- Render (frontend + backend)
- MongoDB Atlas (database)

---

# Architecture

Browser (Donor / Nonprofit)
        │
        ▼
Next.js Frontend (React)
        │
        ▼
Express API (Node.js)
        │
        ▼
MongoDB Atlas (Database)

Stripe Payment Flow
Browser -➤ Backend -➤ Stripe -➤ Webhook -➤ Database


---

# Project Structure

almsgiving
│
├── frontend-next
│ ├── app
│ ├── components
│ ├── lib
│ └── styles
│
├── backend
│ ├── config
│ ├── middleware
│ ├── models
│ ├── routes
│ ├── utils
│ └── server.js
│
└── README.md

---

# Database Schema

### Campaign

Campaign

._id

.nonprofitId

.title

.description

.goalAmount

.amountRaised

.imageUrl

.status

.createdAt

.updatedAt

### Nonprofit

Nonprofit

._id

.organizationName

.email

.passwordHash

.description

.createdAt

### Donation

Donation

._id

.campaignId

.donorName

.amount

.stripePaymentIntentId

.createdAt

---

# API Routes

## Authentication

POST /auth/register
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password

## Campaigns

GET /campaigns
GET /campaigns/:id

POST /campaigns
PATCH /campaigns/:id
DELETE /campaigns/:id

GET /campaigns/mine/list

## Donations

POST /donations/create-intent
POST /donations/confirm

## Webhooks
POST /webhooks/stripe


---

# Environment Variables

Backend `.env`

MONGODB_URI=your_mongodb_connection
PORT=5050

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=<your_stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>

CLIENT_URL=http://localhost:3000
FRONTEND_URL=https://almslite-frontend.onrender.com

RESEND_API_KEY=your_resend_key
FROM_EMAIL=<sender_email>

Frontend `.env`

NEXT_PUBLIC_API_URL=http://localhost:5050


---

# Running the Project Locally

### 1. Clone the repository

git clone https://github.com/MianSeri/almsgiving.git

### 2. Install backend dependencies

cd backend
npm install

### 3. Install frontend dependencies


cd ../frontend-next
npm install


### 4. Start backend


cd backend
npm run dev


### 5. Start frontend


cd frontend-next
npm run dev


Frontend runs on


http://localhost:3000


Backend runs on


http://localhost:5050


---

# Deployment Notes

The application is deployed using Render free tier hosting.

Because free-tier servers spin down after inactivity, the backend may take a few seconds to wake up when the application is first accessed.

Campaign images support two methods:

1. File upload (stored on the server)
2. Public image URLs

Public image URLs are recommended for deployed demo campaigns because local file uploads on free hosting may not persist across redeploys.

---

# Future Improvements

Potential future improvements include:

- Persistent image storage (Cloudinary or AWS S3)
- Email receipts for donations
- Password reset email integration
- Donation history dashboard
- Recurring donations
- Admin moderation tools
- Campaign categories and search
- Multi-language support

---

# Screenshots

Add screenshots here before submission.

Examples:

Dashboard  
Campaign page  
Donation flow  
Campaign creation page

---

# Testing

Manual testing was performed for:

- Campaign creation
- Campaign editing
- Donation flow
- Stripe payment confirmation
- Authentication
- Dashboard access control

---

## Deployment note

Campaigns support both uploaded images and public image URLs.

For deployed demo content, public image URLs are recommended because local file uploads on Render free hosting are not persistent across redeploys.


# Author

Mian Seri

Software Engineer  
Springboard Software Engineering Program

GitHub  
https://github.com/MianSeri

---

# License

This project was built for educational purposes as part of the Springboard Software Engineering program.
