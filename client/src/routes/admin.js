import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import Dashboard from '../views/admin/Dashboard.vue'
import ChatbotConfig from '../views/admin/ChatbotConfig.vue'

const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'admin.dashboard',
        component: Dashboard
      },
      {
        path: 'chatbot',
        name: 'admin.chatbot',
        component: ChatbotConfig
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 