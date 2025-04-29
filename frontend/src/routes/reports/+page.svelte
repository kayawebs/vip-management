<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import { reportApi } from '$lib/api';

  // Define interfaces for data structures (adjust based on actual API response)
  interface Transaction {
    _id: string;
    date: string;
    amount: number;
    notes?: string;
    vip?: { _id: string; name: string; };
    projects?: { project: { name: string }; quantity: number }[];
    technician?: { _id: string; name: string; code?: string };
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
  let searchPhone = ''; // Add search phone state
  let searchDebounceTimer: number;

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
  let posSummary: PlatformSummary = {
    totalRevenue: 0,
    totalHours: 0,
  };

  let rechargeData: Transaction[] = []; // Type rechargeData
  let consumptionData: Transaction[] = []; // Type consumptionData

  // 加载总览数据 (Now fetches real data)
  async function loadOverviewData() {
    loading = true;
    error = null;
    // Reset summaries before loading new data
    vipSummary = { totalRecharge: 0, totalConsumption: 0, newMembers: 0, activeMembers: 0 };
    douyinSummary = { totalRevenue: 0, totalHours: 0 };
    meituanSummary = { totalRevenue: 0, totalHours: 0 };
    cashSummary = { totalRevenue: 0, totalHours: 0 };
    posSummary = { totalRevenue: 0, totalHours: 0 };

    try {
      const params = { startDate, endDate };

      // Fetch all summary data concurrently
      const [vipRes, douyinRes, meituanRes, cashRes, posRes] = await Promise.all([
        reportApi.getVipSummary(params),
        reportApi.getPlatformSummary({ ...params, platform: 'douyin' }),
        reportApi.getPlatformSummary({ ...params, platform: 'meituan' }),
        reportApi.getCashSummary(params),
        reportApi.getPlatformSummary({ ...params, platform: 'pos' })
      ]);

      // Extract data from Axios responses
      vipSummary = vipRes.data; 
      douyinSummary = douyinRes.data;
      meituanSummary = meituanRes.data;
      cashSummary = cashRes.data;
      posSummary = posRes.data;

    } catch (err: unknown) {
      console.error('加载报表概览数据失败:', err);
      error = err instanceof Error ? err.message : '加载报表概览数据失败';
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
        endDate,
        phone: searchPhone // Add phone search parameter
      };

      // Call recharge report endpoint and extract transactions
      const response = await reportApi.getRechargeReport(params);
      rechargeData = response.data.transactions || [];
    } catch (err: unknown) {
      console.error('加载充值报表失败:', err);
      error = err instanceof Error ? err.message : '加载充值报表失败';
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
        endDate,
        phone: searchPhone // Add phone search parameter
      };

      // Call consumption report endpoint and extract transactions
      const response = await reportApi.getConsumptionReport(params);
      consumptionData = response.data.transactions || [];
    } catch (err: unknown) {
      console.error('加载消费报表失败:', err);
      error = err instanceof Error ? err.message : '加载消费报表失败';
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
  let debounceTimer: number;
  $: {
    // 确保日期范围有效
    if (new Date(startDate) > new Date(endDate)) {
      endDate = startDate;
    }

    // 使用防抖来避免频繁加载
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (startDate && endDate) {
        loadCurrentTabData();
      }
    }, 300);
  }

  // 监听标签页变化
  let lastActiveTab = activeTab;
  $: {
    if (activeTab && activeTab !== lastActiveTab) {
      lastActiveTab = activeTab;
      loadCurrentTabData();
    }
  }

  // 处理搜索按钮点击
  function handleSearch() {
    if (startDate && endDate) {
      loadCurrentTabData();
    }
  }

  // 初始加载
  onMount(() => {
    loadCurrentTabData();
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
    <div class="search-input">
      <label for="searchPhone">手机号搜索:</label>
      <input
        type="text"
        id="searchPhone"
        bind:value={searchPhone}
        placeholder="输入会员手机号"
      />
      <button class="search-button" on:click={handleSearch}>
        搜索
      </button>
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
            <div class="stat-title">新增会员</div>
            <div class="stat-value">{vipSummary.newMembers}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">活跃会员</div>
            <div class="stat-value">{vipSummary.activeMembers}</div>
          </div>
        </div>

        <div class="platform-stats">
          <div class="platform-card">
            <h3>抖音</h3>
            <div class="platform-stat">
              <span class="label">营业额：</span>
              <span class="value">¥{douyinSummary.totalRevenue.toFixed(2)}</span>
            </div>
            <div class="platform-stat">
              <span class="label">服务钟数：</span>
              <span class="value">{douyinSummary.totalHours}</span>
            </div>
          </div>

          <div class="platform-card">
            <h3>美团</h3>
            <div class="platform-stat">
              <span class="label">营业额：</span>
              <span class="value">¥{meituanSummary.totalRevenue.toFixed(2)}</span>
            </div>
            <div class="platform-stat">
              <span class="label">服务钟数：</span>
              <span class="value">{meituanSummary.totalHours}</span>
            </div>
          </div>

          <div class="platform-card">
            <h3>现金</h3>
            <div class="platform-stat">
              <span class="label">营业额：</span>
              <span class="value">¥{cashSummary.totalRevenue.toFixed(2)}</span>
            </div>
            <div class="platform-stat">
              <span class="label">服务钟数：</span>
              <span class="value">{cashSummary.totalHours}</span>
            </div>
          </div>

          <div class="platform-card">
            <h3>POS</h3>
            <div class="platform-stat">
              <span class="label">营业额：</span>
              <span class="value">¥{posSummary.totalRevenue.toFixed(2)}</span>
            </div>
            <div class="platform-stat">
              <span class="label">服务钟数：</span>
              <span class="value">{posSummary.totalHours}</span>
            </div>
          </div>
        </div>
      </div>
    {:else if activeTab === 'recharge'}
      <div class="recharge-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>会员</th>
              <th>技师</th>
              <th>金额</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            {#if rechargeData.length === 0}
              <tr>
                <td colspan="5" class="empty-data">暂无充值记录</td>
              </tr>
            {:else}
              {#each rechargeData as transaction}
                <tr>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.vip?.name || '未知会员'}</td>
                  <td>{transaction.technician?.name || '-'}</td>
                  <td class="amount positive">¥{transaction.amount.toFixed(2)}</td>
                  <td>{transaction.notes || '-'}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    {:else if activeTab === 'consumption'}
      <div class="consumption-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>会员</th>
              <th>技师</th>
              <th>项目</th>
              <th>金额</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            {#if consumptionData.length === 0}
              <tr>
                <td colspan="6" class="empty-data">暂无消费记录</td>
              </tr>
            {:else}
              {#each consumptionData as transaction}
                <tr>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.vip?.name || '未知会员'}</td>
                  <td>{transaction.technician?.name || '-'}</td>
                  <td>
                    {#if transaction.projects && transaction.projects.length > 0}
                      {#each transaction.projects as item}
                        <div>{item.project.name} × {item.quantity}</div>
                      {/each}
                    {:else}
                      -
                    {/if}
                  </td>
                  <td class="amount negative">¥{transaction.amount.toFixed(2)}</td>
                  <td>{transaction.notes || '-'}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>

<style>
  .reports-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .header {
    margin-bottom: 1.5rem;
  }

  .tab-navigation {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .tab-button {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
    color: #666;
    transition: all 0.2s ease;
  }

  .tab-button:hover {
    color: #2196F3;
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
    gap: 0.5rem;
  }

  .date-input label {
    font-weight: 500;
    color: #333;
  }

  .date-input input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .loading, .error {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin: 1rem 0;
  }

  .error {
    color: #c62828;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 500;
  }

  .positive {
    color: #4CAF50;
  }

  .negative {
    color: #F44336;
  }

  .platform-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .platform-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .platform-card h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #333;
  }

  .platform-stat {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .platform-stat .label {
    color: #666;
  }

  .platform-stat .value {
    font-weight: 500;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .data-table th, .data-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  .data-table th {
    background-color: #f5f5f5;
    font-weight: 500;
    color: #333;
  }

  .data-table .amount {
    font-weight: 500;
  }

  .data-table .empty-data {
    text-align: center;
    color: #666;
    padding: 2rem !important;
  }

  .recharge-content, .consumption-content {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 1.5rem;
  }

  .search-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
  }

  .search-input label {
    font-weight: 500;
    color: #333;
    white-space: nowrap;
  }

  .search-input input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    min-width: 200px;
    transition: border-color 0.2s ease;
  }

  .search-input input:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }

  .search-button {
    padding: 0.5rem 1rem;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .search-button:hover {
    background-color: #1976D2;
  }

  .search-button:active {
    background-color: #1565C0;
  }

  @media (max-width: 768px) {
    .stats-row {
      grid-template-columns: 1fr;
    }

    .platform-stats {
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

    .data-table {
      display: block;
      overflow-x: auto;
    }

    .search-input {
      width: 100%;
      flex-wrap: wrap;
    }
    .search-input input {
      width: 100%;
    }
    .search-button {
      width: 100%;
      margin-top: 0.5rem;
    }
  }
</style>
