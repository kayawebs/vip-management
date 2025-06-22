<script lang="ts">
  import { vipApi, technicianApi } from '$lib/api';
  import { onMount } from 'svelte';

  let name = '';
  let phone = '';
  let initialBalance = '';
  let discount = '1.0';
  let technicianId = '';
  let notes = '';
  let loading = false;
  let error: string | null = null;
  let technicians = [];

  onMount(async () => {
    try {
      const response = await technicianApi.getAll();
      technicians = response.data;
    } catch (err) {
      console.error('加载技师列表失败:', err);
    }
  });

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

    // 验证折扣
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue) || discountValue < 0.1 || discountValue > 1.0) {
      alert('折扣必须在0.1到1.0之间');
      return;
    }

    loading = true;
    error = null;

    try {
      const data: any = {
        name: name.trim(),
        phone: phone.trim(),
        discount: discountValue
      };

      // 如果有初始余额，添加到请求中
      if (initialBalance && parseFloat(initialBalance) > 0) {
        data.balance = parseFloat(initialBalance);
        // 如果有技师选择，添加到请求中
        if (technicianId) {
          data.technicianId = technicianId;
        }
        // 如果有备注，添加到请求中
        if (notes.trim()) {
          data.notes = notes.trim();
        }
      }

      const result = await vipApi.create(data);
      alert('添加会员成功');

      // 跳转到会员详情页
      window.location.href = `/vip/${result.data._id}`;
    } catch (err: any) {
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
        <label for="discount">会员折扣</label>
        <input
          type="number"
          id="discount"
          bind:value={discount}
          placeholder="折扣比例"
          min="0.1"
          max="1.0"
          step="0.1"
          required
        />
        <small>折扣范围：0.1-1.0，1.0表示原价，0.8表示8折</small>
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
        <small>如果设置初始余额，将自动创建充值记录</small>
      </div>

      {#if initialBalance && parseFloat(initialBalance) > 0}
        <div class="form-group">
          <label for="technician">技师（可选）</label>
          <select
            id="technician"
            bind:value={technicianId}
          >
            <option value="">请选择技师（可选）</option>
            {#each technicians as technician}
              {#if technician.isActive}
                <option value={technician._id}>{technician.name} ({technician.code})</option>
              {/if}
            {/each}
          </select>
          <small>选择负责初始充值的技师</small>
        </div>

        <div class="form-group">
          <label for="notes">备注（可选）</label>
          <textarea
            id="notes"
            bind:value={notes}
            placeholder="初始充值备注信息"
            rows="3"
          ></textarea>
          <small>为初始充值添加备注信息</small>
        </div>
      {/if}

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

  input, select, textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
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
