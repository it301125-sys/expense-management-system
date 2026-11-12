# Expenso – Expense Management System

A full-stack web application that helps users manage their personal expenses, organize spending, set monthly budgets, and understand their financial habits.

## Features

- **User Authentication:** Register, login, and securely manage accounts.
- **Expense Management:** Add, view, edit, and delete expenses.
- **Dashboard:** View expense summaries and spending insights.
- **Analytics:** Visualize expenses using charts.
- **Categories:** Organize expenses with default and custom categories.
- **Monthly Budget:** Set and monitor a monthly spending budget.
- **Transactions:** Search, filter, sort, and manage transactions.
- **CSV Export:** Export expense records.
- **Profile Management:** Update profile details and change passwords.
- **Account Security:** Protected routes and user-specific data access.

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- HTML
- CSS
- Axios
- Recharts

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```text
expense-management-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/it301125-sys/expense-management-system.git
cd expense-management-system
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Replace the placeholder values with your own configuration. Never commit your `.env` file.

Start the backend:

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 3. Frontend setup

Open another terminal from the project root:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## Security

- Passwords are hashed using bcrypt.
- JWT authentication protects private routes.
- User data is isolated between accounts.
- Environment variables are excluded from Git.

## Future Improvements

- Deploy the application online.
- Add automated testing.
- Improve financial reporting and insights.

## Author

Developed as a Full Stack Development Capstone Project.
