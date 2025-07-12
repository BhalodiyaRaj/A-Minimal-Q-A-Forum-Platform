const mongoose = require('mongoose');
const Question = require('./models/Question');
const Answer = require('./models/Answer');

async function updateAnswerCounts() {
  try {
    // Make sure to replace with your actual connection string if it's different
    await mongoose.connect('mongodb://localhost:27017/qaforum', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    const questions = await Question.find({});
    if (questions.length === 0) {
      console.log('No questions found to update.');
      return;
    }

    console.log(`Found ${questions.length} questions. Recalculating answer counts...`);

    for (const question of questions) {
      const count = await Answer.countDocuments({ question: question._id });
      if (question.answerCount !== count) {
        question.answerCount = count;
        await question.save();
        console.log(`Updated question "${question.title}" - New answer count: ${count}`);
      }
    }

    console.log('Finished updating all answer counts.');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

updateAnswerCounts(); 