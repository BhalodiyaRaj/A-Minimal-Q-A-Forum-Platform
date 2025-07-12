import axios from "axios";
import { API_ENDPOINT } from "./apiEndpoint";

const API_URL = import.meta.env.VITE_BACKEND_URL;

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
