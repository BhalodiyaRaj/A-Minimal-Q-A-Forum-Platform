const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import models
const User = require('./models/User');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const Tag = require('./models/Tag');
const Notification = require('./models/Notification');

// Test data
const testUsers = [
  {
    username: 'admin_user',
    email: 'admin@stackit.com',
    password: 'AdminPass123!',
    role: 'admin',
    bio: 'I am the admin of StackIt platform',
    reputation: 1000,
    badges: ['admin', 'moderator', 'expert'],
    isVerified: true
  },
  {
    username: 'moderator_user',
    email: 'moderator@stackit.com',
    password: 'ModPass123!',
    role: 'user',
    bio: 'I help moderate the community',
    reputation: 500,
    badges: ['moderator', 'expert'],
    isVerified: true
  },
  {
    username: 'expert_user',
    email: 'expert@stackit.com',
    password: 'ExpertPass123!',
    role: 'user',
    bio: 'I am an expert in JavaScript and Node.js',
    reputation: 750,
    badges: ['expert', 'regular'],
    isVerified: true
  },
  {
    username: 'regular_user',
    email: 'user@stackit.com',
    password: 'UserPass123!',
    role: 'user',
    bio: 'I am a regular user learning new things',
    reputation: 150,
    badges: ['newbie'],
    isVerified: false
  },
  {
    username: 'developer_user',
    email: 'developer@stackit.com',
    password: 'DevPass123!',
    role: 'user',
    bio: 'Full-stack developer passionate about web technologies',
    reputation: 300,
    badges: ['regular'],
    isVerified: true
  }
];

const testTags = [
  {
    name: 'javascript',
    description: 'JavaScript programming language',
    color: '#f7df1e',
    usageCount: 25
  },
  {
    name: 'nodejs',
    description: 'Node.js runtime environment',
    color: '#339933',
    usageCount: 18
  },
  {
    name: 'react',
    description: 'React JavaScript library',
    color: '#61dafb',
    usageCount: 15
  },
  {
    name: 'mongodb',
    description: 'MongoDB database',
    color: '#47a248',
    usageCount: 12
  },
  {
    name: 'express',
    description: 'Express.js web framework',
    color: '#000000',
    usageCount: 10
  },
  {
    name: 'python',
    description: 'Python programming language',
    color: '#3776ab',
    usageCount: 8
  },
  {
    name: 'docker',
    description: 'Docker containerization',
    color: '#2496ed',
    usageCount: 6
  },
  {
    name: 'aws',
    description: 'Amazon Web Services',
    color: '#ff9900',
    usageCount: 5
  }
];

const testQuestions = [
  {
    title: 'How to implement authentication in Node.js with JWT?',
    content: `I'm building a REST API with Node.js and Express, and I need to implement user authentication using JWT tokens. 

Here's what I want to achieve:
- User registration and login
- JWT token generation and validation
- Protected routes
- Token refresh mechanism

Can someone provide a complete example with best practices?`,
    tags: ['javascript', 'nodejs', 'express'],
    voteCount: 15,
    views: 120,
    featured: true
  },
  {
    title: 'What are the best practices for MongoDB schema design?',
    content: `I'm designing a database schema for a social media application using MongoDB. I need advice on:

1. When to embed vs reference documents
2. How to handle user relationships
3. Optimizing for read vs write operations
4. Indexing strategies

Any experienced MongoDB developers here?`,
    tags: ['mongodb', 'database'],
    voteCount: 8,
    views: 85,
    featured: false
  },
  {
    title: 'React hooks vs class components - which to use in 2024?',
    content: `I'm starting a new React project and wondering whether to use hooks or class components. 

I know hooks are the future, but:
- Are there any cases where class components are still better?
- What about performance differences?
- Migration strategies from class to hooks?

Looking for current best practices and real-world experiences.`,
    tags: ['react', 'javascript'],
    voteCount: 12,
    views: 95,
    featured: true
  },
  {
    title: 'Docker vs Kubernetes for small projects',
    content: `I'm working on a small web application and considering containerization. 

Questions:
- Is Docker alone sufficient for small projects?
- When should I consider Kubernetes?
- What about Docker Compose for local development?
- Cost and complexity considerations

Any advice for beginners?`,
    tags: ['docker', 'kubernetes'],
    voteCount: 5,
    views: 45,
    featured: false
  },
  {
    title: 'AWS Lambda cold start optimization strategies',
    content: `I'm experiencing slow cold starts with my AWS Lambda functions. 

Current setup:
- Node.js runtime
- 128MB memory
- VPC configuration

What strategies can I use to reduce cold start times? I've heard about:
- Provisioned concurrency
- Memory optimization
- Dependency minimization

Any practical tips?`,
    tags: ['aws', 'serverless'],
    voteCount: 7,
    views: 60,
    featured: false
  }
];

