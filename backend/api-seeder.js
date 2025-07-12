const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const TEST_DATA_DIR = path.join(__dirname, 'test-data');

// Test data storage
let testData = {
  users: {
    regular: null,
    admin: null,
    moderator: null
  },
  tokens: {
    regular: null,
    admin: null,
    moderator: null
  },
  questions: [],
  answers: [],
  tags: [],
  notifications: []
};

// Create test data directory if it doesn't exist
if (!fs.existsSync(TEST_DATA_DIR)) {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

// Helper function to log results
function logResult(testName, result) {
  const status = result.success ? '✅ PASS' : '❌ FAIL';
  const statusCode = result.status;
  console.log(`${status} ${testName} (${statusCode})`);
  
  if (!result.success) {
    console.log(`   Error: ${JSON.stringify(result.error)}`);
  }
  
  return result.success;
}

// Test data generators
const testDataGenerators = {
  user: (role = 'user') => ({
    username: `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    role: role
  }),

  question: (userId) => ({
    title: `Test Question ${Date.now()}`,
    content: `This is a test question content. ${Date.now()}`,
    tags: ['javascript', 'nodejs'],
    userId: userId
  }),

  answer: (questionId, userId) => ({
    content: `This is a test answer content. ${Date.now()}`,
    questionId: questionId,
    userId: userId
  }),

  tag: () => ({
    name: `test-tag-${Date.now()}`,
    description: `Test tag description ${Date.now()}`,
    color: '#ff6b6b'
  })
};

// ==================== AUTH ROUTES TESTS ====================

async function testAuthRoutes() {
  console.log('\n🔐 TESTING AUTH ROUTES');
  console.log('=' .repeat(50));

  // Test 1: Register regular user
  const regularUserData = testDataGenerators.user('user');
  let result = await makeRequest('POST', '/auth/register', regularUserData);
  logResult('Register Regular User', result);
  if (result.success) {
    testData.users.regular = result.data.data.user;
    testData.tokens.regular = result.data.data.token;
  }

  // Test 2: Register admin user
  const adminUserData = testDataGenerators.user('admin');
  result = await makeRequest('POST', '/auth/register', adminUserData);
  logResult('Register Admin User', result);
  if (result.success) {
    testData.users.admin = result.data.data.user;
    testData.tokens.admin = result.data.data.token;
  }

  // Test 3: Login with regular user
  result = await makeRequest('POST', '/auth/login', {
    identifier: regularUserData.username,
    password: regularUserData.password
  });
  logResult('Login Regular User', result);

  // Test 4: Get current user profile
  result = await makeRequest('GET', '/auth/me', null, testData.tokens.regular);
  logResult('Get Current User Profile', result);

  // Test 5: Update user profile
  result = await makeRequest('PUT', '/auth/profile', {
    bio: 'Updated bio for testing'
  }, testData.tokens.regular);
  logResult('Update User Profile', result);

  // Test 6: Check username availability
  result = await makeRequest('GET', `/auth/check-username/${regularUserData.username}`);
  logResult('Check Username Availability', result);

  // Test 7: Check email availability
  result = await makeRequest('GET', `/auth/check-email/${regularUserData.email}`);
  logResult('Check Email Availability', result);

  // Test 8: Update user preferences
  result = await makeRequest('PUT', '/auth/preferences', {
    emailNotifications: true,
    theme: 'dark'
  }, testData.tokens.regular);
  logResult('Update User Preferences', result);

  // Test 9: Refresh token
  result = await makeRequest('POST', '/auth/refresh', {}, testData.tokens.regular);
  logResult('Refresh Token', result);

  // Test 10: Logout
  result = await makeRequest('POST', '/auth/logout', {}, testData.tokens.regular);
  logResult('Logout', result);
}

// ==================== USERS ROUTES TESTS ====================

async function testUsersRoutes() {
  console.log('\n👥 TESTING USERS ROUTES');
  console.log('=' .repeat(50));

  // Test 1: Get all users
  let result = await makeRequest('GET', '/users');
  logResult('Get All Users', result);

  // Test 2: Get user by ID
  if (testData.users.regular) {
    result = await makeRequest('GET', `/users/${testData.users.regular.id}`);
    logResult('Get User By ID', result);
  }

  // Test 3: Get user questions
  if (testData.users.regular) {
    result = await makeRequest('GET', `/users/${testData.users.regular.id}/questions`);
    logResult('Get User Questions', result);
  }

  // Test 4: Get user answers
  if (testData.users.regular) {
    result = await makeRequest('GET', `/users/${testData.users.regular.id}/answers`);
    logResult('Get User Answers', result);
  }

  // Test 5: Get user activity
  if (testData.users.regular) {
    result = await makeRequest('GET', `/users/${testData.users.regular.id}/activity`);
    logResult('Get User Activity', result);
  }

  // Test 6: Update user role (admin only)
  if (testData.users.regular && testData.tokens.admin) {
    result = await makeRequest('PUT', `/users/${testData.users.regular.id}/role`, {
      role: 'moderator'
    }, testData.tokens.admin);
    logResult('Update User Role (Admin)', result);
  }

  // Test 7: Update user reputation (admin only)
  if (testData.users.regular && testData.tokens.admin) {
    result = await makeRequest('PUT', `/users/${testData.users.regular.id}/reputation`, {
      reputation: 100
    }, testData.tokens.admin);
    logResult('Update User Reputation (Admin)', result);
  }

  // Test 8: Delete user (admin only)
  if (testData.users.regular && testData.tokens.admin) {
    result = await makeRequest('DELETE', `/users/${testData.users.regular.id}`, null, testData.tokens.admin);
    logResult('Delete User (Admin)', result);
  }

  // Test 9: Get leaderboard
  result = await makeRequest('GET', '/users/leaderboard');
  logResult('Get Leaderboard', result);
}

// ==================== TAGS ROUTES TESTS ====================

async function testTagsRoutes() {
  console.log('\n🏷️ TESTING TAGS ROUTES');
  console.log('=' .repeat(50));

  // Test 1: Get all tags
  let result = await makeRequest('GET', '/tags');
  logResult('Get All Tags', result);

  // Test 2: Get popular tags
  result = await makeRequest('GET', '/tags/popular');
  logResult('Get Popular Tags', result);

  // Test 3: Get tag by name
  result = await makeRequest('GET', '/tags/javascript');
  logResult('Get Tag By Name', result);

  // Test 4: Create new tag (admin only)
  const newTag = testDataGenerators.tag();
  result = await makeRequest('POST', '/tags', newTag, testData.tokens.admin);
  logResult('Create New Tag (Admin)', result);
  if (result.success) {
    testData.tags.push(result.data.data.tag);
  }

  // Test 5: Update tag (admin only)
  if (testData.tags.length > 0) {
    result = await makeRequest('PUT', `/tags/${testData.tags[0].id}`, {
      description: 'Updated tag description'
    }, testData.tokens.admin);
    logResult('Update Tag (Admin)', result);
  }

  // Test 6: Delete tag (admin only)
  if (testData.tags.length > 0) {
    result = await makeRequest('DELETE', `/tags/${testData.tags[0].id}`, null, testData.tokens.admin);
    logResult('Delete Tag (Admin)', result);
  }

  // Test 7: Search tags
  result = await makeRequest('GET', '/tags/search/javascript');
  logResult('Search Tags', result);

  // Test 8: Get unused tags (admin only)
  result = await makeRequest('GET', '/tags/unused', null, testData.tokens.admin);
  logResult('Get Unused Tags (Admin)', result);

  // Test 9: Add tag synonym (admin only)
  if (testData.tags.length > 1) {
    result = await makeRequest('POST', `/tags/${testData.tags[1].id}/synonym`, {
      synonym: 'js-synonym'
    }, testData.tokens.admin);
    logResult('Add Tag Synonym (Admin)', result);
  }

  // Test 10: Add related tag (admin only)
  if (testData.tags.length > 1) {
    result = await makeRequest('POST', `/tags/${testData.tags[1].id}/related`, {
      relatedTagId: testData.tags[0].id
    }, testData.tokens.admin);
    logResult('Add Related Tag (Admin)', result);
  }
}

// ==================== QUESTIONS ROUTES TESTS ====================

async function testQuestionsRoutes() {
  console.log('\n❓ TESTING QUESTIONS ROUTES');
  console.log('=' .repeat(50));

  // Test 1: Get all questions
  let result = await makeRequest('GET', '/questions');
  logResult('Get All Questions', result);

  // Test 2: Get unanswered questions
  result = await makeRequest('GET', '/questions/unanswered');
  logResult('Get Unanswered Questions', result);

  // Test 3: Get featured questions
  result = await makeRequest('GET', '/questions/featured');
  logResult('Get Featured Questions', result);

  // Test 4: Create new question
  const newQuestion = testDataGenerators.question(testData.users.regular.id);
  result = await makeRequest('POST', '/questions', newQuestion, testData.tokens.regular);
  logResult('Create New Question', result);
  if (result.success) {
    testData.questions.push(result.data.data.question);
  }

  // Test 5: Get question by ID
  if (testData.questions.length > 0) {
    result = await makeRequest('GET', `/questions/${testData.questions[0].id}`);
    logResult('Get Question By ID', result);
  }

  // Test 6: Update question
  if (testData.questions.length > 0) {
    result = await makeRequest('PUT', `/questions/${testData.questions[0].id}`, {
      title: 'Updated question title',
      content: 'Updated question content'
    }, testData.tokens.regular);
    logResult('Update Question', result);
  }

  // Test 7: Delete question
  if (testData.questions.length > 0) {
    result = await makeRequest('DELETE', `/questions/${testData.questions[0].id}`, null, testData.tokens.regular);
    logResult('Delete Question', result);
  }

  // Test 8: Vote on question
  if (testData.questions.length > 1) {
    result = await makeRequest('POST', `/questions/${testData.questions[1].id}/vote`, {
      vote: 1
    }, testData.tokens.regular);
    logResult('Vote On Question', result);
  }

  // Test 9: Accept answer
  if (testData.questions.length > 1 && testData.answers.length > 0) {
    result = await makeRequest('POST', `/questions/${testData.questions[1].id}/accept-answer/${testData.answers[0].id}`, {}, testData.tokens.regular);
    logResult('Accept Answer', result);
  }

  // Test 10: Get questions by tag
  result = await makeRequest('GET', '/questions/tags/javascript');
  logResult('Get Questions By Tag', result);
}

// ==================== ANSWERS ROUTES TESTS ====================

async function testAnswersRoutes() {
  console.log('\n💬 TESTING ANSWERS ROUTES');
  console.log('=' .repeat(50));

  // Test 1: Get answers for question
  if (testData.questions.length > 0) {
    let result = await makeRequest('GET', `/answers/question/${testData.questions[0].id}`);
    logResult('Get Answers For Question', result);
  }

  // Test 2: Get answer by ID
  if (testData.answers.length > 0) {
    let result = await makeRequest('GET', `/answers/${testData.answers[0].id}`);
    logResult('Get Answer By ID', result);
  }

  // Test 3: Create new answer
  if (testData.questions.length > 0) {
    const newAnswer = testDataGenerators.answer(testData.questions[0].id, testData.users.regular.id);
    let result = await makeRequest('POST', '/answers', newAnswer, testData.tokens.regular);
    logResult('Create New Answer', result);
    if (result.success) {
      testData.answers.push(result.data.data.answer);
    }
  }

  // Test 4: Update answer
  if (testData.answers.length > 0) {
    let result = await makeRequest('PUT', `/answers/${testData.answers[0].id}`, {
      content: 'Updated answer content'
    }, testData.tokens.regular);
    logResult('Update Answer', result);
  }

  // Test 5: Delete answer
  if (testData.answers.length > 1) {
    let result = await makeRequest('DELETE', `/answers/${testData.answers[1].id}`, null, testData.tokens.regular);
    logResult('Delete Answer', result);
  }

  // Test 6: Vote on answer
  if (testData.answers.length > 0) {
    let result = await makeRequest('POST', `/answers/${testData.answers[0].id}/vote`, {
      vote: 1
    }, testData.tokens.regular);
    logResult('Vote On Answer', result);
  }

  // Test 7: Accept answer
  if (testData.answers.length > 0) {
    let result = await makeRequest('POST', `/answers/${testData.answers[0].id}/accept`, {}, testData.tokens.regular);
    logResult('Accept Answer', result);
  }

  // Test 8: Unaccept answer
  if (testData.answers.length > 0) {
    let result = await makeRequest('POST', `/answers/${testData.answers[0].id}/unaccept`, {}, testData.tokens.regular);
    logResult('Unaccept Answer', result);
  }

  // Test 9: Get user answers
  if (testData.users.regular) {
    let result = await makeRequest('GET', `/answers/user/${testData.users.regular.id}`);
    logResult('Get User Answers', result);
  }
}

// ==================== NOTIFICATIONS ROUTES TESTS ====================

async function testNotificationsRoutes() {
  console.log('\n🔔 TESTING NOTIFICATIONS ROUTES');
  console.log('=' .repeat(50));

  // Test 1: Get all notifications
  let result = await makeRequest('GET', '/notifications', null, testData.tokens.regular);
  logResult('Get All Notifications', result);

  // Test 2: Get unread notifications
  result = await makeRequest('GET', '/notifications/unread', null, testData.tokens.regular);
  logResult('Get Unread Notifications', result);

  // Test 3: Get notification count
  result = await makeRequest('GET', '/notifications/count', null, testData.tokens.regular);
  logResult('Get Notification Count', result);

  // Test 4: Mark notification as read
  if (testData.notifications.length > 0) {
    result = await makeRequest('PUT', `/notifications/${testData.notifications[0].id}/read`, {}, testData.tokens.regular);
    logResult('Mark Notification As Read', result);
  }

  // Test 5: Mark all notifications as read
  result = await makeRequest('PUT', '/notifications/read-all', {}, testData.tokens.regular);
  logResult('Mark All Notifications As Read', result);

  // Test 6: Delete notification
  if (testData.notifications.length > 0) {
    result = await makeRequest('DELETE', `/notifications/${testData.notifications[0].id}`, null, testData.tokens.regular);
    logResult('Delete Notification', result);
  }

  // Test 7: Delete all notifications
  result = await makeRequest('DELETE', '/notifications', null, testData.tokens.regular);
  logResult('Delete All Notifications', result);
}

// ==================== HEALTH CHECK ====================

async function testHealthCheck() {
  console.log('\n🏥 TESTING HEALTH CHECK');
  console.log('=' .repeat(50));

  const result = await makeRequest('GET', '/health');
  logResult('Health Check', result);
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE API TESTING');
  console.log('=' .repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('=' .repeat(60));

  let passedTests = 0;
  let totalTests = 0;

  try {
    // Run all test suites
    await testHealthCheck();
    await testAuthRoutes();
    await testUsersRoutes();
    await testTagsRoutes();
    await testQuestionsRoutes();
    await testAnswersRoutes();
    await testNotificationsRoutes();

    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

    // Save test results
    const testResults = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: ((passedTests / totalTests) * 100).toFixed(2),
      testData
    };

    fs.writeFileSync(
      path.join(TEST_DATA_DIR, `test-results-${Date.now()}.json`),
      JSON.stringify(testResults, null, 2)
    );

    console.log('\n✅ API testing completed!');
    console.log(`📁 Test results saved to: ${TEST_DATA_DIR}`);

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Export for use in other files
module.exports = {
  runAllTests,
  makeRequest,
  testDataGenerators,
  testData
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
} 