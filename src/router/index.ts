import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/login/index.vue';
import ForgotPassword from '@/views/forgot-password/index.vue';
import HomePage from '@/views/home/index.vue';
import { getToken } from '@/utils/auth';
import { jwtDecode } from 'jwt-decode';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/index.vue'),
  },
  {
    path: '/home',
    name: 'HomePage',
    component: () => import('@/views/home/index.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = getToken();

  if (to.meta.requiresAuth) {
    if (!token) {
      // 没有token，重定向到登录页
      next({ name: 'login' });
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        // token过期，清除token并重定向到登录页
        localStorage.removeItem('coworkhub_token');
        next({ name: 'login' });
        return;
      }
      
      // token有效，允许访问
      next();
    } catch (error) {
      // token解析失败，重定向到登录页
      localStorage.removeItem('coworkhub_token');
      next({ name: 'login' });
    }
  } else {
    // 对于不需要认证的路由
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          // token有效，如果是访问登录页则重定向到首页
          if (to.name === 'login') {
            next({ name: 'HomePage' });
            return;
          }
        }
      } catch (error) {
        localStorage.removeItem('coworkhub_token');
      }
    }
    next();
  }
});

export default router 