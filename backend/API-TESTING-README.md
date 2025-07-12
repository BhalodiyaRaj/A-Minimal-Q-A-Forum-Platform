# API Testing Seeder

This file contains a comprehensive API testing seeder that tests all routes in the StackIt backend application.

## Features

- ✅ Tests all API endpoints across all routes
- ✅ Handles authentication and authorization
- ✅ Generates test data automatically
- ✅ Provides detailed test results
- ✅ Saves test results to JSON files
- ✅ Supports different user roles (regular, admin, moderator)

## Routes Tested

### 🔐 Auth Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /avatar` - Upload avatar
- `DELETE /avatar` - Delete avatar
- `PUT /preferences` - Update user preferences
- `POST /refresh` - Refresh token
- `POST /logout` - User logout
- `GET /check-username/:username` - Check username availability
- `GET /check-email/:email` - Check email availability

### 👥 Users Routes (`/api/users`)
- `GET /` - Get all users
- `GET /:id` - Get user by ID
- `GET /:id/questions` - Get user questions
- `GET /:id/answers` - Get user answers
- `GET /:id/activity` - Get user activity
- `PUT /:id/role` - Update user role (admin only)
- `PUT /:id/reputation` - Update user reputation (admin only)
- `DELETE /:id` - Delete user (admin only)
- `GET /leaderboard` - Get leaderboard

### 🏷️ Tags Routes (`/api/tags`)
- `GET /` - Get all tags
- `GET /popular` - Get popular tags
- `GET /:name` - Get tag by name
- `POST /` - Create new tag (admin only)
- `PUT /:id` - Update tag (admin only)
- `DELETE /:id` - Delete tag (admin only)
- `GET /search/:query` - Search tags
- `GET /unused` - Get unused tags (admin only)
- `POST /:id/synonym` - Add tag synonym (admin only)
- `POST /:id/related` - Add related tag (admin only)

### ❓ Questions Routes (`/api/questions`)
- `GET /` - Get all questions
- `GET /unanswered` - Get unanswered questions
- `GET /featured` - Get featured questions
- `GET /:id` - Get question by ID
- `POST /` - Create new question
- `PUT /:id` - Update question
- `DELETE /:id` - Delete question
- `POST /:id/vote` - Vote on question
- `POST /:id/accept-answer/:answerId` - Accept answer
- `GET /tags/:tag` - Get questions by tag

### 💬 Answers Routes (`/api/answers`)
- `GET /question/:questionId` - Get answers for question
- `GET /:id` - Get answer by ID
- `POST /` - Create new answer
- `PUT /:id` - Update answer
- `DELETE /:id` - Delete answer
- `POST /:id/vote` - Vote on answer
- `POST /:id/accept` - Accept answer
- `POST /:id/unaccept` - Unaccept answer
- `GET /user/:userId` - Get user answers

### 🔔 Notifications Routes (`/api/notifications`)
- `GET /` - Get all notifications
- `GET /unread` - Get unread notifications
- `GET /count` - Get notification count
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read
- `DELETE /:id` - Delete notification
- `DELETE /` - Delete all notifications

### 🏥 Health Check
- `GET /health` - Health check endpoint

## Usage

### Prerequisites

1. Make sure the backend server is running:
   ```bash
   npm run dev
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

### Running the Tests

1. **Run all API tests:**
   ```bash
   npm run test-api
   ```

2. **Run with custom base URL:**
   ```bash
   BASE_URL=http://localhost:5000/api node api-seeder.js
   ```

3. **Run specific test sections:**
   ```javascript
   const { testAuthRoutes, testUsersRoutes } = require('./api-seeder');
   
   // Run only auth tests
   testAuthRoutes();
   ```

## Configuration

### Environment Variables

- `BASE_URL` - Base URL for API testing (default: `http://localhost:5000/api`)

### Test Data

The seeder automatically generates test data including:
- Test users (regular, admin, moderator)
- Test questions and answers
- Test tags
- Authentication tokens

## Output

### Console Output
The seeder provides real-time feedback with:
- ✅ PASS - Successful tests
- ❌ FAIL - Failed tests with error details
- Test summary with statistics

### Test Results File
Results are saved to `test-data/test-results-[timestamp].json` containing:
- Test timestamp
- Base URL used
- Total tests run
- Pass/fail statistics
- Test data used

## Example Output

```
🚀 STARTING COMPREHENSIVE API TESTING
============================================================
Base URL: http://localhost:5000/api
Timestamp: 2024-01-15T10:30:00.000Z
============================================================

🏥 TESTING HEALTH CHECK
==================================================
✅ PASS Health Check (200)

🔐 TESTING AUTH ROUTES
==================================================
✅ PASS Register Regular User (201)
✅ PASS Register Admin User (201)
✅ PASS Login Regular User (200)
✅ PASS Get Current User Profile (200)
...

📊 TEST SUMMARY
============================================================
Total Tests: 67
Passed: 65
Failed: 2
Success Rate: 97.01%
```

## Troubleshooting

### Common Issues

1. **Server not running:**
   - Make sure the backend server is started with `npm run dev`

2. **Database connection issues:**
   - Check MongoDB connection in `config.env`
   - Ensure MongoDB is running

3. **Authentication errors:**
   - Check JWT secret in environment variables
   - Verify user registration/login flow

4. **Rate limiting:**
   - The seeder respects rate limits
   - Add delays between requests if needed

### Debug Mode

To enable detailed logging, modify the `makeRequest` function in `api-seeder.js`:

```javascript
console.log(`${method} ${endpoint}`, data || '');
```

## Customization

### Adding New Tests

1. Create a new test function:
   ```javascript
   async function testNewRoute() {
     console.log('\n🆕 TESTING NEW ROUTE');
     console.log('=' .repeat(50));
     
     const result = await makeRequest('GET', '/new-route');
     logResult('New Route Test', result);
   }
   ```

2. Add to the main runner:
   ```javascript
   await testNewRoute();
   ```

### Modifying Test Data

Update the `testDataGenerators` object to customize test data:

```javascript
const testDataGenerators = {
  customUser: () => ({
    username: 'customuser',
    email: 'custom@example.com',
    password: 'CustomPass123!'
  })
};
```

## Contributing

When adding new routes to the application:

1. Add corresponding tests to the seeder
2. Update this README with new route documentation
3. Test the seeder with the new routes
4. Update test data generators if needed

## License

This testing seeder is part of the StackIt project and follows the same license. 