<script>
  import { onMount } from 'svelte';
  
  let rmbAmount = '';
  let usdtAmount = '';
  let exchangeRate = 0;
  let loading = true;
  let error = null;
  let feePercentage = 1; // 1% 手续费
  let lastUpdated = ''; // 最后更新时间
  let copySuccess = false; // 复制成功提示
  
  // USDT收款地址
  const usdtAddress = '0x49531Cc0347E6C531D99A2DA95936362dB509599';
  
  const API_URL = 'https://v6.exchangerate-api.com/v6/8d55aad72d9db99c3bb8e490/latest/USD';
  const CACHE_KEY = 'exchange_rate_cache';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时（毫秒）
  
  // 获取实时汇率
  async function fetchExchangeRate() {
    try {
      loading = true;
      
      // 尝试从缓存获取数据
      const cachedData = getCachedData();
      
      if (cachedData) {
        // 使用缓存数据
        console.log('使用缓存的汇率数据');
        exchangeRate = cachedData.rate;
        lastUpdated = cachedData.timestamp;
        loading = false;
        return;
      }
      
      // 缓存不存在或已过期，从API获取新数据
      console.log('从API获取新汇率数据');
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result !== 'success') {
        throw new Error('获取汇率失败');
      }
      
      // 获取人民币汇率（USD兑CNY）
      const cnyRate = data.conversion_rates.CNY;
      exchangeRate = cnyRate;
      
      // 保存到缓存
      const now = new Date();
      lastUpdated = now.toLocaleString();
      cacheData({
        rate: cnyRate,
        timestamp: lastUpdated,
        expires: now.getTime() + CACHE_DURATION
      });
      
      loading = false;
    } catch (err) {
      console.error('获取汇率失败:', err);
      error = '获取汇率失败，请刷新页面重试';
      loading = false;
    }
  }
  
  // 缓存数据到localStorage
  function cacheData(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('缓存汇率数据失败:', err);
    }
  }
  
  // 从localStorage获取缓存数据
  function getCachedData() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      
      if (!cached) {
        return null;
      }
      
      const data = JSON.parse(cached);
      const now = new Date().getTime();
      
      // 检查缓存是否过期
      if (now > data.expires) {
        console.log('汇率缓存已过期');
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('读取缓存数据失败:', err);
      return null;
    }
  }
  
  // 计算换算结果 (包含手续费)
  function calculateUSDT() {
    if (!rmbAmount || isNaN(parseFloat(rmbAmount)) || parseFloat(rmbAmount) <= 0) {
      usdtAmount = '';
      return;
    }
    
    const rmb = parseFloat(rmbAmount);
    // 计算需要额外加收的手续费金额
    const feeAmount = rmb * (feePercentage / 100);
    // 加上手续费后的总金额
    const totalRmb = rmb + feeAmount;
    // 计算最终USDT金额
    const finalUsdt = rmb / exchangeRate;
    
    // 格式化为四位小数
    usdtAmount = finalUsdt.toFixed(4);
  }
  
  function handleSubmit() {
    calculateUSDT();
  }
  
  // 手动刷新汇率数据
  async function refreshRate() {
    // 清除缓存
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (err) {
      console.error('清除缓存失败:', err);
    }
    
    // 重新获取汇率
    await fetchExchangeRate();
  }
  
  // 复制USDT地址到剪贴板
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(usdtAddress);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('复制地址失败:', err);
      alert('复制地址失败，请手动复制');
    }
  }
  
  onMount(() => {
    fetchExchangeRate();
  });
</script>

