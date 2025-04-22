<script>
  import { technicianApi } from '$lib/api';
  
  let name = '';
  let code = '';
  let phone = '';
  let notes = '';
  let loading = false;
  let error = null;
  
  async function handleSubmit() {
    if (!name.trim()) {
      alert('请输入技师姓名');
      return;
    }
    
    if (!code.trim()) {
      alert('请输入技师编号');
      return;
    }
    
    loading = true;
    error = null;
    
    try {
      const data = {
        name: name.trim(),
        code: code.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive: true
      };
      
      const result = await technicianApi.create(data);
      alert('添加技师成功');
      
      // 跳转到技师列表
      window.location.href = '/technicians';
    } catch (err) {
      console.error('添加技师失败:', err);
      error = err.message || '添加技师失败';
    } finally {
      loading = false;
    }
  }
</script>

<div class="new-technician-page">
  <div class="header">
    <h1>添加技师</h1>
    <a href="/technicians" class="back-button">返回列表</a>
  </div>
  
  <div class="form-card">
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit}>
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
        disabled={loading}
      >
        {loading ? '添加中...' : '添加技师'}
      </button>
    </form>
  </div>
</div>

<style>
  .new-technician-page {
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
  
  small {
    display: block;
    color: #666;
    margin-top: 0.25rem;
    font-size: 0.85rem;
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