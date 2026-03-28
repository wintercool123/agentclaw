import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  balance: number;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!user.value);

  // Set axios default header
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    token.value = response.data.token;
    user.value = response.data.user;
    localStorage.setItem('token', token.value!);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    return response.data;
  };

  const register = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/register', { email, password });
    token.value = response.data.token;
    user.value = response.data.user;
    localStorage.setItem('token', token.value!);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    return response.data;
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const fetchUser = async () => {
    if (!token.value) return;
    try {
      const response = await axios.get('/api/auth/me');
      user.value = response.data;
    } catch {
      logout();
    }
  };

  // Auto-fetch user on store init
  if (token.value) {
    fetchUser();
  }

  return { user, token, isAuthenticated, login, register, logout, fetchUser };
});
