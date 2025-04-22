<script>
  import { onMount } from 'svelte';
  import { technicianApi } from '$lib/api';
  
  let technicians = [];
  let loading = true;
  let error = null;
  
  // 搜索功能
  let searchTerm = '';
  let filteredTechnicians = [];
  
  $: {
    if (technicians.length > 0) {
      if (searchTerm.trim() === '') {
        filteredTechnicians = [...technicians];
      } else {
        const term = searchTerm.toLowerCase();
        filteredTechnicians = technicians.filter(tech => 
          tech.name.toLowerCase().includes(term) || 
          tech.code.toLowerCase().includes(term)
        );
      }
    }
  }
  
  onMount(async () => {
    try {
      const data = await technicianApi.getAll();
      technicians = data;
    } catch (err) {
      console.error('获取技师列表失败:', err);
      error = err.message || '加载技师列表失败';
    } finally {
      loading = false;
    }
  });
  
  async function toggleTechnicianStatus(id, currentStatus) {
    try {
      await technicianApi.update(id, { isActive: !currentStatus });
      
      // 更新本地状态
      technicians = technicians.map(tech => 
        tech._id === id 
          ? { ...tech, isActive: !currentStatus } 
          : tech
      );
    } catch (err) {
      alert('操作失败: ' + (err.message || '未知错误'));
    }
  }
</script>

<div class="technicians-page">
  <div class="header">
    <h1>技师管理</h1>
    <a href="/technicians/new" class="add-button">添加技师</a>
  </div>
  
  <div class="search-bar">
    <input
      type="text"
      placeholder="搜索技师姓名或编号..."
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
  {:else if technicians.length === 0}
    <div class="empty-state">
      <p>暂无技师记录</p>
      <a href="/technicians/new" class="button">添加第一个技师</a>
    </div>
  {:else}
    <div class="technicians-grid">
      {#each filteredTechnicians as technician}
        <div class="technician-card {technician.isActive ? '' : 'inactive'}">
          <div class="technician-header">
            <h3>{technician.name}</h3>
            <span class="status-badge {technician.isActive ? 'active' : 'inactive'}">
              {technician.isActive ? '在职' : '离职'}
            </span>
          </div>
          <div class="technician-details">
            <div class="detail-item">
              <span class="label">编号</span>
              <span class="value">{technician.code}</span>
            </div>
            <div class="detail-item">
              <span class="label">手机号</span>
              <span class="value">{technician.phone || '未设置'}</span>
            </div>
            {#if technician.notes}
              <div class="detail-item">
                <span class="label">备注</span>
                <span class="value notes">{technician.notes}</span>
              </div>
            {/if}
          </div>
          <div class="technician-actions">
            <a href={`/technicians/${technician._id}`} class="action-button edit">
              编辑
            </a>
            <button 
              class="action-button {technician.isActive ? 'deactivate' : 'activate'}"
              on:click={() => toggleTechnicianStatus(technician._id, technician.isActive)}
            >
              {technician.isActive ? '设为离职' : '设为在职'}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .technicians-page {
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
  
  .search-bar input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .loading, .error, .empty-state {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .technicians-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .technician-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: box-shadow 0.3s;
  }
  
  .technician-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .technician-card.inactive {
    opacity: 0.7;
  }
  
  .technician-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eee;
  }
  
  .technician-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    font-size: 0.85rem;
  }
  
  .status-badge.active {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  .status-badge.inactive {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .technician-details {
    padding: 1.5rem;
  }
  
  .detail-item {
    margin-bottom: 0.75rem;
    display: flex;
    flex-direction: column;
  }
  
  .label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  .value.notes {
    font-weight: normal;
    font-size: 1rem;
    color: #666;
  }
  
  .technician-actions {
    padding: 1rem 1.5rem;
    background-color: #f9f9f9;
    display: flex;
    justify-content: space-between;
  }
  
  .action-button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9rem;
    border: none;
    color: white;
    font-weight: 500;
  }
  
  .action-button.edit {
    background-color: #2196F3;
  }
  
  .action-button.deactivate {
    background-color: #F44336;
  }
  
  .action-button.activate {
    background-color: #4CAF50;
  }
  
  @media (max-width: 768px) {
    .technicians-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 