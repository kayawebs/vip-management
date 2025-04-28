<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import { reportApi } from '$lib/api';

  // Define interfaces for data structures (adjust based on actual API response)
  interface Transaction {
    _id: string; // Assuming MongoDB ID
    createdAt: string;
    amount: number;
    notes?: string;
    vip?: { _id: string; name: string; }; // Make optional if not always present
    projects?: { project: { name: string }; quantity: number }[];
    technician?: { name: string };
  }

  interface VipSummary {
    totalRecharge: number;
    totalConsumption: number;
    newMembers: number;
    activeMembers: number;
  }

  interface PlatformSummary {
    totalRevenue: number;
    totalHours: number;
    orderCount?: number; // Make optional or adjust name
    transactionCount?: number; // Make optional or adjust name
  }

  let activeTab = 'overview'; // 'overview', 'recharge', 'consumption'
  let startDate = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  let endDate = format(new Date(), 'yyyy-MM-dd');
  let loading = false;
  let error: string | null = null; // Explicitly type error

  // NEW: Data structures with types
  let vipSummary: VipSummary = {
    totalRecharge: 0,
    totalConsumption: 0,
    newMembers: 0,
    activeMembers: 0
  };
  let douyinSummary: PlatformSummary = {
    totalRevenue: 0,
    totalHours: 0,
    orderCount: 0,
  };
  let meituanSummary: PlatformSummary = {
    totalRevenue: 0,
    totalHours: 0,
    orderCount: 0,
  };
  let cashSummary: PlatformSummary = {
    totalRevenue: 0,
    totalHours: 0,
    transactionCount: 0,
  };

  let rechargeData: Transaction[] = []; // Type rechargeData
  let consumptionData: Transaction[] = []; // Type consumptionData

  // 加载总览数据 (Now fetches real data)
  async function loadOverviewData() {
    loading = true;
    error = null;
    // Reset summaries before loading new data
    vipSummary = { totalRecharge: 0, totalConsumption: 0, newMembers: 0, activeMembers: 0 };
    douyinSummary = { totalRevenue: 0, totalHours: 0, orderCount: 0 };
    meituanSummary = { totalRevenue: 0, totalHours: 0, orderCount: 0 };
    cashSummary = { totalRevenue: 0, totalHours: 0, transactionCount: 0 };

    try {
      const params = { startDate, endDate };

      // Fetch all summary data concurrently
      const [vipRes, douyinRes, meituanRes, cashRes] = await Promise.all([
        reportApi.getVipSummary(params),
        reportApi.getPlatformSummary({ ...params, platform: 'douyin' }),
        reportApi.getPlatformSummary({ ...params, platform: 'meituan' }),
        reportApi.getCashSummary(params)
      ]);

      // Extract data from Axios responses
      vipSummary = vipRes.data; 
      douyinSummary = douyinRes.data;
      meituanSummary = meituanRes.data;
      cashSummary = cashRes.data;

    } catch (err: unknown) {
      console.error('加载报表概览数据失败:', err);
      error = err instanceof Error ? err.message : '加载报表概览数据失败';
      // Keep summaries reset/empty on error
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

      // Call recharge report endpoint and extract transactions
      const response = await reportApi.getRechargeReport(params);
      rechargeData = response.data.transactions || [];
    } catch (err: unknown) { // Type the catch error
      console.error('加载充值报表失败:', err);
      error = err instanceof Error ? err.message : '加载充值报表失败'; // Handle potential non-Error throws
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

      // Call consumption report endpoint and extract transactions
      const response = await reportApi.getConsumptionReport(params);
      consumptionData = response.data.transactions || [];
    } catch (err: unknown) { // Type the catch error
      console.error('加载消费报表失败:', err);
      error = err instanceof Error ? err.message : '加载消费报表失败'; // Handle potential non-Error throws
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
  function formatDate(dateString: string | Date): string { // Add type to parameter
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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
            <div class="stat-value positive">¥{vipSummary.totalRecharge.toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">消费总额</div>
            <div class="stat-value negative">¥{vipSummary.totalConsumption.toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">净收入</div>
            <div class="stat-value {vipSummary.totalRecharge - vipSummary.totalConsumption >= 0 ? 'positive' : 'negative'}">
              ¥{(vipSummary.totalRecharge - vipSummary.totalConsumption).toFixed(2)}
            </div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-title">新增会员数</div>
            <div class="stat-value">{vipSummary.newMembers}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">活跃会员数</div>
            <div class="stat-value">{vipSummary.activeMembers}</div>
          </div>
        </div>

        <div class="section">
          <h2>Douyin 数据</h2>
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-title">Douyin 收入</div>
              <div class="stat-value positive">¥{douyinSummary.totalRevenue.toFixed(2)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">Douyin 服务时长</div>
              <div class="stat-value">{douyinSummary.totalHours} 小时</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">Douyin 订单数</div>
              <div class="stat-value">{douyinSummary.orderCount}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Meituan 数据</h2>
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-title">Meituan 收入</div>
              <div class="stat-value positive">¥{meituanSummary.totalRevenue.toFixed(2)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">Meituan 服务时长</div>
              <div class="stat-value">{meituanSummary.totalHours} 小时</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">Meituan 订单数</div>
              <div class="stat-value">{meituanSummary.orderCount}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Cash 数据</h2>
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-title">Cash 收入</div>
              <div class="stat-value positive">¥{cashSummary.totalRevenue.toFixed(2)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">Cash 服务时长</div>
              <div class="stat-value">{cashSummary.totalHours} 小时</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">Cash 交易数</div>
              <div class="stat-value">{cashSummary.transactionCount}</div>
            </div>
          </div>
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
                    {#if transaction.vip}
                      <a href={`/vip/${transaction.vip._id}`}>{transaction.vip.name}</a>
                    {:else}
                      非会员
                    {/if}
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
                    {#if transaction.vip}
                      <a href={`/vip/${transaction.vip._id}`}>{transaction.vip.name}</a>
                    {:else}
                      非会员
                    {/if}
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
