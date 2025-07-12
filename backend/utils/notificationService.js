const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Create and send notification
  async createNotification(data) {
    try {
      const notification = await Notification.createNotification(data);
      
      // Populate sender and related data
      await notification.populate('sender', 'username avatar');
      if (data.question) {
        await notification.populate('question', 'title');
      }
      if (data.answer) {
        await notification.populate('answer', 'content');
      }

      // Send real-time notification
      this.sendRealTimeNotification(notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send real-time notification via Socket.IO
  sendRealTimeNotification(notification) {
    if (this.io) {
      this.io.to(`user_${notification.recipient}`).emit('notification', {
        type: 'new_notification',
        notification: {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          sender: notification.sender,
          question: notification.question,
          answer: notification.answer,
          createdAt: notification.createdAt,
          isRead: notification.isRead
        }
      });
    }
  }

  // Notify when someone answers a question
  async notifyQuestionAnswered(questionId, answerId, answerAuthorId) {
    try {
      const Question = require('../models/Question');
      const question = await Question.findById(questionId).populate('author');
      
      if (!question || question.author._id.toString() === answerAuthorId.toString()) {
        return; // Don't notify if answering own question
      }

      await this.createNotification({
        recipient: question.author._id,
        sender: answerAuthorId,
        type: 'question_answer',
        title: 'New answer to your question',
        message: `Someone answered your question "${question.title}"`,
        question: questionId,
        answer: answerId
      });
    } catch (error) {
      console.error('Error notifying question answered:', error);
    }
  }

  // Notify when someone comments on an answer
  async notifyAnswerCommented(answerId, commentId, commentAuthorId) {
    try {
      const Answer = require('../models/Answer');
      const answer = await Answer.findById(answerId).populate('author');
      
      if (!answer || answer.author._id.toString() === commentAuthorId.toString()) {
        return; // Don't notify if commenting on own answer
      }

      await this.createNotification({
        recipient: answer.author._id,
        sender: commentAuthorId,
        type: 'answer_comment',
        title: 'New comment on your answer',
        message: 'Someone commented on your answer',
        answer: answerId,
        comment: commentId
      });
    } catch (error) {
      console.error('Error notifying answer commented:', error);
    }
  }

  // Notify when someone comments on a question
  async notifyQuestionCommented(questionId, commentId, commentAuthorId) {
    try {
      const Question = require('../models/Question');
      const question = await Question.findById(questionId).populate('author');
      
      if (!question || question.author._id.toString() === commentAuthorId.toString()) {
        return; // Don't notify if commenting on own question
      }

      await this.createNotification({
        recipient: question.author._id,
        sender: commentAuthorId,
        type: 'question_comment',
        title: 'New comment on your question',
        message: 'Someone commented on your question',
        question: questionId,
        comment: commentId
      });
    } catch (error) {
      console.error('Error notifying question commented:', error);
    }
  }

  // Notify when answer is accepted
  async notifyAnswerAccepted(answerId, acceptedByUserId) {
    try {
      const Answer = require('../models/Answer');
      const answer = await Answer.findById(answerId).populate('author');
      
      if (!answer || answer.author._id.toString() === acceptedByUserId.toString()) {
        return; // Don't notify if accepting own answer
      }

      await this.createNotification({
        recipient: answer.author._id,
        sender: acceptedByUserId,
        type: 'answer_accepted',
        title: 'Your answer was accepted!',
        message: 'Congratulations! Your answer was marked as accepted.',
        answer: answerId
      });
    } catch (error) {
      console.error('Error notifying answer accepted:', error);
    }
  }

  // Notify when someone votes on content
  async notifyVote(contentType, contentId, voterId, voteType) {
    try {
      let content, authorId;
      
      if (contentType === 'question') {
        const Question = require('../models/Question');
        content = await Question.findById(contentId).populate('author');
        authorId = content?.author._id;
      } else if (contentType === 'answer') {
        const Answer = require('../models/Answer');
        content = await Answer.findById(contentId).populate('author');
        authorId = content?.author._id;
      }

      if (!content || authorId.toString() === voterId.toString()) {
        return; // Don't notify if voting on own content
      }

      const voteMessage = voteType === 'upvote' ? 'upvoted' : 'downvoted';
      const notificationType = `${contentType}_vote`;

      await this.createNotification({
        recipient: authorId,
        sender: voterId,
        type: notificationType,
        title: `Your ${contentType} was ${voteMessage}`,
        message: `Someone ${voteMessage} your ${contentType}`,
        [contentType]: contentId
      });
    } catch (error) {
      console.error('Error notifying vote:', error);
    }
  }

  // Notify when someone mentions a user
  async notifyMention(mentionedUsername, mentionerId, context) {
    try {
      const mentionedUser = await User.findOne({ username: mentionedUsername });
      
      if (!mentionedUser || mentionedUser._id.toString() === mentionerId.toString()) {
        return; // Don't notify if mentioning self
      }

      await this.createNotification({
        recipient: mentionedUser._id,
        sender: mentionerId,
        type: 'mention',
        title: 'You were mentioned',
        message: `@${mentionedUser.username} was mentioned in ${context}`,
        metadata: { context }
      });
    } catch (error) {
      console.error('Error notifying mention:', error);
    }
  }

  // Notify reputation change
  async notifyReputationChange(userId, points, reason) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user) return;

      await this.createNotification({
        recipient: userId,
        sender: userId, // Self notification
        type: 'reputation_change',
        title: 'Reputation changed',
        message: `Your reputation ${points > 0 ? 'increased' : 'decreased'} by ${Math.abs(points)} points. ${reason}`,
        metadata: { points, reason }
      });
    } catch (error) {
      console.error('Error notifying reputation change:', error);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      
      if (!notification || notification.recipient.toString() !== userId.toString()) {
        throw new Error('Notification not found or access denied');
      }

      await notification.markAsRead();
      
      // Send real-time update
      if (this.io) {
        this.io.to(`user_${userId}`).emit('notification', {
          type: 'notification_read',
          notificationId: notification._id
        });
      }

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      await Notification.markAllAsRead(userId);
      
      // Send real-time update
      if (this.io) {
        this.io.to(`user_${userId}`).emit('notification', {
          type: 'all_notifications_read'
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count for a user
  async getUnreadCount(userId) {
    try {
      return await Notification.countUnreadByUser(userId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 