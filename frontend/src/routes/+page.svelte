<script lang="ts">
  import { onMount } from 'svelte';
  import { vipApi, projectApi, technicianApi } from '$lib/api';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';

  let stats = {
    vips: 0,
    projects: 0,
    technicians: 0
  };

  let loading = true;
  let error = '';

  let user: any = null;

  onMount(() => {
    const unsubscribe = authStore.subscribe(state => {
      user = state.user;
      if (!state.isAuthenticated) {
        goto('/login');
      }
    });

    return unsubscribe;
  });

  onMount(async () => {
    try {
      const [vipsData, projectsData, techniciansData] = await Promise.all([
        vipApi.getAll(),
        projectApi.getAll(),
        technicianApi.getAll()
      ]);

      stats = {
        vips: vipsData.data?.length || 0,
        projects: projectsData.data?.length || 0,
        technicians: techniciansData.data?.length || 0
      };
    } catch (err: any) {
      console.error('获取统计数据失败:', err);
      error = err.message || '无法连接到后端服务';
    } finally {
      loading = false;
    }
  });

  function handleLogout() {
    authStore.logout();
    goto('/login');
  }
</script>

<div class="home-container">
  <div class="welcome-card">
    <h1>欢迎使用SPA店管理平台</h1>
    
    {#if user}
      <div class="user-info">
        <h2>用户信息</h2>
        <p><strong>店铺名：</strong>{user.storeName}</p>
        <p><strong>用户名：</strong>{user.username}</p>
        <p><strong>注册时间：</strong>{new Date(user.createdAt).toLocaleDateString('zh-CN')}</p>
      </div>
    {/if}

    <div class="actions">
      <button class="logout-button" on:click={handleLogout}>
        退出登录
      </button>
    </div>
  </div>
</div>

<div class="dashboard">
  <h1>仪表盘</h1>

  {#if loading}
    <div class="loading">加载中...</div>
  {:else if error}
    <div class="error">
      <h2>出错了</h2>
      <p>{error}</p>
      <p>请确保后端服务器正在运行，并且API地址配置正确</p>
    </div>
  {:else}
    <div class="stats-cards">
      <div class="card">
        <div class="card-icon vip-icon">👥</div>
        <div class="card-content">
          <h2>{stats.vips}</h2>
          <p>会员人数</p>
        </div>
        <a href="/vip" class="card-link">查看详情</a>
      </div>

      <div class="card">
        <div class="card-icon project-icon">🧖‍♀️</div>
        <div class="card-content">
          <h2>{stats.projects}</h2>
          <p>服务项目</p>
        </div>
        <a href="/projects" class="card-link">查看详情</a>
      </div>

      <div class="card">
        <div class="card-icon tech-icon">👩‍⚕️</div>
        <div class="card-content">
          <h2>{stats.technicians}</h2>
          <p>技师人数</p>
        </div>
        <a href="/technicians" class="card-link">查看详情</a>
      </div>
    </div>

    <div class="quick-actions">
      <h2>快捷操作</h2>
      <div class="action-buttons">
        <a href="/vip/new" class="action-button">
          <span class="icon">➕</span>
          <span>新增会员</span>
        </a>
        <a href="/projects/new" class="action-button">
          <span class="icon">➕</span>
          <span>新增项目</span>
        </a>
        <a href="/technicians/new" class="action-button">
          <span class="icon">➕</span>
          <span>新增技师</span>
        </a>
        <a href="/reports" class="action-button">
          <span class="icon">📊</span>
          <span>查看报表</span>
        </a>
      </div>
    </div>
  {/if}
</div>

<style>
  .home-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .welcome-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }

  .user-info {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .user-info h2 {
    color: #495057;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .user-info p {
    margin: 0.5rem 0;
    color: #6c757d;
  }

  .actions {
    text-align: center;
  }

  .logout-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .logout-button:hover {
    background: #c82333;
  }

  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    margin-bottom: 2rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: #666;
  }

  .error {
    text-align: center;
    padding: 2rem;
    background-color: #ffebee;
    border-radius: 8px;
    margin: 2rem 0;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .card-icon {
    font-size: 2.5rem;
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }

  .vip-icon {
    background-color: #e3f2fd;
    color: #1976d2;
  }

  .project-icon {
    background-color: #e8f5e9;
    color: #388e3c;
  }

  .tech-icon {
    background-color: #fff8e1;
    color: #ffa000;
  }

  .card-content h2 {
    font-size: 2rem;
    margin: 0;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .card-content p {
    margin: 0;
    color: #666;
  }

  .card-link {
    position: absolute;
    bottom: 1rem;
    right: 1.5rem;
    color: #1976d2;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .card-link:hover {
    text-decoration: underline;
  }

  .quick-actions {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .quick-actions h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .action-button {
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 6px;
    text-decoration: none;
    color: #333;
    transition: background-color 0.2s;
  }

  .action-button:hover {
    background-color: #e0e0e0;
  }

  .action-button .icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }

  @media (max-width: 768px) {
    .stats-cards {
      grid-template-columns: 1fr;
    }
  }
</style>
