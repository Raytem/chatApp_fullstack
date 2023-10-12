import axios from "axios";
import { getToken, setToken } from "../../utils/localStorage_token";
import { SignupResponse } from "../../types/interfaces/SignupResponse";

export const $api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
})

$api.interceptors.request.use(function (config) {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
}, function (error) {
  return Promise.reject(error);
});

$api.interceptors.response.use(function (response) {
  return response;
}, async function (error) {
  const req = error.config;
  if (error.response.status === 401 && !req._isRetry) {
    req._isRetry = true;
    try {
      const signupResponse = await axios.get<SignupResponse>(
        `${import.meta.env.VITE_SERVER_URL}/auth/refresh`, 
        {withCredentials: true}
      );
      setToken(signupResponse.data.accessToken);
      return $api.request(req);
    } catch (e) {
      console.error('unauthorized')
    }
  } 
  return Promise.reject(error);
});
