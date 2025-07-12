export const API_ENDPOINT = {
  // Auth endpoints
  POST_REGISTER: "/api/auth/register",
  POST_LOGIN: "/api/auth/login",
  CHECK_USERNAME: "/api/auth/check-username/{username}",
  CHECK_EMAIL: "/api/auth/check-email/{email}",
  POST_LOGOUT: "/api/auth/logout",
  GET_ME: "/api/auth/me",
  PUT_PROFILE: "/api/auth/profile",
  POST_AVATAR: "/api/auth/avatar",
  DELETE_AVATAR: "/api/auth/avatar",
  PUT_PREFERENCES: "/api/auth/preferences",
  POST_REFRESH: "/api/auth/refresh",
  
  // Question endpoints
  GET_QUESTIONS: "/api/questions",
  GET_QUESTION: "/api/questions/{id}",
  POST_QUESTION: "/api/questions",
  PUT_QUESTION: "/api/questions/{id}",
  DELETE_QUESTION: "/api/questions/{id}",
  POST_QUESTION_VOTE: "/api/questions/{id}/vote",
  GET_UNANSWERED_QUESTIONS: "/api/questions/unanswered",
  GET_FEATURED_QUESTIONS: "/api/questions/featured",
  GET_QUESTIONS_BY_TAG: "/api/questions/tags/{tag}",
  POST_ACCEPT_ANSWER: "/api/questions/{id}/accept-answer/{answerId}",
  
  // Answer endpoints
  GET_ANSWERS: "/api/answers/question/{questionId}",
  GET_ANSWER: "/api/answers/{id}",
  POST_ANSWER: "/api/answers",
  PUT_ANSWER: "/api/answers/{id}",
  DELETE_ANSWER: "/api/answers/{id}",
  POST_ANSWER_VOTE: "/api/answers/{id}/vote",
  POST_ACCEPT_ANSWER_DIRECT: "/api/answers/{id}/accept",
  POST_UNACCEPT_ANSWER: "/api/answers/{id}/unaccept",
  GET_USER_ANSWERS: "/api/answers/user/{userId}",
  GET_ANSWERS_COUNT: "/api/answers/count",
  
  // Tag endpoints
  GET_TAGS: "/api/tags",
  GET_TAG: "/api/tags/{id}",
  GET_POPULAR_TAGS: "/api/tags/popular",
  POST_TAG: "/api/tags",
  PUT_TAG: "/api/tags/{id}",
  DELETE_TAG: "/api/tags/{id}",
  GET_TAG_QUESTIONS: "/api/tags/{id}/questions",
  SEARCH_TAGS: "/api/tags/search/{query}",
  
  // User endpoints
  GET_USERS: "/api/users",
  GET_USER_PROFILE: "/api/users/{id}",
  PUT_USER_PROFILE: "/api/users/profile",
  GET_USER_QUESTIONS: "/api/users/{id}/questions",
  GET_USER_ANSWERS: "/api/users/{id}/answers",
  GET_USER_ACTIVITY: "/api/users/{id}/activity",
  GET_LEADERBOARD: "/api/users/leaderboard",
  PUT_USER_REPUTATION: "/api/users/{id}/reputation",
  DELETE_USER: "/api/users/{id}",
  
  // Notification endpoints
  GET_NOTIFICATIONS: "/api/notifications",
  MARK_NOTIFICATION_READ: "/api/notifications/{id}/read",
  MARK_ALL_READ: "/api/notifications/read-all",
  DELETE_NOTIFICATION: "/api/notifications/{id}",
  DELETE_ALL_NOTIFICATIONS: "/api/notifications/delete-all",
  
  // Search endpoints
  SEARCH_QUESTIONS: "/api/search/questions",
  SEARCH_TAGS: "/api/search/tags",
  SEARCH_USERS: "/api/search/users",
};
