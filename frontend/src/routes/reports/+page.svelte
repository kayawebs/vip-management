<script>
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import { reportApi } from '$lib/api';
  
  let activeTab = 'overview'; // 'overview', 'recharge', 'consumption'
  let startDate = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  let endDate = format(new Date(), 'yyyy-MM-dd');
  let loading = false;
  let error = null;
  
  // 报表数据
  let overviewData = {
    totalRecharge: 0,
    totalConsumption: 0,
    netIncome: 0,
    vipCount: 0,
    activeVipCount: 0,
    topProjects: []
  };
  
  let rechargeData = [];
  let consumptionData = [];
  
  // 加载总览数据
  async function loadOverviewData() {
    loading = true;
    error = null;
    
    try {
      const params = {
        startDate,
        endDate
      };
      
      const [rechargeReport, consumptionReport] = await Promise.all([
        reportApi.getRechargeReport(params),
        reportApi.getConsumptionReport(params)
      ]);
      
      overviewData = {
        totalRecharge: rechargeReport.total || 0,
        totalConsumption: consumptionReport.total || 0,
        netIncome: (rechargeReport.total || 0) - (consumptionReport.total || 0),
        vipCount: rechargeReport.vipCount || 0,
        activeVipCount: consumptionReport.vipCount || 0,
        topProjects: consumptionReport.topProjects || []
      };
    } catch (err) {
      console.error('加载报表数据失败:', err);
      error = err.message || '加载报表数据失败';
    } finally {
      loading = false;
    }
  }
  
  // 加载充值报表
  async function loadRechargeData() {
    loading = true;
    error = null;
    
    try {
      const params = {
        startDate,
        endDate
      };
      
      const data = await reportApi.getRechargeReport(params);
      rechargeData = data.transactions || [];
    } catch (err) {
      console.error('加载充值报表失败:', err);
      error = err.message || '加载充值报表失败';
    } finally {
      loading = false;
    }
  }
  
  // 加载消费报表
  async function loadConsumptionData() {
    loading = true;
    error = null;
    
    try {
      const params = {
        startDate,
        endDate
      };
      
      const data = await reportApi.getConsumptionReport(params);
      consumptionData = data.transactions || [];
    } catch (err) {
      console.error('加载消费报表失败:', err);
      error = err.message || '加载消费报表失败';
    } finally {
      loading = false;
    }
  }
  
  // 根据当前标签页加载数据
  function loadCurrentTabData() {
    if (activeTab === 'overview') {
      loadOverviewData();
    } else if (activeTab === 'recharge') {
      loadRechargeData();
    } else if (activeTab === 'consumption') {
      loadConsumptionData();
    }
  }
  
  // 格式化日期
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm');
  }
  
  // 监听日期变化
  $: {
    // 确保日期范围有效
    if (new Date(startDate) > new Date(endDate)) {
      endDate = startDate;
    }
    
    // 日期变化时重新加载数据
    if (startDate && endDate) {
      loadCurrentTabData();
    }
  }
  
  // 监听标签页变化
  $: {
    if (activeTab) {
      loadCurrentTabData();
    }
  }
  
  onMount(() => {
    loadOverviewData();
  });
</script>

