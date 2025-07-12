import axios from "axios";
import { API_ENDPOINT } from "./apiEndpoint";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to replace URL parameters
const replaceUrlParams = (url, params) => {
  let finalUrl = url;
  Object.keys(params).forEach(key => {
    finalUrl = finalUrl.replace(`{${key}}`, encodeURIComponent(params[key]));
  });
  return finalUrl;
};

// Auth functions
export async function registerUser({ username, email, password }) {
  const response = await axios.post(`${API_URL}${API_ENDPOINT.POST_REGISTER}`, {
    username,
    email,
    password,
  });
  console.log(response.data);
  return response.data;
}

export async function checkUsername(username) {
  const response = await axios.get(
    `${API_URL}${API_ENDPOINT.CHECK_USERNAME.replace(
      "{username}",
      encodeURIComponent(username)
    )}`
  );
  return response.data;
}

export async function checkEmail(email) {
  const response = await axios.get(
    `${API_URL}${API_ENDPOINT.CHECK_EMAIL.replace(
      "{email}",
      encodeURIComponent(email)
    )}`
  );
  return response.data;
}

export async function loginUser({ identifier, password }) {
  const response = await axios.post(`${API_URL}${API_ENDPOINT.POST_LOGIN}`, {
    identifier,
    password,
  });
  return response.data;
}

export async function getCurrentUser() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found");
  
  const response = await axios.get(`${API_URL}${API_ENDPOINT.GET_ME}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function logoutUser() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found");
  const response = await axios.post(
    `${API_URL}${API_ENDPOINT.POST_LOGOUT}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// Question functions
export async function getQuestions(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${API_ENDPOINT.GET_QUESTIONS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function getQuestion(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_QUESTION}`, { id });
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function createQuestion(questionData) {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINT.POST_QUESTION}`,
    questionData,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function updateQuestion(id, questionData) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.PUT_QUESTION}`, { id });
  const response = await axios.put(url, questionData, { headers: getAuthHeaders() });
  return response.data;
}

export async function deleteQuestion(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.DELETE_QUESTION}`, { id });
  const response = await axios.delete(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function voteQuestion(id, voteType) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.POST_QUESTION_VOTE}`, { id });
  const response = await axios.post(
    url,
    { voteType },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getUnansweredQuestions(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${API_ENDPOINT.GET_UNANSWERED_QUESTIONS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function getFeaturedQuestions(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${API_ENDPOINT.GET_FEATURED_QUESTIONS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function getQuestionsByTag(tag, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_QUESTIONS_BY_TAG}`, { tag });
  const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(finalUrl, { headers: getAuthHeaders() });
  return response.data;
}

export async function acceptAnswer(questionId, answerId) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.POST_ACCEPT_ANSWER}`, { id: questionId, answerId });
  const response = await axios.post(url, {}, { headers: getAuthHeaders() });
  return response.data;
}

// Answer functions
export async function getAnswers(questionId, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_ANSWERS}`, { questionId });
  const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(finalUrl, { headers: getAuthHeaders() });
  return response.data;
}

export async function getAnswer(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_ANSWER}`, { id });
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function createAnswer(answerData) {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINT.POST_ANSWER}`,
    answerData,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function updateAnswer(id, answerData) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.PUT_ANSWER}`, { id });
  const response = await axios.put(url, answerData, { headers: getAuthHeaders() });
  return response.data;
}

export async function deleteAnswer(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.DELETE_ANSWER}`, { id });
  const response = await axios.delete(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function voteAnswer(id, voteType) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.POST_ANSWER_VOTE}`, { id });
  const response = await axios.post(
    url,
    { voteType },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function unacceptAnswer(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.POST_UNACCEPT_ANSWER}`, { id });
  const response = await axios.post(url, {}, { headers: getAuthHeaders() });
  return response.data;
}

export async function approveAnswer(id) {
  const url = `${API_URL}/api/answers/${id}/approve`;
  const response = await axios.post(url, {}, { headers: getAuthHeaders() });
  return response.data;
}

export async function getAnswersCount() {
  const response = await axios.get(`${API_URL}${API_ENDPOINT.GET_ANSWERS_COUNT}`);
  return response.data;
}

