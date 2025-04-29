import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; // Or your actual base URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// --- VIP API ---
// Define basic types or import from elsewhere if available
interface VipData { [key: string]: any; } // Replace with actual VIP type if defined
interface TransactionData { [key: string]: any; } // Replace with actual Transaction type

export const vipApi = {
  getAll: (params: any = {}) => apiClient.get('/vip', { params }),
  getById: (id: string) => apiClient.get(`/vip/${id}`),
  create: (data: VipData) => apiClient.post('/vip', data),
  recharge: (id: string, data) => apiClient.post(`/vip/${id}/recharge`, data),
  consume: (id: string, data) => apiClient.post(`/vip/${id}/consume`, data),
  update: (id: string, data: VipData) => apiClient.put(`/vip/${id}`, data),
  delete: (id: string) => apiClient.delete(`/vip/${id}`),
  addTransaction: (vipId: string, transactionData: TransactionData) => apiClient.post(`/vip/${vipId}/transactions`, transactionData),
};

// --- Project API ---
interface ProjectData { [key: string]: any; } // Replace with actual Project type
export const projectApi = {
  getAll: () => apiClient.get('/projects'),
  create: (data: ProjectData) => apiClient.post('/projects', data),
  getById: (id: string) => apiClient.get(`/projects/${id}`),
  update: (id: string, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`)
};

// --- Technician API ---
interface TechnicianData { [key: string]: any; } // Replace with actual Technician type
export const technicianApi = {
  getAll: () => apiClient.get('/technicians'),
  create: (data: TechnicianData) => apiClient.post('/technicians', data),
  getById: (id) => apiClient.get(`/technicians/${id}`),
  update: (id, data) => apiClient.put(`/technicians/${id}`, data),
  delete: (id) => apiClient.delete(`/technicians/${id}`)
};

// --- Transaction API (Example, if needed separately) ---
export const transactionApi = {
    // Might not be needed if handled via VIP/Reports
};


// --- Report API ---
interface ReportParams { startDate?: string; endDate?: string; [key: string]: any; }
interface DailyReportData {
  date: string | Date;
  douyinHours?: number; douyinRevenue?: number;
  meituanHours?: number; meituanRevenue?: number;
  cashHours?: number; cashRevenue?: number;
  posHours?: number; posRevenue?: number;
  [key: string]: any;
}

export const reportApi = {
  getTransactions: (params: ReportParams = {}) => apiClient.get('/reports/transactions', { params }),
  getRechargeReport: (params: ReportParams = {}) => apiClient.get('/reports/recharge', { params }),
  getConsumptionReport: (params: ReportParams = {}) => apiClient.get('/reports/consumption', { params }),

  // --- NEW Summary Endpoints ---
  getVipSummary: (params: ReportParams = {}) => apiClient.get('/reports/summary/vip', { params }),
  getPlatformSummary: (params: ReportParams & { platform: 'douyin' | 'meituan' | 'pos' }) => apiClient.get('/reports/summary/platform', { params }),
  getCashSummary: (params: ReportParams = {}) => apiClient.get('/reports/summary/cash', { params }),

  // --- NEW Daily Report Endpoint ---
  createDailyReport: (data: DailyReportData) => apiClient.post('/reports/daily', data),
};

// --- Currency Converter API ---
export const converterApi = {
  getRates: () => apiClient.get('/converter/rates'), // Example endpoint
};

export default apiClient;