<div class="reports-page">
  <div class="header">
    <h1>报表管理</h1>
  </div>
  
  <div class="tab-navigation">
    <button 
      class="tab-button {activeTab === 'overview' ? 'active' : ''}"
      on:click={() => activeTab = 'overview'}
    >
      经营概览
    </button>
    <button 
      class="tab-button {activeTab === 'recharge' ? 'active' : ''}"
      on:click={() => activeTab = 'recharge'}
    >
      充值记录
    </button>
    <button 
      class="tab-button {activeTab === 'consumption' ? 'active' : ''}"
      on:click={() => activeTab = 'consumption'}
    >
      消费记录
    </button>
  </div>
  
  <div class="date-filter">
    <div class="date-input">
      <label for="startDate">开始日期:</label>
      <input 
        type="date" 
        id="startDate" 
        bind:value={startDate}
      />
    </div>
    <div class="date-input">
      <label for="endDate">结束日期:</label>
      <input 
        type="date" 
        id="endDate" 
        bind:value={endDate}
      />
    </div>
  </div>
  
  {#if loading}
    <div class="loading">加载中...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={loadCurrentTabData}>重试</button>
    </div>
  {:else}
    {#if activeTab === 'overview'}
      <div class="overview-content">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-title">充值总额</div>
            <div class="stat-value positive">¥{overviewData.totalRecharge.toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">消费总额</div>
            <div class="stat-value negative">¥{overviewData.totalConsumption.toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">净收入</div>
            <div class="stat-value {overviewData.netIncome >= 0 ? 'positive' : 'negative'}">
              ¥{overviewData.netIncome.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-title">充值会员数</div>
            <div class="stat-value">{overviewData.vipCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">消费会员数</div>
            <div class="stat-value">{overviewData.activeVipCount}</div>
          </div>
        </div>
        
        <div class="section">
          <h2>热门项目</h2>
          {#if overviewData.topProjects && overviewData.topProjects.length > 0}
            <div class="top-projects">
              {#each overviewData.topProjects as project}
                <div class="project-card">
                  <div class="project-name">{project.name}</div>
                  <div class="project-count">销售数量: {project.count}</div>
                  <div class="project-amount">销售金额: ¥{project.amount.toFixed(2)}</div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="empty-message">暂无项目消费数据</p>
          {/if}
        </div>
      </div>
    {:else if activeTab === 'recharge'}
      <div class="transactions-content">
        {#if rechargeData.length === 0}
          <p class="empty-message">所选时间范围内无充值记录</p>
        {:else}
          <table class="transactions-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>会员</th>
                <th>金额</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {#each rechargeData as transaction}
                <tr>
                  <td>{formatDate(transaction.createdAt)}</td>
                  <td>
                    <a href={`/vip/${transaction.vip._id}`}>{transaction.vip.name}</a>
                  </td>
                  <td class="amount positive">¥{transaction.amount.toFixed(2)}</td>
                  <td>{transaction.notes || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    {:else if activeTab === 'consumption'}
      <div class="transactions-content">
        {#if consumptionData.length === 0}
          <p class="empty-message">所选时间范围内无消费记录</p>
        {:else}
          <table class="transactions-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>会员</th>
                <th>项目</th>
                <th>技师</th>
                <th>金额</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {#each consumptionData as transaction}
                <tr>
                  <td>{formatDate(transaction.createdAt)}</td>
                  <td>
                    <a href={`/vip/${transaction.vip._id}`}>{transaction.vip.name}</a>
                  </td>
                  <td>
                    {#if transaction.projects && transaction.projects.length > 0}
                      <ul class="project-list">
                        {#each transaction.projects as project}
                          <li>{project.project.name} × {project.quantity}</li>
                        {/each}
                      </ul>
                    {:else}
                      -
                    {/if}
                  </td>
                  <td>{transaction.technician ? transaction.technician.name : '-'}</td>
                  <td class="amount negative">¥{transaction.amount.toFixed(2)}</td>
                  <td>{transaction.notes || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .reports-page {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header {
    margin-bottom: 1.5rem;
  }
  
  .tab-navigation {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 1.5rem;
  }
  
  .tab-button {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .tab-button.active {
    border-bottom-color: #2196F3;
    color: #2196F3;
  }
  
  .date-filter {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .date-input {
    display: flex;
    align-items: center;
  }
  
  .date-input label {
    margin-right: 0.5rem;
    font-weight: 500;
  }
  
  .date-input input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .loading, .error {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-top: 1rem;
  }
  
  .error {
    color: #c62828;
  }
  
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .stat-title {
    font-size: 1rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    font-size: 1.75rem;
    font-weight: 500;
  }
  
  .positive {
    color: #4CAF50;
  }
  
  .negative {
    color: #F44336;
  }
  
  .section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 1.5rem;
  }
  
  .section h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  .top-projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .project-card {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 6px;
  }
  
  .project-name {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .project-count, .project-amount {
    font-size: 0.9rem;
    color: #666;
  }
  
  .empty-message {
    text-align: center;
    color: #666;
    padding: 2rem;
  }
  
  .transactions-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .transactions-table th, .transactions-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .transactions-table th {
    background-color: #f5f5f5;
    font-weight: 500;
  }
  
  .transactions-table a {
    color: #2196F3;
    text-decoration: none;
  }
  
  .transactions-table a:hover {
    text-decoration: underline;
  }
  
  .amount {
    font-weight: 500;
  }
  
  .project-list {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.9rem;
  }
  
  .project-list li {
    margin-bottom: 0.25rem;
  }
  
  @media (max-width: 768px) {
    .stats-row {
      grid-template-columns: 1fr;
    }
    
    .top-projects {
      grid-template-columns: 1fr;
    }
    
    .tab-navigation {
      flex-direction: column;
      border-bottom: none;
    }
    
    .tab-button {
      border: 1px solid #ddd;
      margin-bottom: 0.5rem;
      border-radius: 4px;
    }
    
    .tab-button.active {
      background-color: #2196F3;
      color: white;
      border-color: #2196F3;
    }
    
    .date-filter {
      flex-direction: column;
    }
    
    .transactions-table {
      display: block;
      overflow-x: auto;
    }
  }
</style> 