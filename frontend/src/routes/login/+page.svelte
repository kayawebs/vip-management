<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authApi } from '$lib/api';
  import { authStore } from '$lib/stores/auth';

  let isRegistering = false;
  let storeName = '';
  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  onMount(() => {
    // 如果已经登录，直接跳转到首页
    const unsubscribe = authStore.subscribe(state => {
      if (state.isAuthenticated) {
        goto('/');
      }
    });

    return unsubscribe;
  });

  async function handleSubmit() {
    try {
      loading = true;
      error = '';

      if (isRegistering) {
        const response = await authApi.register({
          storeName,
          username,
          password
        });
        // 使用store管理登录状态
        authStore.login(response.token, response.user);
      } else {
        const response = await authApi.login({
          username,
          password
        });
        // 使用store管理登录状态
        authStore.login(response.token, response.user);
      }

      // 登录成功后跳转
      goto('/');
    } catch (err: any) {
      error = err.message || '操作失败，请重试';
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <h1 class="login-title">SPA店管理平台</h1>
      <h2 class="login-subtitle">
        {isRegistering ? '注册新店铺' : '登录'}
      </h2>
    </div>
    
    <form class="login-form" on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        {#if isRegistering}
          <div class="input-group">
            <label for="store-name" class="input-label">店铺名</label>
            <input
              id="store-name"
              name="storeName"
              type="text"
              required
              bind:value={storeName}
              class="input-field"
              placeholder="请输入店铺名"
            />
          </div>
        {/if}
        
        <div class="input-group">
          <label for="username" class="input-label">用户名</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            bind:value={username}
            class="input-field"
            placeholder="请输入用户名"
          />
        </div>
        
        <div class="input-group">
          <label for="password" class="input-label">密码</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="input-field"
            placeholder="请输入密码"
          />
        </div>
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <button
        type="submit"
        disabled={loading}
        class="submit-button"
      >
        {#if loading}
          <span class="loading-spinner">
            <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        {/if}
        {isRegistering ? '注册' : '登录'}
      </button>

      <div class="switch-mode">
        <button
          type="button"
          class="switch-button"
          on:click={() => {
            isRegistering = !isRegistering;
            error = '';
          }}
        >
          {isRegistering ? '已有账号？去登录' : '没有账号？去注册'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }

  .login-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    padding: 2.5rem;
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-title {
    color: #333;
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .login-subtitle {
    color: #666;
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-label {
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .input-field {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background-color: #f9fafb;
  }

  .input-field:focus {
    outline: none;
    border-color: #667eea;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .input-field::placeholder {
    color: #9ca3af;
  }

  .error-message {
    color: #dc2626;
    font-size: 0.875rem;
    text-align: center;
    padding: 0.5rem;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
  }

  .submit-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .loading-spinner {
    display: flex;
    align-items: center;
  }

  .spinner {
    width: 1.25rem;
    height: 1.25rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .switch-mode {
    text-align: center;
  }

  .switch-button {
    background: none;
    border: none;
    color: #667eea;
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s;
  }

  .switch-button:hover {
    color: #5a67d8;
  }

  @media (max-width: 480px) {
    .login-card {
      padding: 1.5rem;
      margin: 1rem;
    }

    .login-title {
      font-size: 1.5rem;
    }

    .login-subtitle {
      font-size: 1rem;
    }
  }
</style> 