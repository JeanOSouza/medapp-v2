import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { Platform } from "react-native";

const api = axios.create({
  // baseURL: "http://192.168.2.56:3000",
  baseURL: "https://medapp-v2.onrender.com",
  timeout: 60000,
});

console.log("API URL:", api.defaults.baseURL);

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");

    let deviceId = null;

    if (Platform.OS === "android") {
      deviceId = Application.androidId;
    } else if (Platform.OS === "ios") {
      deviceId = await Application.getIosIdForVendorAsync();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.deviceid = deviceId;
  } catch (error) {
    console.log("Erro interceptor:", error);
  }

  return config;
});

export default api;
