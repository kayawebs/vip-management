<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { vipApi, projectApi, technicianApi } from '$lib/api';

  let vip = null;
  let projects = [];
  let technicians = [];
  let rechargeAmount = '';
  let rechargeNote = '';
  let selectedProjects = [];
  let selectedTechnician = '';
  let consumptionNote = '';
  let loading = true;
  let error = null;
  let activeTab = 'info'; // 'info', 'recharge', 'consume'

  onMount(async () => {
    try {
      const id = $page.params.id;
      // Check if there's a tab parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['info', 'recharge', 'consume'].includes(tabParam)) {
        activeTab = tabParam;
      }

      const [vipData, projectsData, techniciansData] = await Promise.all([
        vipApi.getById(id),
        projectApi.getAll(),
        technicianApi.getAll()
      ]);

      vip = vipData.data;
      projects = projectsData.data;
      technicians = techniciansData.data;
    } catch (err) {
      console.error('加载数据失败:', err);
      error = err.message || '加载数据失败';
    } finally {
      loading = false;
    }
  });

  function addProject(project) {
    const existingIndex = selectedProjects.findIndex(p => p.id === project._id);

    if (existingIndex >= 0) {
      const updatedProjects = [...selectedProjects];
      updatedProjects[existingIndex].quantity += 1;
      selectedProjects = updatedProjects;
    } else {
      selectedProjects = [...selectedProjects, {
        id: project._id,
        name: project.name,
        price: project.price,
        quantity: 1
      }];
    }
  }

  function removeProject(index) {
    selectedProjects = selectedProjects.filter((_, i) => i !== index);
  }

  function changeQuantity(index, newQuantity) {
    if (newQuantity < 1) return;

    const updatedProjects = [...selectedProjects];
    updatedProjects[index].quantity = newQuantity;
    selectedProjects = updatedProjects;
  }

  function calculateTotal() {
    return selectedProjects.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }

  async function handleRecharge() {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      alert('请输入有效的充值金额');
      return;
    }

    try {
      const result = await vipApi.recharge(vip._id, {
        amount: parseFloat(rechargeAmount),
        technicianId: selectedTechnician || undefined,
        notes: rechargeNote
      });

      alert('充值成功');
      vip = result.data.vip;
      rechargeAmount = '';
      rechargeNote = '';
      selectedTechnician = '';
      activeTab = 'info';
    } catch (err) {
      alert('充值失败: ' + (err.message || '未知错误'));
    }
  }

  async function handleConsume() {
    if (selectedProjects.length === 0) {
      alert('请选择消费项目');
      return;
    }

    if (!selectedTechnician) {
      alert('请选择技师');
      return;
    }

    if (calculateTotal() > vip.balance) {
      alert('余额不足');
      return;
    }

    try {
      const result = await vipApi.consume(vip._id, {
        projects: selectedProjects,
        technicianId: selectedTechnician,
        notes: consumptionNote
      });

      alert('消费成功');
      vip = result.data.vip;
      selectedProjects = [];
      selectedTechnician = '';
      consumptionNote = '';
      activeTab = 'info';
    } catch (err) {
      alert('消费失败: ' + (err.message || '未知错误'));
    }
  }
</script>

