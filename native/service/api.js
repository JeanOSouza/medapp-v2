import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  // baseURL: "http://192.168.2.56:3000",
  baseURL: "https://medapp-v2.onrender.com/",
  timeout: 20000,
});

console.log("API URL:", api.defaults.baseURL);

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log("AsyncStorage não disponível");
  }

  return config;
});

export default api;
