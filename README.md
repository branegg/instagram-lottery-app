# Instagram Lottery App - Bagiety Poznan

A lottery application where users can enter by following [@bagiety_poznan](https://www.instagram.com/bagiety_poznan/) on Instagram.

## Features

- User registration with name, email, and Instagram username
- Instagram follow verification
- Admin panel to verify entries and pick random winners
- SQLite database for storing entries

## Tech Stack

**Frontend:**
- React
- Vite
- CSS

**Backend:**
- Node.js
- Express
- SQLite3

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/instagram-lottery-app.git
cd instagram-lottery-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory:
```
PORT=5001
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:3000 and the backend at http://localhost:5001.

## API Endpoints

- `POST /api/lottery/enter` - Submit a new lottery entry
- `GET /api/admin/entries` - Get all entries (admin)
- `GET /api/admin/entries/verified` - Get verified entries only (admin)
- `POST /api/admin/verify/:id` - Verify an entry (admin)
- `GET /api/admin/pick-winner` - Pick a random winner from verified entries (admin)

## Deployment

This app can be deployed to Vercel. The frontend and backend can be deployed as separate services.

## License

MIT