<div class="vip-detail">
  <div class="header">
    <h1>{loading ? '加载中...' : vip ? vip.name + ' 的会员信息' : 'VIP详情'}</h1>
    <a href="/vip" class="back-button">返回列表</a>
  </div>

  {#if loading}
    <div class="loading">加载中...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>重试</button>
    </div>
  {:else if vip}
    <div class="vip-card">
      <div class="vip-info">
        <div class="info-item">
          <span class="label">姓名</span>
          <span class="value">{vip.name}</span>
        </div>
        <div class="info-item">
          <span class="label">手机号</span>
          <span class="value">{vip.phone}</span>
        </div>
        <div class="info-item">
          <span class="label">余额</span>
          <span class="value balance">¥{vip.balance.toFixed(2)}</span>
        </div>
        <div class="info-item">
          <span class="label">注册时间</span>
          <span class="value">{new Date(vip.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div class="tabs">
        <button
          class={activeTab === 'info' ? 'active' : ''}
          on:click={() => activeTab = 'info'}
        >
          会员信息
        </button>
        <button
          class={activeTab === 'recharge' ? 'active' : ''}
          on:click={() => activeTab = 'recharge'}
        >
          充值
        </button>
        <button
          class={activeTab === 'consume' ? 'active' : ''}
          on:click={() => activeTab = 'consume'}
        >
          消费
        </button>
      </div>

      <div class="tab-content">
        {#if activeTab === 'info'}
          <div class="tab-info">
            <h3>会员详情</h3>
            <p>查看该会员的详细信息、交易记录等。</p>
            <div class="actions">
              <button
                class="action-button recharge"
                on:click={() => activeTab = 'recharge'}
              >
                充值
              </button>
              <button
                class="action-button consume"
                on:click={() => activeTab = 'consume'}
              >
                消费
              </button>
            </div>
          </div>
        {:else if activeTab === 'recharge'}
          <div class="tab-recharge">
            <h3>会员充值</h3>
            <div class="form-group">
              <label for="amount">充值金额</label>
              <input
                type="number"
                id="amount"
                bind:value={rechargeAmount}
                placeholder="请输入充值金额"
                min="0"
                step="1"
              />
            </div>

            <div class="form-group">
              <label for="technician">选择技师（可选）</label>
              <select
                id="technician"
                bind:value={selectedTechnician}
              >
                <option value="">请选择技师</option>
                {#each technicians as technician}
                  <option value={technician._id}>{technician.name}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label for="notes">备注</label>
              <textarea
                id="notes"
                bind:value={rechargeNote}
                placeholder="可选备注信息"
              ></textarea>
            </div>

            <button
              class="submit-button"
              on:click={handleRecharge}
              disabled={!rechargeAmount || parseFloat(rechargeAmount) <= 0}
            >
              确认充值
            </button>
          </div>
        {:else if activeTab === 'consume'}
          <div class="tab-consume">
            <h3>消费服务</h3>

            {#if projects.length === 0}
              <div class="no-projects">
                <p>暂无可用项目</p>
                <a href="/projects/new" class="button">添加项目</a>
              </div>
            {:else}
              <div class="project-selection">
                <h4>选择项目</h4>
                <div class="projects-grid">
                  {#each projects as project}
                    {#if project.isActive}
                      <div class="project-card" on:click={() => addProject(project)}>
                        <div class="project-name">{project.name}</div>
                        <div class="project-price">¥{project.price.toFixed(2)}</div>
                        <div class="project-time">{project.duration}分钟</div>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>

              <div class="selected-projects">
                <h4>已选项目</h4>
                <table class="selected-table">
                  <thead>
                    <tr>
                      <th>项目名称</th>
                      <th>单价</th>
                      <th>数量</th>
                      <th>金额</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#if selectedProjects.length === 0}
                      <tr>
                        <td colspan="5" class="empty-selection">请选择消费项目</td>
                      </tr>
                    {:else}
                      {#each selectedProjects as project, index}
                        <tr>
                          <td>{project.name}</td>
                          <td>¥{project.price.toFixed(2)}</td>
                          <td>
                            <div class="quantity-control">
                              <button on:click={() => changeQuantity(index, project.quantity - 1)}>-</button>
                              <span>{project.quantity}</span>
                              <button on:click={() => changeQuantity(index, project.quantity + 1)}>+</button>
                            </div>
                          </td>
                          <td>¥{(project.price * project.quantity).toFixed(2)}</td>
                          <td>
                            <button class="remove-button" on:click={() => removeProject(index)}>删除</button>
                          </td>
                        </tr>
                      {/each}
                    {/if}
                    <tr class="total-row">
                      <td colspan="3" class="total-label">总计</td>
                      <td colspan="2" class="total-amount">¥{calculateTotal().toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="technician-selection">
                <h4>选择技师</h4>
                <select bind:value={selectedTechnician}>
                  <option value="">请选择技师</option>
                  {#each technicians as technician}
                    {#if technician.isActive}
                      <option value={technician._id}>{technician.name} ({technician.code})</option>
                    {/if}
                  {/each}
                </select>
              </div>

              <div class="notes">
                <h4>备注</h4>
                <textarea bind:value={consumptionNote} placeholder="可选备注信息"></textarea>
              </div>

              <div class="balance-check">
                <p>
                  当前余额: <span class="balance">¥{vip.balance.toFixed(2)}</span> |
                  消费金额: <span class="consume">¥{calculateTotal().toFixed(2)}</span> |
                  消费后余额: <span class={vip.balance - calculateTotal() < 0 ? 'negative' : 'positive'}>
                    ¥{(vip.balance - calculateTotal()).toFixed(2)}
                  </span>
                </p>

                {#if vip.balance < calculateTotal()}
                  <p class="warning">余额不足，请先充值</p>
                {/if}
              </div>

              <button
                class="submit-button"
                on:click={handleConsume}
                disabled={selectedProjects.length === 0 || vip.balance < calculateTotal() || !selectedTechnician}
              >
                确认消费
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="not-found">
      <p>未找到VIP会员信息</p>
      <a href="/vip" class="button">返回列表</a>
    </div>
  {/if}
</div>

<style>
  .vip-detail {
    max-width: 1000px;
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
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 2rem 0;
  }

  .error {
    background-color: #ffebee;
    color: #c62828;
  }

  .vip-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .vip-info {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    background-color: #f5f5f5;
  }

  .info-item {
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

  .balance {
    color: #4CAF50;
    font-weight: bold;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid #ddd;
  }

  .tabs button {
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 1rem;
  }

  .tabs button.active {
    border-bottom-color: #2196F3;
    color: #2196F3;
    font-weight: 500;
  }

  .tab-content {
    padding: 1.5rem;
  }

  .tab-info, .tab-recharge, .tab-consume {
    min-height: 300px;
  }

  .actions {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
  }

  .action-button {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    color: white;
  }

  .action-button.recharge {
    background-color: #4CAF50;
  }

  .action-button.consume {
    background-color: #FF9800;
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
    height: 100px;
    resize: vertical;
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
    margin-top: 1.5rem;
  }

  .submit-button:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .project-card {
    background-color: #f5f5f5;
    border-radius: 6px;
    padding: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .project-card:hover {
    background-color: #e3f2fd;
  }

  .project-name {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .project-price {
    color: #F44336;
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .selected-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
  }

  .selected-table th, .selected-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  .selected-table th {
    background-color: #f5f5f5;
    font-weight: 500;
  }

  .empty-selection {
    text-align: center;
    color: #666;
    padding: 1rem !important;
  }

  .quantity-control {
    display: flex;
    align-items: center;
  }

  .quantity-control button {
    width: 30px;
    height: 30px;
    border: 1px solid #ddd;
    background-color: #f5f5f5;
    cursor: pointer;
  }

  .quantity-control span {
    margin: 0 0.5rem;
    min-width: 20px;
    text-align: center;
  }

  .remove-button {
    background-color: #F44336;
    color: white;
    border: none;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .total-row {
    font-weight: bold;
  }

  .total-label {
    text-align: right;
  }

  .total-amount {
    color: #F44336;
    font-size: 1.1rem;
  }

  .balance-check {
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 6px;
  }

  .balance-check p {
    margin: 0.5rem 0;
  }

  .positive {
    color: #4CAF50;
  }

  .negative {
    color: #F44336;
  }

  .warning {
    color: #F44336;
    font-weight: bold;
  }
</style>