// Tag functions
export async function getTags(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${API_ENDPOINT.GET_TAGS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url);
  return response.data;
}

export async function getTag(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_TAG}`, { id });
  const response = await axios.get(url);
  return response.data;
}

export async function getPopularTags(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${API_ENDPOINT.GET_POPULAR_TAGS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url);
  return response.data;
}

export async function createTag(tagData) {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINT.POST_TAG}`,
    tagData,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function updateTag(id, tagData) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.PUT_TAG}`, { id });
  const response = await axios.put(url, tagData, { headers: getAuthHeaders() });
  return response.data;
}

export async function deleteTag(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.DELETE_TAG}`, { id });
  const response = await axios.delete(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function getTagQuestions(id, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_TAG_QUESTIONS}`, { id });
  const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(finalUrl, { headers: getAuthHeaders() });
  return response.data;
}

export async function searchTags(query, params = {}) {
  const searchParams = { ...params, q: query };
  const queryString = new URLSearchParams(searchParams).toString();
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.SEARCH_TAGS}`, { query });
  const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(finalUrl, { headers: getAuthHeaders() });
  return response.data;
}

// User functions
export async function getUsers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${API_ENDPOINT.GET_USERS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function getUserProfile(userId) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_USER_PROFILE}`, { id: userId });
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function updateUserProfile(profileData) {
  const response = await axios.put(
    `${API_URL}${API_ENDPOINT.PUT_USER_PROFILE}`,
    profileData,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function updateProfile(profileData) {
  const response = await axios.put(
    `${API_URL}${API_ENDPOINT.PUT_PROFILE}`,
    profileData,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function uploadAvatar(formData) {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINT.POST_AVATAR}`,
    formData,
    { 
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
}

export async function deleteAvatar() {
  const response = await axios.delete(
    `${API_URL}${API_ENDPOINT.DELETE_AVATAR}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function updatePreferences(preferences) {
  const response = await axios.put(
    `${API_URL}${API_ENDPOINT.PUT_PREFERENCES}`,
    preferences,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function refreshToken() {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINT.POST_REFRESH}`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getUserQuestions(userId, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_USER_QUESTIONS}`, { id: userId });
  const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(finalUrl, { headers: getAuthHeaders() });
  return response.data;
}

export async function getUserAnswers(userId, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_USER_ANSWERS}`, { id: userId });
  const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(finalUrl, { headers: getAuthHeaders() });
  return response.data;
}

export async function getUserActivity(userId, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.GET_USER_ACTIVITY}`, { id: userId });
  const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(finalUrl, { headers: getAuthHeaders() });
  return response.data;
}

export async function getLeaderboard(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${API_ENDPOINT.GET_LEADERBOARD}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function deleteUser(userId) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.DELETE_USER}`, { id: userId });
  const response = await axios.delete(url, { headers: getAuthHeaders() });
  return response.data;
}

// Notification functions
export async function getNotifications(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${API_ENDPOINT.GET_NOTIFICATIONS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function markNotificationRead(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.MARK_NOTIFICATION_READ}`, { id });
  const response = await axios.put(url, {}, { headers: getAuthHeaders() });
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await axios.put(
    `${API_URL}${API_ENDPOINT.MARK_ALL_READ}`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function deleteNotification(id) {
  const url = replaceUrlParams(`${API_URL}${API_ENDPOINT.DELETE_NOTIFICATION}`, { id });
  const response = await axios.delete(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function deleteAllNotifications() {
  const response = await axios.delete(
    `${API_URL}${API_ENDPOINT.DELETE_ALL_NOTIFICATIONS}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

// Search functions
export async function searchQuestions(query, params = {}) {
  const searchParams = { ...params, q: query };
  const queryString = new URLSearchParams(searchParams).toString();
  const url = `${API_URL}${API_ENDPOINT.SEARCH_QUESTIONS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function searchUsers(query, params = {}) {
  const searchParams = { ...params, q: query };
  const queryString = new URLSearchParams(searchParams).toString();
  const url = `${API_URL}${API_ENDPOINT.SEARCH_USERS}${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}
