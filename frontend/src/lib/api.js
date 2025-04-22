import { PUBLIC_API_URL } from '$env/static/public';

// 基础请求方法
async function request(endpoint, options = {}) {
  const url = `${PUBLIC_API_URL || 'http://localhost:5001/api'}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }
  
  return data;
}

// VIP相关API
export const vipApi = {
  getAll: () => request('/vip'),
  getById: (id) => request(`/vip/${id}`),
  create: (data) => request('/vip', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  recharge: (id, data) => request(`/vip/${id}/recharge`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  consume: (id, data) => request(`/vip/${id}/consume`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// 项目相关API
export const projectApi = {
  getAll: () => request('/projects'),
  getById: (id) => request(`/projects/${id}`),
  create: (data) => request('/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/projects/${id}`, {
    method: 'DELETE'
  })
};

// 技师相关API
export const technicianApi = {
  getAll: () => request('/technicians'),
  getById: (id) => request(`/technicians/${id}`),
  create: (data) => request('/technicians', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/technicians/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/technicians/${id}`, {
    method: 'DELETE'
  })
};

// 报表相关API
export const reportApi = {
  getTransactions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/reports/transactions${queryString ? `?${queryString}` : ''}`);
  },
  getRechargeReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/reports/recharge${queryString ? `?${queryString}` : ''}`);
  },
  getConsumptionReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/reports/consumption${queryString ? `?${queryString}` : ''}`);
  }
}; 