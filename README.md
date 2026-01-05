# Hostel Meal System - Food Waste Reduction Platform

A production-ready MERN stack application for reducing food wastage in hostels by allowing students to pre-select meals and enabling admins to analyze demand.

## Features

### Student Features

- Register and login with secure authentication
- View available menus during specific time windows
- Select food items with quantity preferences
- View selection history
- Locked selections after time window closes

### Admin Features

- Create menus within strict time windows (server-validated)
- Manage menu items (CRUD operations)
- Real-time analytics with visualizations
- Item-wise demand tracking
- Hostel-wise participation breakdown
- Participation rate metrics

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Security**: Helmet, CORS, Rate Limiting

## Time Window Rules (Enforced Server-Side)

- **Breakfast**: Post 8:00 PM - 9:30 PM (previous night)
- **Lunch**: Post 8:00 AM - 9:30 AM
- **Dinner**: Post 11:30 AM - 2:00 PM

## Installation

### Prerequisites

- Node.js >= 16
- MongoDB >= 5.0
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed  # Seed database with sample data
npm run dev   # Start development server
```

### Frontend Setup

```bash
cd frontend
npm install
npm start     # Start React development server
```

## Project Structure

backend/
├── models/           # MongoDB schemas
├── routes/           # API routes
├── middleware/       # Auth, validation, error handling
├── scripts/          # Database seeding
└── server.js         # Entry point

frontend/
├── src/
│   ├── components/   # React components
│   │   ├── auth/     # Login, Register
│   │   ├── student/  # Student dashboard
│   │   └── admin/    # Admin dashboard
│   ├── context/      # React Context (Auth)
│   ├── services/     # API service layer
│   ├── hooks/        # Custom hooks
│   └── utils/        # Helper functions
└── public/

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Menus

- `POST /api/menus` - Create menu (Admin, time-validated)
- `GET /api/menus/active` - Get active menus
- `GET /api/menus` - Get all menus (Admin)
- `PUT /api/menus/:id` - Update menu (Admin)
- `DELETE /api/menus/:id` - Delete menu (Admin)

### Menu Items

- `POST /api/menu-items` - Create item (Admin)
- `GET /api/menu-items` - Get all items
- `PUT /api/menu-items/:id` - Update item (Admin)
- `DELETE /api/menu-items/:id` - Delete item (Admin)

### Selections

- `POST /api/selections` - Create/update selection
- `GET /api/selections/my-selections` - Get user selections
- `GET /api/selections/menu/:menuId` - Get selection for menu

### Analytics

- `GET /api/analytics/menu/:menuId` - Menu analytics (Admin)
- `GET /api/analytics/overview` - Overview analytics (Admin)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests/15 min)
- Helmet security headers
- CORS protection
- Role-based access control
- Server-side time window validation
- Input validation and sanitization

## Scalability Considerations

- Indexed MongoDB queries for performance
- Efficient aggregation pipelines
- Connection pooling
- Stateless JWT authentication
- Ready for horizontal scaling
- Optimized for 2000+ concurrent users

## Default Credentials (After Seeding)

### Admin

- Email: <admin@hostel.com>
- Password: admin123

### Students

- Email: <student1@hostel.com> to <student5@hostel.com>
- Password: student123

## Production Deployment

1. Set strong JWT_SECRET in production
2. Use MongoDB Atlas or managed MongoDB
3. Enable HTTPS
4. Set appropriate CORS origins
5. Use environment-specific configs
6. Enable MongoDB replica sets for transactions
7. Set up monitoring and logging
8. Configure reverse proxy (Nginx)

## License

MIT

## Support

For issues and questions, please open a GitHub issue .
