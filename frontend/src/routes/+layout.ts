import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
  // 如果是登录页面，不需要检查认证
  if (url.pathname === '/login') {
    return {};
  }

  // 在服务器端，我们无法访问localStorage，所以只在客户端检查
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) {
      throw redirect(302, '/login');
    }
  }

  return {};
}; 