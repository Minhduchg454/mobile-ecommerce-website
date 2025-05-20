<template>
  <div class="chatbot-config">
    <h1>Chatbot Configuration</h1>
    
    <div class="config-form" v-if="config">
      <div class="form-group">
        <label>Welcome Message</label>
        <textarea 
          v-model="config.welcomeMessage"
          rows="3"
          placeholder="Enter welcome message..."
        ></textarea>
      </div>

      <div class="form-group">
        <label>Primary Color</label>
        <input 
          type="color" 
          v-model="config.primaryColor"
        >
      </div>

      <div class="form-group">
        <label>Secondary Color</label>
        <input 
          type="color" 
          v-model="config.secondaryColor"
        >
      </div>

      <div class="form-group">
        <label>Width (px)</label>
        <input 
          type="number" 
          v-model="config.width"
          min="200"
          max="800"
        >
      </div>

      <div class="form-group">
        <label>Height (px)</label>
        <input 
          type="number" 
          v-model="config.height"
          min="300"
          max="800"
        >
      </div>

      <div class="form-group">
        <label>Position</label>
        <select v-model="config.position">
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
        </select>
      </div>

      <div class="form-actions">
        <button class="btn-save" @click="saveConfig">
          Save Changes
        </button>
        <button class="btn-preview" @click="previewConfig">
          Preview
        </button>
      </div>
    </div>

    <div v-else class="loading">
      Loading configuration...
    </div>

    <!-- Preview Modal -->
    <div class="preview-modal" v-if="showPreview">
      <div class="preview-content">
        <div class="preview-header">
          <h3>Chatbot Preview</h3>
          <button class="close-btn" @click="showPreview = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="preview-body">
          <Chatbot :config="config" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Chatbot from '@/components/Chatbot.vue'

export default {
  name: 'ChatbotConfig',
  components: {
    Chatbot
  },
  setup() {
    const config = ref(null)
    const showPreview = ref(false)

    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/chatbot/config')
        config.value = response.data
      } catch (error) {
        console.error('Error fetching config:', error)
      }
    }

    const saveConfig = async () => {
      try {
        await axios.put('/api/chatbot/config', config.value)
        alert('Configuration saved successfully!')
      } catch (error) {
        console.error('Error saving config:', error)
        alert('Failed to save configuration')
      }
    }

    const previewConfig = () => {
      showPreview.value = true
    }

    onMounted(fetchConfig)

    return {
      config,
      showPreview,
      saveConfig,
      previewConfig
    }
  }
}
</script>

<style scoped>
.chatbot-config {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.config-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

input[type="text"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input[type="color"] {
  width: 100px;
  height: 40px;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save {
  background: #3498db;
  color: white;
}

.btn-save:hover {
  background: #2980b9;
}

.btn-preview {
  background: #2ecc71;
  color: white;
}

.btn-preview:hover {
  background: #27ae60;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  background: white;
  width: 90%;
  max-width: 1000px;
  height: 80vh;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
}

.preview-body {
  height: calc(100% - 60px);
  padding: 1rem;
  overflow: auto;
}
</style> 