const testAnswers = [
  {
    content: `Here's a comprehensive guide for JWT authentication in Node.js:

## 1. Install Dependencies
\`\`\`bash
npm install jsonwebtoken bcryptjs
\`\`\`

## 2. User Model
\`\`\`javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
\`\`\`

## 3. Authentication Middleware
\`\`\`javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
\`\`\`

## 4. Login Route
\`\`\`javascript
app.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !await bcrypt.compare(req.body.password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});
\`\`\`

This approach follows security best practices and is production-ready.`,
    voteCount: 12,
    isAccepted: true
  },
  {
    content: `For MongoDB schema design, here are the key principles:

## Embedding vs Referencing

**Embed when:**
- Data is small and doesn't change often
- You frequently access the data together
- The embedded data belongs to the parent

**Reference when:**
- Data is large or changes frequently
- You need to query the data independently
- Multiple documents reference the same data

## Example Schema
\`\`\`javascript
// User with embedded profile
const userSchema = {
  username: String,
  email: String,
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String
  },
  // Reference to posts
  posts: [{ type: ObjectId, ref: 'Post' }]
};
\`\`\`

## Indexing Strategy
- Index fields you frequently query
- Use compound indexes for complex queries
- Consider text indexes for search functionality

This approach balances flexibility with performance.`,
    voteCount: 8,
    isAccepted: false
  },
  {
    content: `In 2024, **hooks are definitely the way to go** for new React projects. Here's why:

## Advantages of Hooks
- **Cleaner code**: Less boilerplate than class components
- **Better performance**: Easier to optimize with useMemo/useCallback
- **Future-proof**: React team focuses on hooks
- **Better testing**: Simpler to test functional components

## When to Use Class Components
- Legacy code that's working fine
- Third-party libraries that require class components
- Error boundaries (though hooks alternatives exist)

## Migration Strategy
1. Start new components with hooks
2. Gradually convert existing components
3. Use codemods for automated conversion

## Performance
Hooks can be more performant due to:
- Smaller bundle size
- Better tree-shaking
- More efficient re-renders

**Recommendation**: Go with hooks for new projects!`,
    voteCount: 15,
    isAccepted: true
  }
];

const testNotifications = [
  {
    type: 'question_answer',
    title: 'New answer to your question',
    message: 'Someone answered your question about JWT authentication',
    isRead: false
  },
  {
    type: 'answer_vote',
    title: 'Your answer received an upvote',
    message: 'Your answer about MongoDB schema design got an upvote!',
    isRead: false
  },
  {
    type: 'answer_accepted',
    title: 'Your answer was accepted',
    message: 'Your answer was marked as the accepted answer!',
    isRead: true
  },
  {
    type: 'mention',
    title: 'You were mentioned in a question',
    message: 'Someone mentioned you in a question about React hooks',
    isRead: false
  }
];

