<script lang="ts">
  import { reportApi } from '$lib/api_bak'; // Import the API library
  import { format } from 'date-fns'; // For default date

  let reportDate = format(new Date(), 'yyyy-MM-dd'); // Add date selection
  let douyinHours: number | null = null;
  let douyinRevenue: number | null = null;
  let meituanHours: number | null = null;
  let meituanRevenue: number | null = null;
  let cashHours: number | null = null;
  let cashRevenue: number | null = null;
  let posHours: number | null = null;
  let posRevenue: number | null = null;

  let submitting = false;
  let submitError: string | null = null;
  let submitSuccess: string | null = null;

  async function handleSubmit() { // Make async
    submitError = null;
    submitSuccess = null;
    // Basic validation (can be enhanced)
    if (
      !reportDate ||
      douyinHours === null || douyinRevenue === null ||
      meituanHours === null || meituanRevenue === null ||
      cashHours === null || cashRevenue === null ||
      posHours === null || posRevenue === null
    ) {
      alert('请填写所有字段，包括日期');
      return;
    }

    const reportData = {
      date: reportDate,
      douyinHours,
      douyinRevenue,
      meituanHours,
      meituanRevenue,
      cashHours,
      cashRevenue,
      posHours,
      posRevenue
    };

    submitting = true;
    try {
      console.log('提交日报数据:', reportData);
      console.log(reportApi)
      await reportApi.createDailyReport(reportData);
      submitSuccess = `日期 ${reportDate} 的日报已成功提交/更新！`;
      alert(submitSuccess);

    } catch (err: any) {
       console.error('提交日报失败:', err);
       submitError = err.response?.data?.message || err.message || '提交失败，请检查网络或联系管理员';
       alert(`提交失败: ${submitError}`);
    } finally {
       submitting = false;
    }
  }
</script>

<div class="container">
  <h1>手动导入日报</h1>

  <form on:submit|preventDefault={handleSubmit} class="report-form">
    <div class="form-group date-group">
      <label for="report-date">报表日期:</label>
      <input type="date" id="report-date" bind:value={reportDate} required>
    </div>

    <h2>平台数据</h2>
    <div class="platform-section">
      <div class="platform">
        <h3>抖音</h3>
        <div class="form-group">
          <label for="douyin-hours">钟数:</label>
          <input type="number" id="douyin-hours" bind:value={douyinHours} placeholder="输入钟数" required>
        </div>
        <div class="form-group">
          <label for="douyin-revenue">收入总数 (元):</label>
          <input type="number" step="0.01" id="douyin-revenue" bind:value={douyinRevenue} placeholder="输入收入" required>
        </div>
      </div>

      <div class="platform">
        <h3>美团</h3>
        <div class="form-group">
          <label for="meituan-hours">钟数:</label>
          <input type="number" id="meituan-hours" bind:value={meituanHours} placeholder="输入钟数" required>
        </div>
        <div class="form-group">
          <label for="meituan-revenue">收入总数 (元):</label>
          <input type="number" step="0.01" id="meituan-revenue" bind:value={meituanRevenue} placeholder="输入收入" required>
        </div>
      </div>
    </div>

    <h2>收款方式数据</h2>
    <div class="payment-section">
       <div class="payment-method">
        <h3>现金收款</h3>
        <div class="form-group">
          <label for="cash-hours">钟数:</label>
          <input type="number" id="cash-hours" bind:value={cashHours} placeholder="输入钟数" required>
        </div>
        <div class="form-group">
          <label for="cash-revenue">收入总数 (元):</label>
          <input type="number" step="0.01" id="cash-revenue" bind:value={cashRevenue} placeholder="输入收入" required>
        </div>
      </div>

       <div class="payment-method">
        <h3>POS机</h3>
        <div class="form-group">
          <label for="pos-hours">钟数:</label>
          <input type="number" id="pos-hours" bind:value={posHours} placeholder="输入钟数" required>
        </div>
        <div class="form-group">
          <label for="pos-revenue">收入总数 (元):</label>
          <input type="number" step="0.01" id="pos-revenue" bind:value={posRevenue} placeholder="输入收入" required>
        </div>
      </div>
    </div>

    {#if submitError}
      <p class="error-message">错误: {submitError}</p>
    {/if}
    {#if submitSuccess}
      <p class="success-message">{submitSuccess}</p>
    {/if}

    <button type="submit" disabled={submitting}>
      {#if submitting} 正在提交... {:else} 提交日报 {/if}
    </button>
  </form>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1.5rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 2rem;
  }

  h2 {
    color: #555;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    margin-top: 2rem;
    margin-bottom: 1.5rem;
  }

   h3 {
    color: #444;
    margin-bottom: 1rem;
  }

  .report-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .platform-section,
  .payment-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .platform,
  .payment-method {
     padding: 1rem;
     background-color: #fff;
     border-radius: 4px;
     border: 1px solid #ddd;
  }


  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
    font-weight: bold;
  }

  input[type="number"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box; /* Include padding in width */
    font-size: 1rem;
  }

  input[type="number"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  button[type="submit"] {
    padding: 0.8rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
    align-self: center; /* Center button */
    margin-top: 1rem;
  }

  button[type="submit"]:hover {
    background-color: #0056b3;
  }

  .date-group {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
  }
  .error-message {
    color: #F44336; /* Red */
    text-align: center;
    margin-top: 1rem;
    font-weight: bold;
  }
  .success-message {
    color: #4CAF50; /* Green */
    text-align: center;
    margin-top: 1rem;
    font-weight: bold;
  }
</style>
