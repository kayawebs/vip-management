<script>
  import { onMount } from 'svelte';
  import { projectApi } from '$lib/api';

  let projects = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const data = await projectApi.getAll();
      projects = data.data;
    } catch (err) {
      console.error('获取项目列表失败:', err);
      error = err.message || '加载项目列表失败';
    } finally {
      loading = false;
    }
  });

  async function toggleProjectStatus(id, currentStatus) {
    try {
      await projectApi.update(id, { isActive: !currentStatus });

      // 更新本地状态
      projects = projects.map(project =>
        project._id === id
          ? { ...project, isActive: !currentStatus }
          : project
      );
    } catch (err) {
      alert('操作失败: ' + (err.message || '未知错误'));
    }
  }
</script>

<div class="projects-page">
  <div class="header">
    <h1>项目管理</h1>
    <a href="/projects/new" class="add-button">添加项目</a>
  </div>

  {#if loading}
    <div class="loading">加载中...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>重试</button>
    </div>
  {:else if projects.length === 0}
    <div class="empty-state">
      <p>暂无项目记录</p>
      <a href="/projects/new" class="button">添加第一个项目</a>
    </div>
  {:else}
    <div class="projects-grid">
      {#each projects as project}
        <div class="project-card {project.isActive ? '' : 'inactive'}">
          <div class="project-header">
            <h3>{project.name}</h3>
            <span class="status-badge {project.isActive ? 'active' : 'inactive'}">
              {project.isActive ? '启用' : '停用'}
            </span>
          </div>
          <div class="project-details">
            <div class="detail-item">
              <span class="label">价格</span>
              <span class="value">¥{project.price.toFixed(2)}</span>
            </div>
            <div class="detail-item">
              <span class="label">时长</span>
              <span class="value">{project.duration}分钟</span>
            </div>
            {#if project.notes}
              <div class="detail-item">
                <span class="label">备注</span>
                <span class="value notes">{project.notes}</span>
              </div>
            {/if}
          </div>
          <div class="project-actions">
            <a href={`/projects/${project._id}`} class="action-button edit">编辑</a>
            <button
              class="action-button {project.isActive ? 'deactivate' : 'activate'}"
              on:click={() => toggleProjectStatus(project._id, project.isActive)}
            >
              {project.isActive ? '停用' : '启用'}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .projects-page {
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

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .project-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .project-card.inactive {
    opacity: 0.7;
    background-color: #f9f9f9;
  }

  .project-header {
    padding: 1rem 1.5rem;
    background-color: #f5f5f5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .project-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .status-badge.active {
    background-color: #e8f5e9;
    color: #388e3c;
  }

  .status-badge.inactive {
    background-color: #ffebee;
    color: #c62828;
  }

  .project-details {
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

  .project-actions {
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
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
