<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { vipApi, projectApi, technicianApi, reportApi } from '$lib/api';

  let vip = null;
  let projects = [];
  let technicians = [];
  let rechargeAmount = '';
  let rechargeNote = '';
  let selectedProjects = [];
  let selectedTechnician = '';
  let consumptionNote = '';
  let customAmount = '';
  let loading = true;
  let pageError = null;  // 页面加载错误
  let rechargeMessage = null;  // 充值操作消息
  let activeTab = 'info'; // 'info', 'recharge', 'consume'
  let amount = '';
  let bonusAmount = '';
  let technicianId = '';
  let notes = '';
  let txnHistory = [];

  onMount(async () => {
    try {
      const id = $page.params.id;
      // Check if there's a tab parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['info', 'recharge', 'consume', 'history'].includes(tabParam)) {
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

      // 载入交易历史（该会员）
      try {
        const historyRes = await reportApi.getTransactions({ vipId: id });
        txnHistory = historyRes.data || historyRes; // axios 返回 data
      } catch (e) {
        console.warn('加载交易历史失败:', e?.message || e);
        txnHistory = [];
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      pageError = err.message || '加载数据失败';
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
    const projectsTotal = selectedProjects.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    const customTotal = customAmount ? parseFloat(customAmount) || 0 : 0;
    
    // 只对项目金额应用折扣，自定义金额不折扣
    const discount = vip ? vip.discount || 1.0 : 1.0;
    const discountedProjectsTotal = projectsTotal * discount;
    
    return discountedProjectsTotal + customTotal;
  }

  function calculateSubtotal() {
    const projectsTotal = selectedProjects.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    const customTotal = customAmount ? parseFloat(customAmount) || 0 : 0;
    return projectsTotal + customTotal;
  }

  function calculateProjectsSubtotal() {
    return selectedProjects.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }

  function calculateDiscountedProjectsTotal() {
    const projectsTotal = calculateProjectsSubtotal();
    const discount = vip ? vip.discount || 1.0 : 1.0;
    return projectsTotal * discount;
  }

  async function handleRecharge() {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      rechargeMessage = { type: 'error', message: '请输入有效的充值金额' };
      return;
    }

    loading = true;
    rechargeMessage = null;

    try {
      const response = await vipApi.rechargeVip($page.params.id, {
        amount: parseFloat(amount),
        bonusAmount: bonusAmount ? parseFloat(bonusAmount) : 0,
        technicianId: technicianId || null,
        notes
      });

      // 更新本地VIP数据
      vip = response.data.vip;
      // 更新历史
      if (response.data.transaction) {
        txnHistory = [response.data.transaction, ...txnHistory];
      }
      // 清空表单
      amount = '';
      bonusAmount = '';
      technicianId = '';
      notes = '';
      // 显示成功消息
      rechargeMessage = { type: 'success', message: '充值成功' };
    } catch (err) {
      console.error('充值失败:', err);
      rechargeMessage = { type: 'error', message: err.response?.data?.message || '充值失败' };
    } finally {
      loading = false;
    }
  }

  async function handleConsume() {
    if (selectedProjects.length === 0 && (!customAmount || parseFloat(customAmount) <= 0)) {
      alert('请选择消费项目或输入自定义金额');
      return;
    }

    if (calculateTotal() <= 0) {
      alert('总消费金额必须大于0');
      return;
    }

    if (calculateTotal() > vip.balance) {
      alert('余额不足');
      return;
    }

    try {
      const result = await vipApi.consume(vip._id, {
        projects: selectedProjects,
        customAmount: customAmount ? parseFloat(customAmount) : 0,
        technicianId: selectedTechnician || null,
        notes: consumptionNote,
        originalAmount: calculateProjectsSubtotal(), // 项目原价
        discountedAmount: calculateDiscountedProjectsTotal(), // 项目折扣后价格
        finalAmount: calculateTotal() // 总消费金额（项目折扣后 + 自定义金额）
      });

      alert('消费成功');
      vip = result.data.vip;
      if (result.data.transaction) {
        txnHistory = [result.data.transaction, ...txnHistory];
      }
      selectedProjects = [];
      selectedTechnician = '';
      consumptionNote = '';
      customAmount = '';
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
  {:else if pageError}
    <div class="error">
      <p>{pageError}</p>
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
          <span class="label">会员折扣</span>
          <span class="value discount">{vip.discount ? `${(vip.discount * 10).toFixed(1)}折` : '原价'}</span>
        </div>
        <div class="info-item">
          <span class="label">注册时间</span>
          <span class="value">{new Date(vip.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div class="tabs">
        <button
          class="tab-button {activeTab === 'info' ? 'active' : ''}"
          on:click={() => activeTab = 'info'}
        >
          会员信息
        </button>
        <button
          class="tab-button {activeTab === 'recharge' ? 'active' : ''}"
          on:click={() => activeTab = 'recharge'}
        >
          充值
        </button>
        <button
          class="tab-button {activeTab === 'consume' ? 'active' : ''}"
          on:click={() => activeTab = 'consume'}
        >
          消费
        </button>
        <button
          class="tab-button {activeTab === 'history' ? 'active' : ''}"
          on:click={() => activeTab = 'history'}
        >
          记录
        </button>
      </div>

      <div class="tab-content">
        {#if activeTab === 'info'}
          <div class="tab-info">
            <h3>会员详情</h3>
            <p>查看该会员的详细信息。</p>
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
              <button
                class="action-button"
                on:click={() => activeTab = 'history'}
              >
                查看记录
              </button>
            </div>
          </div>
        {:else if activeTab === 'recharge'}
          <div class="tab-recharge">
            <h3>会员充值</h3>
            {#if rechargeMessage}
              <div class="message {rechargeMessage.type}">
                {rechargeMessage.message}
              </div>
            {/if}
            <form class="recharge-form" on:submit|preventDefault={handleRecharge}>
              <div class="form-group">
                <label for="amount">充值金额</label>
                <input
                  type="number"
                  id="amount"
                  bind:value={amount}
                  placeholder="请输入充值金额"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="form-group">
                <label for="bonusAmount">赠送金额</label>
                <input
                  type="number"
                  id="bonusAmount"
                  bind:value={bonusAmount}
                  placeholder="请输入赠送金额"
                  min="0"
                  step="0.01"
                />
              </div>

              <div class="form-group">
                <label for="technician">技师</label>
                <select id="technician" bind:value={technicianId}>
                  <option value="">请选择技师</option>
                  {#each technicians as tech}
                    <option value={tech._id}>{tech.name}</option>
                  {/each}
                </select>
              </div>

              <div class="form-group">
                <label for="notes">备注</label>
                <input
                  type="text"
                  id="notes"
                  bind:value={notes}
                  placeholder="请输入备注"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? '充值中...' : '确认充值'}
              </button>
            </form>
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

              <div class="custom-amount">
                <h4>自定义金额</h4>
                <div class="form-group">
                  <input
                    type="number"
                    bind:value={customAmount}
                    placeholder="请输入自定义金额（可选）"
                    min="0"
                    step="0.01"
                  />
                  <small>如果消费项目不在列表中，可以在这里输入自定义金额</small>
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
                <h4>选择技师（可选）</h4>
                <select bind:value={selectedTechnician}>
                  <option value="">请选择技师（可选）</option>
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
                  当前余额: <span class="balance">¥{vip.balance.toFixed(2)}</span>
                </p>
                {#if selectedProjects.length > 0}
                  <p>
                    项目原价: <span class="original-price">¥{calculateProjectsSubtotal().toFixed(2)}</span> |
                    项目折扣: <span class="discount">{vip.discount ? `${(vip.discount * 10).toFixed(1)}折` : '原价'}</span> |
                    项目实付: <span class="discounted-price">¥{calculateDiscountedProjectsTotal().toFixed(2)}</span>
                  </p>
                {/if}
                {#if customAmount && parseFloat(customAmount) > 0}
                  <p>
                    自定义金额: <span class="custom-amount">¥{parseFloat(customAmount).toFixed(2)}</span> <small>(不参与折扣)</small>
                  </p>
                {/if}
                <p>
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
                disabled={(selectedProjects.length === 0 && (!customAmount || parseFloat(customAmount) <= 0)) || vip.balance < calculateTotal() || calculateTotal() <= 0}
              >
                确认消费
              </button>
            {/if}
          </div>
        {:else if activeTab === 'history'}
          <div class="tab-history">
            <h3>交易记录</h3>
            {#if txnHistory.length === 0}
              <div class="empty-history">暂无交易记录</div>
            {:else}
              <table class="history-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>类型</th>
                    <th>金额</th>
                    <th>项目</th>
                    <th>技师</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {#each txnHistory as t}
                    <tr>
                      <td>{new Date(t.date).toLocaleString()}</td>
                      <td>{t.type === 'recharge' ? '充值' : '消费'}</td>
                      <td>¥{(t.amount || 0).toFixed(2)}</td>
                      <td>
                        {#if t.projects && t.projects.length}
                          {t.projects.map(p => p.project?.name || '').filter(Boolean).join('、')}
                        {:else}
                          -
                        {/if}
                      </td>
                      <td>{t.technician?.name || '-'}</td>
                      <td>{t.notes || '-'}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
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
    background-color: #f5f5f5;
    padding: 0 1rem;
  }

  .tab-button {
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 1rem;
    color: #666;
    transition: all 0.2s ease;
  }

  .tab-button:hover {
    color: #2196F3;
  }

  .tab-button.active {
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

  /* History tab styles */
  .tab-history {
    min-height: 300px;
  }

  .history-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .history-table thead {
    background: #f7f9fc;
  }

  .history-table th, .history-table td {
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid #eee;
    font-size: 0.95rem;
    color: #333;
  }

  .history-table th {
    font-weight: 600;
    color: #455a64;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }

  .history-table tbody tr:hover {
    background: #fafbff;
  }

  .history-table tbody tr:last-child td {
    border-bottom: none;
  }

  .tab-history h3 {
    margin: 0 0 1rem 0;
  }

  .empty-history {
    padding: 1rem;
    text-align: center;
    color: #78909c;
    background: #f7f9fc;
    border: 1px dashed #cfd8dc;
    border-radius: 8px;
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

  .original-price {
    color: #666;
    text-decoration: line-through;
  }

  .discount {
    color: #FF9800;
    font-weight: bold;
  }

  .discounted-price {
    color: #4CAF50;
    font-weight: bold;
  }

  .custom-amount {
    color: #2196F3;
    font-weight: bold;
  }

  .warning {
    color: #F44336;
    font-weight: bold;
  }

  .recharge-form {
    display: grid;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 500;
    color: #333;
  }

  .form-group input,
  .form-group select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }

  button {
    padding: 0.75rem;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  button:hover {
    background-color: #1976D2;
  }

  button:disabled {
    background-color: #BDBDBD;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .recharge-form {
      width: 100%;
    }
  }

  .message {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .message.success {
    background-color: #E8F5E9;
    color: #2E7D32;
    border: 1px solid #C8E6C9;
  }

  .message.error {
    background-color: #FFEBEE;
    color: #C62828;
    border: 1px solid #FFCDD2;
  }

  .message::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .message.success::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232E7D32'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
  }

  .message.error::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23C62828'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
  }

  .custom-amount {
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 6px;
  }

  .custom-amount h4 {
    margin: 0 0 0.75rem 0;
    color: #333;
  }

  .custom-amount .form-group {
    margin-bottom: 0;
  }

  .custom-amount small {
    display: block;
    color: #666;
    margin-top: 0.25rem;
    font-size: 0.85rem;
  }
</style>
  
