import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface User {
  id: string;
  storeName: string;
  username: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isInitialized: boolean;
}

// 从localStorage获取初始状态
function getInitialState(): AuthState {
  if (!browser) {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      isInitialized: false
    };
  }

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return {
        isAuthenticated: true,
        user,
        token,
        isInitialized: true
      };
    } catch (error) {
      console.error('解析用户信息失败:', error);
      // 清除无效数据
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  return {
    isAuthenticated: false,
    user: null,
    token: null,
    isInitialized: true
  };
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(getInitialState());

  return {
    subscribe,
    
    // 登录
    login: (token: string, user: User) => {
      if (browser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      set({
        isAuthenticated: true,
        user,
        token,
        isInitialized: true
      });
    },

    // 登出
    logout: () => {
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isInitialized: true
      });
    },

    // 初始化
    initialize: () => {
      set(getInitialState());
    },

    // 更新用户信息
    updateUser: (user: User) => {
      update(state => {
        if (browser) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return { ...state, user };
      });
    }
  };
}

export const authStore = createAuthStore(); 