// Helper function to create users
async function createUsers() {
  console.log('👥 Creating test users...');
  
  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`   User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`   ✅ Created user: ${userData.username}`);
    } catch (error) {
      console.log(`   ❌ Error creating user ${userData.username}:`, error.message);
    }
  }
}

// Helper function to create tags
async function createTags() {
  console.log('🏷️ Creating test tags...');
  
  for (const tagData of testTags) {
    try {
      // Check if tag already exists
      const existingTag = await Tag.findOne({ name: tagData.name });
      if (existingTag) {
        console.log(`   Tag ${tagData.name} already exists, skipping...`);
        continue;
      }

      const tag = new Tag(tagData);
      await tag.save();
      console.log(`   ✅ Created tag: ${tagData.name}`);
    } catch (error) {
      console.log(`   ❌ Error creating tag ${tagData.name}:`, error.message);
    }
  }
}

// Helper function to create questions
async function createQuestions() {
  console.log('❓ Creating test questions...');
  
  // Get users for questions
  const users = await User.find().limit(3);
  const tags = await Tag.find();
  
  for (let i = 0; i < testQuestions.length; i++) {
    try {
      const questionData = testQuestions[i];
      const user = users[i % users.length];
      
      // Get tag IDs
      const tagIds = [];
      for (const tagName of questionData.tags) {
        const tag = tags.find(t => t.name === tagName);
        if (tag) tagIds.push(tag._id);
      }

      const question = new Question({
        ...questionData,
        author: user._id,
        tags: questionData.tags // Use tag names directly
      });
      
      await question.save();
      console.log(`   ✅ Created question: ${questionData.title.substring(0, 50)}...`);
    } catch (error) {
      console.log(`   ❌ Error creating question ${i + 1}:`, error.message);
    }
  }
}

// Helper function to create answers
async function createAnswers() {
  console.log('💬 Creating test answers...');
  
  const questions = await Question.find();
  const users = await User.find();
  
  for (let i = 0; i < testAnswers.length; i++) {
    try {
      const answerData = testAnswers[i];
      const question = questions[i % questions.length];
      const user = users[i % users.length];

      const answer = new Answer({
        ...answerData,
        question: question._id,
        author: user._id
      });
      
      await answer.save();
      console.log(`   ✅ Created answer ${i + 1}`);
    } catch (error) {
      console.log(`   ❌ Error creating answer ${i + 1}:`, error.message);
    }
  }
}

// Helper function to create notifications
async function createNotifications() {
  console.log('🔔 Creating test notifications...');
  
  const users = await User.find().limit(2);
  
  for (let i = 0; i < testNotifications.length; i++) {
    try {
      const notificationData = testNotifications[i];
      const recipient = users[i % users.length];
      const sender = users[(i + 1) % users.length];

      const notification = new Notification({
        ...notificationData,
        recipient: recipient._id,
        sender: sender._id
      });
      
      await notification.save();
      console.log(`   ✅ Created notification: ${notificationData.title}`);
    } catch (error) {
      console.log(`   ❌ Error creating notification ${i + 1}:`, error.message);
    }
  }
}

// Main seeder function
async function seedDatabase() {
  console.log('🌱 STARTING DATABASE SEEDING');
  console.log('=' .repeat(50));
  console.log(`Database: ${process.env.MONGODB_URI}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('=' .repeat(50));

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - uncomment if you want to start fresh)
    // console.log('🗑️ Clearing existing data...');
    // await User.deleteMany({});
    // await Tag.deleteMany({});
    // await Question.deleteMany({});
    // await Answer.deleteMany({});
    // await Notification.deleteMany({});

    // Create test data
    await createUsers();
    await createTags();
    await createQuestions();
    await createAnswers();
    await createNotifications();

    // Display summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('=' .repeat(50));
    
    const userCount = await User.countDocuments();
    const tagCount = await Tag.countDocuments();
    const questionCount = await Question.countDocuments();
    const answerCount = await Answer.countDocuments();
    const notificationCount = await Notification.countDocuments();

    console.log(`👥 Users: ${userCount}`);
    console.log(`🏷️ Tags: ${tagCount}`);
    console.log(`❓ Questions: ${questionCount}`);
    console.log(`💬 Answers: ${answerCount}`);
    console.log(`🔔 Notifications: ${notificationCount}`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('📁 You can now view all the test data in your database');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Export for use in other files
module.exports = {
  seedDatabase,
  createUsers,
  createTags,
  createQuestions,
  createAnswers,
  createNotifications
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
} 