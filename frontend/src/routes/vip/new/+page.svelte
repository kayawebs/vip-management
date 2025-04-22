<script>
  import { vipApi } from '$lib/api';

  let name = '';
  let phone = '';
  let initialBalance = '';
  let loading = false;
  let error = null;

  async function handleSubmit() {
    console.log(1111)
    if (!name.trim()) {
      alert('请输入会员姓名');
      return;
    }

    if (!phone.trim() || !/^1\d{10}$/.test(phone)) {
      alert('请输入有效的手机号码');
      return;
    }


    loading = true;
    error = null;

    try {
      const data = {
        name: name.trim(),
        phone: phone.trim()
      };

      // 如果有初始余额，添加到请求中
      if (initialBalance && parseFloat(initialBalance) > 0) {
        data.balance = parseFloat(initialBalance);
      }

      const result = await vipApi.create(data);
      alert('添加会员成功');

      // 跳转到会员详情页
      window.location.href = `/vip/${result._id}`;
    } catch (err) {
      console.error('添加会员失败:', err);
      error = err.message || '添加会员失败';
    } finally {
      loading = false;
    }
  }
</script>

<div class="new-vip-page">
  <div class="header">
    <h1>添加会员</h1>
    <a href="/vip" class="back-button">返回列表</a>
  </div>

  <div class="form-card">
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="name">会员姓名</label>
        <input
          type="text"
          id="name"
          bind:value={name}
          placeholder="请输入会员姓名"
          required
        />
      </div>

      <div class="form-group">
        <label for="phone">手机号码</label>
        <input
          type="text"
          id="phone"
          bind:value={phone}
          placeholder="请输入11位手机号码"
          required
        />
        <small>请输入11位手机号，以1开头</small>
      </div>

      <div class="form-group">
        <label for="balance">初始余额（可选）</label>
        <input
          type="number"
          id="balance"
          bind:value={initialBalance}
          placeholder="可选，初始充值金额"
          min="0"
          step="1"
        />
      </div>

      <button
        type="submit"
        class="submit-button"
        disabled={loading}
      >
        {loading ? '添加中...' : '添加会员'}
      </button>
    </form>
  </div>
</div>

<style>
  .new-vip-page {
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

  input {
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
