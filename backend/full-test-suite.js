const { seedDatabase } = require('./db-seeder');
const { runAllTests } = require('./api-seeder');

async function runFullTestSuite() {
  console.log('🚀 STACKIT COMPREHENSIVE TEST SUITE');
  console.log('=' .repeat(60));
  console.log('This will:');
  console.log('1. 🌱 Seed database with test data');
  console.log('2. 🔍 Test all API endpoints');
  console.log('3. 📊 Show you all data in database');
  console.log('=' .repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('=' .repeat(60));

  try {
    // Step 1: Seed the database
    console.log('\n🌱 STEP 1: SEEDING DATABASE');
    console.log('=' .repeat(40));
    await seedDatabase();

    // Step 2: Test all APIs
    console.log('\n🔍 STEP 2: TESTING ALL APIs');
    console.log('=' .repeat(40));
    await runAllTests();

    // Step 3: Show database summary
    console.log('\n📊 STEP 3: DATABASE SUMMARY');
    console.log('=' .repeat(40));
    await showDatabaseSummary();

    console.log('\n✅ COMPLETE TEST SUITE FINISHED!');
    console.log('=' .repeat(60));
    console.log('🎉 Your database now contains:');
    console.log('   • Test users with different roles');
    console.log('   • Sample questions and answers');
    console.log('   • Popular tags');
    console.log('   • Notifications');
    console.log('   • All APIs have been tested');
    console.log('');
    console.log('📁 You can now view all this data in your MongoDB database');
    console.log('🔗 Connect to your database to see all the test data');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

async function showDatabaseSummary() {
  const mongoose = require('mongoose');
  const User = require('./models/User');
  const Question = require('./models/Question');
  const Answer = require('./models/Answer');
  const Tag = require('./models/Tag');
  const Notification = require('./models/Notification');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Get counts
    const userCount = await User.countDocuments();
    const tagCount = await Tag.countDocuments();
    const questionCount = await Question.countDocuments();
    const answerCount = await Answer.countDocuments();
    const notificationCount = await Notification.countDocuments();

    console.log('📊 DATABASE CONTENTS:');
    console.log('=' .repeat(30));
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏷️ Tags: ${tagCount}`);
    console.log(`❓ Questions: ${questionCount}`);
    console.log(`💬 Answers: ${answerCount}`);
    console.log(`🔔 Notifications: ${notificationCount}`);

    // Show sample data
    console.log('\n📋 SAMPLE DATA:');
    console.log('=' .repeat(30));

    // Show users
    const users = await User.find().select('username email role reputation').limit(3);
    console.log('👥 Sample Users:');
    users.forEach(user => {
      console.log(`   • ${user.username} (${user.email}) - ${user.role} - Rep: ${user.reputation}`);
    });

    // Show questions
    const questions = await Question.find().select('title votes views').limit(3);
    console.log('\n❓ Sample Questions:');
    questions.forEach(q => {
      console.log(`   • "${q.title.substring(0, 50)}..." - Votes: ${q.votes}, Views: ${q.views}`);
    });

    // Show tags
    const tags = await Tag.find().select('name usageCount').limit(5);
    console.log('\n🏷️ Sample Tags:');
    tags.forEach(tag => {
      console.log(`   • ${tag.name} (${tag.usageCount} uses)`);
    });

    // Show answers
    const answers = await Answer.find().select('content votes isAccepted').limit(2);
    console.log('\n💬 Sample Answers:');
    answers.forEach(answer => {
      const status = answer.isAccepted ? '✅ Accepted' : '⏳ Pending';
      console.log(`   • "${answer.content.substring(0, 50)}..." - Votes: ${answer.votes} - ${status}`);
    });

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error showing database summary:', error);
  }
}

// Export for use in other files
module.exports = {
  runFullTestSuite,
  showDatabaseSummary
};

// Run if this file is executed directly
if (require.main === module) {
  runFullTestSuite();
} 