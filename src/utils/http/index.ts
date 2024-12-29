import axios from "axios";

export function setupAxios(options = {}) {
  const defaultConfig = {
    baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
    timeout: 5000,
  }

  const service = axios.create({
    ...defaultConfig,
    ...options
  })

  return service;
}

export const request = setupAxios();