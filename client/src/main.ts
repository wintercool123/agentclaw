import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

// Views
import HomeView from './views/HomeView.vue';
import ChatView from './views/ChatView.vue';
import PricingView from './views/PricingView.vue';
import AuthView from './views/AuthView.vue';
import DashboardView from './views/DashboardView.vue';
import AnalyticsView from './views/AnalyticsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/chat', component: ChatView },
    { path: '/pricing', component: PricingView },
    { path: '/auth', component: AuthView },
    { path: '/dashboard', component: DashboardView },
    { path: '/analytics', component: AnalyticsView }
  ]
});

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);
app.mount('#app');
