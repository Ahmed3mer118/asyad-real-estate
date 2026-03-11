// services/ApiService.js — Base class for all API calls (backend: /api/v1)
import axios from 'axios';

const TOKEN_KEY = 'asyad_token';
const USER_KEY = 'asyad_user';
// In production (e.g. Vercel) set VITE_API_URL to your deployed backend URL — never use localhost from a public site.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
  constructor(resource) {
    this.resource = resource;
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      const raw = typeof token === 'string' && token.startsWith('"') ? JSON.parse(token) : token;
      if (raw) config.headers.Authorization = `Bearer ${raw}`;
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        const isLoginRequest = err.config?.url?.includes('/auth/login');
        if (err.response?.status === 401 && !isLoginRequest) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    );
  }

  async getAll(params = {}) {
    const { data } = await this.client.get(`/${this.resource}`, { params });
    return data;
  }

  async getById(id) {
    const { data } = await this.client.get(`/${this.resource}/${id}`);
    return data;
  }

  async create(payload) {
    const { data } = await this.client.post(`/${this.resource}`, payload);
    return data;
  }

  async update(id, payload) {
    const { data } = await this.client.patch(`/${this.resource}/${id}`, payload);
    return data;
  }

  async delete(id) {
    const { data } = await this.client.delete(`/${this.resource}/${id}`);
    return data;
  }

  async custom(method, path, payload = null, params = {}) {
    const { data } = await this.client({ method, url: `/${this.resource}${path}`, data: payload, params });
    return data;
  }
}

export default ApiService;
