<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { technicianApi } from '$lib/api';

  let technician = null;
  let name = '';
  let code = '';
  let phone = '';
  let notes = '';
  let isActive = true;
  let loading = true;
  let saving = false;
  let error = null;

  onMount(async () => {
    try {
      const id = $page.params.id;
      const data = await technicianApi.getById(id);

      technician = data.data;
      name = technician.name;
      code = technician.code;
      phone = technician.phone || '';
      notes = technician.notes || '';
      isActive = technician.isActive;
    } catch (err) {
      console.error('加载技师信息失败:', err);
      error = err.message || '加载技师信息失败';
    } finally {
      loading = false;
    }
  });

  async function handleSubmit() {
    if (!name.trim()) {
      alert('请输入技师姓名');
      return;
    }

    if (!code.trim()) {
      alert('请输入技师编号');
      return;
    }

    saving = true;
    error = null;

    try {
      const data = {
        name: name.trim(),
        code: code.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive
      };

      await technicianApi.update(technician._id, data);
      alert('更新技师信息成功');

      // 返回技师列表
      window.location.href = '/technicians';
    } catch (err) {
      console.error('更新技师信息失败:', err);
      error = err.message || '更新技师信息失败';
    } finally {
      saving = false;
    }
  }

  async function toggleStatus() {
    try {
      const newStatus = !isActive;

      await technicianApi.update(technician._id, { isActive: newStatus });
      isActive = newStatus;

      alert(newStatus ? '技师已设为在职' : '技师已设为离职');
    } catch (err) {
      alert('操作失败: ' + (err.message || '未知错误'));
    }
  }
</script>

<div class="edit-technician-page">
  <div class="header">
    <h1>{loading ? '加载中...' : technician ? '编辑技师: ' + technician.name : '技师详情'}</h1>
    <a href="/technicians" class="back-button">返回列表</a>
  </div>

  {#if loading}
    <div class="loading">加载中...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>重试</button>
    </div>
  {:else if technician}
    <div class="form-card">
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        <div class="status-toggle">
          <span class="status-label">技师状态:</span>
          <span class="status-badge {isActive ? 'active' : 'inactive'}">
            {isActive ? '在职' : '离职'}
          </span>
          <button
            type="button"
            class="toggle-button {isActive ? 'deactivate' : 'activate'}"
            on:click={toggleStatus}
          >
            {isActive ? '设为离职' : '设为在职'}
          </button>
        </div>

        <div class="form-group">
          <label for="name">技师姓名</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            placeholder="请输入技师姓名"
            required
          />
        </div>

        <div class="form-group">
          <label for="code">技师编号</label>
          <input
            type="text"
            id="code"
            bind:value={code}
            placeholder="请输入技师编号"
            required
          />
          <small>编号用于在消费时快速查找技师</small>
        </div>

        <div class="form-group">
          <label for="phone">手机号码（可选）</label>
          <input
            type="tel"
            id="phone"
            bind:value={phone}
            placeholder="请输入手机号码"
            maxlength="11"
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
      <p>未找到技师信息</p>
      <a href="/technicians" class="button">返回列表</a>
    </div>
  {/if}
</div>

<style>
  .edit-technician-page {
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