<div class="converter-page">
  <div class="header">
    <h1>RMB 到 USDT 汇率换算</h1>
  </div>
  
  {#if loading}
    <div class="loading">获取当前汇率中...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => fetchExchangeRate()}>重试</button>
    </div>
  {:else}
    <div class="converter-card">
      <div class="rate-info">
        <div class="rate-header">
          <div>
            <p>当前汇率: 1 USDT = {exchangeRate.toFixed(2)} RMB</p>
            <p>手续费: {feePercentage}%</p>
            {#if lastUpdated}
              <p class="update-time">最后更新: {lastUpdated}</p>
            {/if}
          </div>
          <button class="refresh-button" on:click={refreshRate}>
            刷新汇率
          </button>
        </div>
      </div>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="rmb-amount">输入人民币金额 (RMB)</label>
          <input
            type="number"
            id="rmb-amount"
            bind:value={rmbAmount}
            placeholder="请输入RMB金额"
            step="0.01"
            min="0"
            required
            on:input={calculateUSDT}
          />
        </div>
        
        <div class="form-group result">
          <label>USDT 金额 (收取{feePercentage}%手续费)</label>
          <div class="result-value">
            {#if usdtAmount}
              <span class="value">{usdtAmount}</span>
              <span class="unit">USDT</span>
            {:else}
              <span class="placeholder">输入RMB金额计算结果</span>
            {/if}
          </div>
        </div>
        
        <button type="submit" class="calculate-button">计算</button>
      </form>
      
      {#if usdtAmount}
        <div class="calculation-details">
          <h3>计算明细:</h3>
          <div class="detail-item">
            <span class="label">基础RMB金额</span>
            <span class="value">{parseFloat(rmbAmount).toFixed(2)} RMB</span>
          </div>
          <div class="detail-item">
            <span class="label">手续费 ({feePercentage}%)</span>
            <span class="value">+{(parseFloat(rmbAmount) * (feePercentage / 100)).toFixed(2)} RMB</span>
          </div>
          <div class="detail-item">
            <span class="label">应收总金额</span>
            <span class="value">{(parseFloat(rmbAmount) * (1 + feePercentage / 100)).toFixed(2)} RMB</span>
          </div>
          <div class="detail-item">
            <span class="label">兑换率 (1 USDT = {exchangeRate.toFixed(2)} RMB)</span>
            <span class="value">{(parseFloat(rmbAmount) / exchangeRate).toFixed(4)} USDT</span>
          </div>
          <div class="detail-item total">
            <span class="label">最终应收USDT</span>
            <span class="value">{usdtAmount} USDT</span>
          </div>
        </div>
      {/if}
      
      <!-- USDT收款信息 -->
      <div class="payment-section">
        <h3>USDT收款信息</h3>
        <div class="payment-info">
          <div class="qr-code">
            <img src="/code.png" alt="USDT收款码" />
            <p>扫描二维码付款</p>
          </div>
          <div class="address-info">
            <h4>USDT地址 (ERC20网络)</h4>
            <div class="address-container">
              <div class="address">{usdtAddress}</div>
              <button class="copy-button" on:click={copyAddress}>
                {copySuccess ? '已复制' : '复制'}
              </button>
            </div>
            <div class="instructions">
              <p>请确保通过ERC20网络转账USDT</p>
              <p>转账成功后，请保留交易哈希值作为凭证</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="note">
    <p>注意: 汇率数据每日更新一次，实际交易时可能会有轻微波动。</p>
    <p>数据来源: <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a></p>
  </div>
</div>

<style>
  .converter-page {
    max-width: 800px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 1.5rem;
  }

  .loading, .error {
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

  .converter-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .rate-info {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
  }
  
  .rate-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rate-info p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }
  
  .update-time {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }
  
  .refresh-button {
    padding: 0.5rem 1rem;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
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

  .result {
    background-color: #e3f2fd;
    padding: 1rem;
    border-radius: 6px;
  }

  .result-value {
    font-size: 1.5rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }

  .value {
    color: #2196F3;
  }

  .unit {
    margin-left: 0.5rem;
    color: #666;
  }

  .placeholder {
    color: #999;
    font-size: 1.1rem;
    font-style: italic;
  }

  .calculate-button {
    display: block;
    width: 100%;
    padding: 1rem;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    margin-top: 1.5rem;
  }

  .calculation-details {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #ddd;
  }

  .calculation-details h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .detail-item:nth-child(even) {
    background-color: #f9f9f9;
  }

  .detail-item.total {
    margin-top: 1rem;
    font-weight: 700;
    font-size: 1.1rem;
    border-top: 1px dashed #ddd;
    padding-top: 1rem;
  }
  
  /* USDT收款信息样式 */
  .payment-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #ddd;
  }
  
  .payment-info {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-top: 1rem;
  }
  
  .qr-code {
    flex: 0 0 200px;
    text-align: center;
  }
  
  .qr-code img {
    width: 200px;
    height: 200px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0.5rem;
    background-color: white;
  }
  
  .qr-code p {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }
  
  .address-info {
    flex: 1;
    min-width: 300px;
  }
  
  .address-info h4 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  .address-container {
    display: flex;
    background-color: #f5f5f5;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    align-items: center;
  }
  
  .address {
    flex: 1;
    word-break: break-all;
    font-family: monospace;
    font-size: 0.9rem;
  }
  
  .copy-button {
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    margin-left: 0.5rem;
    cursor: pointer;
    white-space: nowrap;
  }
  
  .instructions {
    background-color: #fff8e1;
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid #ffc107;
  }
  
  .instructions p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }

  .note {
    margin-top: 1.5rem;
    color: #666;
    font-size: 0.9rem;
    font-style: italic;
  }
  
  .note a {
    color: #2196F3;
    text-decoration: none;
  }
  
  .note a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 600px) {
    .payment-info {
      flex-direction: column;
      align-items: center;
    }
    
    .qr-code, .address-info {
      width: 100%;
    }
  }
</style> 