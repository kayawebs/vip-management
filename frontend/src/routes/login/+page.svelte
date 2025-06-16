<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authApi } from '$lib/api';

  let isRegistering = false;
  let storeName = '';
  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  onMount(() => {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (token) {
      goto('/');
    }
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
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        const response = await authApi.login({
          username,
          password
        });
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      goto('/');
    } catch (err) {
      error = err.message || '操作失败，请重试';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {isRegistering ? '注册新店铺' : '登录'}
      </h2>
    </div>
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="rounded-md shadow-sm -space-y-px">
        {#if isRegistering}
          <div>
            <label for="store-name" class="sr-only">店铺名</label>
            <input
              id="store-name"
              name="storeName"
              type="text"
              required
              bind:value={storeName}
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="店铺名"
            />
          </div>
        {/if}
        <div>
          <label for="username" class="sr-only">用户名</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            bind:value={username}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 {isRegistering ? '' : 'rounded-t-md'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="用户名"
          />
        </div>
        <div>
          <label for="password" class="sr-only">密码</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="密码"
          />
        </div>
      </div>

      {#if error}
        <div class="text-red-500 text-sm text-center">{error}</div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {#if loading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          {/if}
          {isRegistering ? '注册' : '登录'}
        </button>
      </div>

      <div class="text-center">
        <button
          type="button"
          class="text-sm text-blue-600 hover:text-blue-500"
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