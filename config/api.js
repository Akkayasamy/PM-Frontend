import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/v1";
// const API_BASE_URL =
//   "https://ffc9amxie7.execute-api.ap-south-1.amazonaws.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  // headers: {
  //   "Access-Control-Allow-Origin": "https://main.d2nw62lz5uvao9.amplifyapp.com",
  // },
  withCredentials: true,
  headers: {
    "Access-Control-Allow-Origin": "http://localhost:3000",
  },

  // headers: {
  //   Authorization: `Bearer ${token}`,
  // },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
