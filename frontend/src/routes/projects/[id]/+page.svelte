<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { projectApi } from '$lib/api';
  
  let project = null;
  let name = '';
  let price = '';
  let duration = '';
  let notes = '';
  let isActive = true;
  let loading = true;
  let saving = false;
  let error = null;
  
  onMount(async () => {
    try {
      const id = $page.params.id;
      const data = await projectApi.getById(id);
      
      project = data;
      name = project.name;
      price = project.price.toString();
      duration = project.duration.toString();
      notes = project.notes || '';
      isActive = project.isActive;
    } catch (err) {
      console.error('加载项目失败:', err);
      error = err.message || '加载项目失败';
    } finally {
      loading = false;
    }
  });
  
  async function handleSubmit() {
    if (!name.trim()) {
      alert('请输入项目名称');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      alert('请输入有效的价格');
      return;
    }
    
    if (!duration || parseInt(duration) <= 0) {
      alert('请输入有效的服务时长');
      return;
    }
    
    saving = true;
    error = null;
    
    try {
      const data = {
        name: name.trim(),
        price: parseFloat(price),
        duration: parseInt(duration),
        notes: notes.trim(),
        isActive
      };
      
      await projectApi.update(project._id, data);
      alert('更新项目成功');
      
      // 返回项目列表
      window.location.href = '/projects';
    } catch (err) {
      console.error('更新项目失败:', err);
      error = err.message || '更新项目失败';
    } finally {
      saving = false;
    }
  }
  
  async function toggleStatus() {
    try {
      const newStatus = !isActive;
      
      await projectApi.update(project._id, { isActive: newStatus });
      isActive = newStatus;
      
      alert(newStatus ? '项目已启用' : '项目已停用');
    } catch (err) {
      alert('操作失败: ' + (err.message || '未知错误'));
    }
  }
</script>

<div class="edit-project-page">
  <div class="header">
    <h1>{loading ? '加载中...' : project ? '编辑项目: ' + project.name : '项目详情'}</h1>
    <a href="/projects" class="back-button">返回列表</a>
  </div>
  
  {#if loading}
    <div class="loading">加载中...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>重试</button>
    </div>
  {:else if project}
    <div class="form-card">
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="status-toggle">
          <span class="status-label">项目状态:</span>
          <span class="status-badge {isActive ? 'active' : 'inactive'}">
            {isActive ? '启用中' : '已停用'}
          </span>
          <button 
            type="button" 
            class="toggle-button {isActive ? 'deactivate' : 'activate'}"
            on:click={toggleStatus}
          >
            {isActive ? '停用项目' : '启用项目'}
          </button>
        </div>
        
        <div class="form-group">
          <label for="name">项目名称</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            placeholder="请输入项目名称"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="price">价格（元）</label>
          <input
            type="number"
            id="price"
            bind:value={price}
            placeholder="请输入项目价格"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="duration">服务时长（分钟）</label>
          <input
            type="number"
            id="duration"
            bind:value={duration}
            placeholder="请输入服务时长"
            min="1"
            step="1"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="notes">备注（可选）</label>
          <textarea
            id="notes"
            bind:value={notes}
            placeholder="可选备注信息"
            rows="4"
          ></textarea>
        </div>
        
        <button
          type="submit"
          class="submit-button"
          disabled={saving}
        >
          {saving ? '保存中...' : '保存修改'}
        </button>
      </form>
    </div>
  {:else}
    <div class="not-found">
      <p>未找到项目信息</p>
      <a href="/projects" class="button">返回列表</a>
    </div>
  {/if}
</div>

<style>
  .edit-project-page {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .back-button {
    background-color: #2196F3;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
  }
  
  .loading, .error, .not-found {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .error {
    color: #c62828;
  }
  
  .form-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 2rem;
  }
  
  .error-message {
    background-color: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .status-toggle {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .status-label {
    margin-right: 0.5rem;
    font-weight: 500;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    font-size: 0.85rem;
    margin-right: 1rem;
  }
  
  .status-badge.active {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  .status-badge.inactive {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .toggle-button {
    margin-left: auto;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    color: white;
    cursor: pointer;
  }
  
  .toggle-button.deactivate {
    background-color: #F44336;
  }
  
  .toggle-button.activate {
    background-color: #4CAF50;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .submit-button {
    display: block;
    width: 100%;
    padding: 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .submit-button:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
</style> 