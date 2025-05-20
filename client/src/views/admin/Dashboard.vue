<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-robot"></i>
        </div>
        <div class="stat-info">
          <h3>Total Conversations</h3>
          <p class="stat-value">{{ stats.totalConversations }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>Active Users</h3>
          <p class="stat-value">{{ stats.activeUsers }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="stat-info">
          <h3>Product Recommendations</h3>
          <p class="stat-value">{{ stats.productRecommendations }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-info">
          <h3>Satisfaction Rate</h3>
          <p class="stat-value">{{ stats.satisfactionRate }}%</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="chart-container">
        <h2>Conversation Trends</h2>
        <div class="chart-placeholder">
          <!-- Add chart component here -->
          <p>Chart will be displayed here</p>
        </div>
      </div>

      <div class="recent-conversations">
        <h2>Recent Conversations</h2>
        <div class="conversation-list">
          <div v-for="conv in recentConversations" :key="conv.id" class="conversation-item">
            <div class="conversation-header">
              <span class="user">{{ conv.user }}</span>
              <span class="time">{{ conv.time }}</span>
            </div>
            <p class="message">{{ conv.lastMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'Dashboard',
  setup() {
    const stats = ref({
      totalConversations: 0,
      activeUsers: 0,
      productRecommendations: 0,
      satisfactionRate: 0
    })

    const recentConversations = ref([])

    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard')
        stats.value = response.data.stats
        recentConversations.value = response.data.recentConversations
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    onMounted(fetchDashboardData)

    return {
      stats,
      recentConversations
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.stat-value {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-container,
.recent-conversations {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  margin: 0 0 1rem;
  color: #2c3e50;
  font-size: 1.25rem;
}

.chart-placeholder {
  height: 300px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conversation-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.user {
  font-weight: 500;
  color: #2c3e50;
}

.time {
  color: #666;
  font-size: 0.9rem;
}

.message {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style> 