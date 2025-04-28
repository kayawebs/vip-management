<script lang="ts">
  import { onMount } from 'svelte';
  import { vipApi } from '$lib/api/index.ts';

  let vips = [];
  let loading = true;
  let error = null;

  // 搜索功能
  let searchTerm = '';
  let filteredVips = [];

  // 分页功能
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let paginatedVips = [];

  $: {
    // 过滤VIP列表
    if (vips.length > 0) {
      if (searchTerm.trim() === '') {
        filteredVips = [...vips];
      } else {
        const term = searchTerm.toLowerCase();
        filteredVips = vips.filter(vip =>
          vip.name.toLowerCase().includes(term) ||
          vip.phone.includes(term)
        );
      }

      // 更新总页数
      totalPages = Math.ceil(filteredVips.length / itemsPerPage);

      // 确保当前页不超过总页数
      if (currentPage > totalPages) {
        currentPage = totalPages || 1;
      }

      // 分页
      const startIndex = (currentPage - 1) * itemsPerPage;
      paginatedVips = filteredVips.slice(startIndex, startIndex + itemsPerPage);
    }
  }

  function changePage(page) {
    currentPage = page;
  }

  onMount(async () => {
    try {
      const data = await vipApi.getAll();
      vips = data.data;
    } catch (err) {
      console.error('获取VIP列表失败:', err);
      error = err.message || '加载VIP列表失败';
    } finally {
      loading = false;
    }
  });
</script>

<div class="vip-list-page">
  <div class="header">
    <h1>VIP会员管理</h1>
    <a href="/vip/new" class="add-button">添加会员</a>
  </div>

  <div class="search-bar">
    <input
      type="text"
      placeholder="搜索会员姓名或手机号..."
      bind:value={searchTerm}
    />
  </div>

  {#if loading}
    <div class="loading">加载中...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>重试</button>
    </div>
  {:else if vips.length === 0}
    <div class="empty-state">
      <p>暂无会员记录</p>
      <a href="/vip/new" class="button">添加第一位会员</a>
    </div>
  {:else}
    <div class="vip-table-container">
      <table class="vip-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>手机号</th>
            <th>余额</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {#each paginatedVips as vip}
            <tr>
              <td>{vip.name}</td>
              <td>{vip.phone}</td>
              <td>¥{vip.balance.toFixed(2)}</td>
              <td>{new Date(vip.createdAt).toLocaleDateString()}</td>
              <td class="actions">
                <a href={`/vip/${vip._id}`} class="action-button">查看</a>
                <a href={`/vip/${vip._id}?tab=recharge`} class="action-button recharge">充值</a>
                <a href={`/vip/${vip._id}?tab=consume`} class="action-button consume">消费</a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if totalPages > 1}
      <div class="pagination">
        <button
          class="page-button"
          disabled={currentPage === 1}
          on:click={() => changePage(currentPage - 1)}
        >
          上一页
        </button>

        {#each Array(totalPages) as _, i}
          <button
            class="page-button {currentPage === i + 1 ? 'active' : ''}"
            on:click={() => changePage(i + 1)}
          >
            {i + 1}
          </button>
        {/each}

        <button
          class="page-button"
          disabled={currentPage === totalPages}
          on:click={() => changePage(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .vip-list-page {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .add-button {
    background-color: #4CAF50;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
  }

  .search-bar {
    margin-bottom: 1.5rem;
  }

  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .loading, .empty-state, .error {
    text-align: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 2rem 0;
  }

  .error {
    background-color: #ffebee;
    color: #c62828;
  }

  .button {
    display: inline-block;
    background-color: #4CAF50;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 4px;
    text-decoration: none;
    margin-top: 1rem;
  }

  .vip-table-container {
    overflow-x: auto;
  }

  .vip-table {
    width: 100%;
    border-collapse: collapse;
    white-space: nowrap;
  }

  .vip-table th, .vip-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  .vip-table th {
    background-color: #f5f5f5;
    font-weight: 500;
  }

  .vip-table tr:hover {
    background-color: #f9f9f9;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-button {
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.9rem;
    color: white;
    background-color: #2196F3;
  }

  .action-button.recharge {
    background-color: #4CAF50;
  }

  .action-button.consume {
    background-color: #FF9800;
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
    gap: 0.5rem;
  }

  .page-button {
    padding: 0.5rem 0.8rem;
    border: 1px solid #ddd;
    background-color: white;
    cursor: pointer;
    border-radius: 4px;
  }

  .page-button.active {
    background-color: #2196F3;
    color: white;
    border-color: #2196F3;
  }

  .page-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
