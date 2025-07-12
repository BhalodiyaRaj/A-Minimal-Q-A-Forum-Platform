# StackIt Backend

A robust Node.js backend for StackIt - a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing.

## Features

### Core Features
- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Questions & Answers**: Full CRUD operations with rich text support
- **Voting System**: Upvote/downvote questions and answers
- **Tag Management**: Create, manage, and search tags
- **Real-time Notifications**: Socket.IO integration for instant notifications
- **User Profiles**: Complete user management with reputation system
- **Search & Filtering**: Advanced search with multiple filters
- **Pagination**: Efficient pagination for all list endpoints

### Rich Text Editor Support
- Bold, Italic, Strikethrough formatting
- Numbered lists and bullet points
- Emoji insertion
- Hyperlink insertion
- Image upload support
- Text alignment (Left, Center, Right)

### Notification System
- Real-time notifications via Socket.IO
- Email notifications (configurable)
- Push notifications
- Notification preferences
- Unread notification count
- Mark as read functionality

### User Roles
- **Guest**: View all questions and answers
- **User**: Register, login, post questions/answers, vote
- **Admin**: Moderate content, manage users, manage tags

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer, Cloudinary
- **Password Hashing**: bcryptjs

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd A-Minimal-Q-A-Forum-Platform/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the environment template
   cp config.env.example config.env
   
   # Edit the configuration file
   nano config.env
   ```

4. **Configure Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/stackit
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Questions
- `GET /api/questions` - Get all questions with pagination
- `GET /api/questions/:id` - Get specific question
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question
- `GET /api/questions/unanswered` - Get unanswered questions
- `GET /api/questions/featured` - Get featured questions
- `GET /api/questions/tags/:tag` - Get questions by tag

### Answers
- `GET /api/answers/question/:questionId` - Get answers for a question
- `GET /api/answers/:id` - Get specific answer
- `POST /api/answers` - Create new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer
- `GET /api/answers/user/:userId` - Get user's answers

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `GET /api/users/:id/questions` - Get user's questions
- `GET /api/users/:id/answers` - Get user's answers
- `GET /api/users/:id/activity` - Get user's activity
- `GET /api/users/leaderboard` - Get user leaderboard
- `PUT /api/users/:id/role` - Update user role (admin)
- `PUT /api/users/:id/reputation` - Update user reputation (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread notifications
- `GET /api/notifications/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/popular` - Get popular tags
- `GET /api/tags/:name` - Get specific tag
- `POST /api/tags` - Create new tag (admin)
- `PUT /api/tags/:id` - Update tag (admin)
- `DELETE /api/tags/:id` - Delete tag (admin)
- `GET /api/tags/search/:query` - Search tags

## Database Models

### User
- Username, email, password
- Avatar, bio, role, reputation
- Badges, preferences, last seen
- Virtual fields for question/answer counts

### Question
- Title, content, author, tags
- Views, votes, vote count
- Status, accepted answer
- Edit history, last activity

### Answer
- Content, question, author
- Votes, vote count, is accepted
- Edit history, last edited

### Comment
- Content, author
- Question or answer reference
- Votes, edit history

### Notification
- Recipient, sender, type
- Title, message, metadata
- Read status, email sent status

### Tag
- Name, description, usage count
- Synonyms, related tags
- Wiki content, moderation status

## Real-time Features

### Socket.IO Events
- `connection` - User connects
- `join` - User joins their room
- `disconnect` - User disconnects
- `notification` - Real-time notifications

### Notification Types
- `question_answer` - New answer to question
- `answer_comment` - Comment on answer
- `question_comment` - Comment on question
- `answer_accepted` - Answer accepted
- `answer_vote` - Vote on answer
- `question_vote` - Vote on question
- `mention` - User mentioned
- `reputation_change` - Reputation changed

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Prevent abuse with rate limiting
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Role-based Access**: Admin, user, guest roles
- **Ownership Validation**: Users can only modify their own content

## Error Handling

- **Centralized Error Handler**: Consistent error responses
- **Validation Errors**: Detailed validation error messages
- **MongoDB Errors**: Proper handling of database errors
- **JWT Errors**: Token validation and expiration handling
- **File Upload Errors**: Multer error handling

## Development

### Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### File Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── config.env       # Environment variables
├── package.json     # Dependencies
├── server.js        # Main server file
└── README.md        # This file
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "stackit-backend"

# Monitor
pm2 monit

# Logs
pm2 logs stackit-backend
```

## API Documentation

The API follows RESTful conventions and returns consistent JSON responses:

### Success Response Format
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

### Pagination Format
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue in the repository. 