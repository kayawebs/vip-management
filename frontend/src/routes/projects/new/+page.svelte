<script lang="ts">
  import { projectApi } from '$lib/api';

  let name = '';
  let price = '';
  let duration = '';
  let notes = '';
  let loading = false;
  let error = null;

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

    loading = true;
    error = null;

    try {
      const data = {
        name: name.trim(),
        price: parseFloat(price),
        duration: parseInt(duration),
        notes: notes.trim(),
        isActive: true
      };

      const result = await projectApi.create(data);
      alert('添加项目成功');

      // 跳转到项目列表
      window.location.href = '/projects';
    } catch (err) {
      console.error('添加项目失败:', err);
      error = err.message || '添加项目失败';
    } finally {
      loading = false;
    }
  }
</script>

<div class="new-project-page">
  <div class="header">
    <h1>添加服务项目</h1>
    <a href="/projects" class="back-button">返回列表</a>
  </div>

  <div class="form-card">
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
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
        disabled={loading}
      >
        {loading ? '添加中...' : '添加项目'}
      </button>
    </form>
  </div>
</div>

<style>
  .new-project-page {
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
