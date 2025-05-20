<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">
        <h1>Admin Panel</h1>
      </div>
      <nav>
        <router-link to="/admin" class="nav-item">
          <i class="fas fa-home"></i>
          Dashboard
        </router-link>
        <router-link to="/admin/chatbot" class="nav-item">
          <i class="fas fa-robot"></i>
          Chatbot Config
        </router-link>
      </nav>
    </aside>
    
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
        </div>
        <div class="header-right">
          <div class="user-menu">
            <span>Admin</span>
            <i class="fas fa-user-circle"></i>
          </div>
        </div>
      </header>
      
      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  data() {
    return {
      sidebarOpen: true
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 1rem;
  transition: all 0.3s ease;
}

.logo {
  padding: 1rem 0;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  margin: 0.5rem 0;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(255,255,255,0.1);
}

.nav-item.router-link-active {
  background: #3498db;
}

.nav-item i {
  margin-right: 0.75rem;
}

.main-content {
  flex: 1;
  background: #f5f6fa;
}

.header {
  background: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #2c3e50;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.user-menu i {
  font-size: 1.5rem;
  color: #2c3e50;
}

.content {
  padding: 2rem;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -250px;
    height: 100vh;
    z-index: 1000;
  }
  
  .sidebar.open {
    left: 0;
  }
}
</style> 