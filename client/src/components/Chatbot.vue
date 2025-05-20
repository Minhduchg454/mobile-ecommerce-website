<template>
  <div 
    class="chatbot-container"
    :style="{
      bottom: `${config?.position?.bottom || 20}px`,
      right: `${config?.position?.right || 20}px`
    }"
  >
    <button 
      v-if="!isOpen"
      class="chatbot-button"
      @click="toggleChat"
      :style="{
        background: `linear-gradient(135deg, ${config?.theme?.primaryColor || '#4a90e2'} 0%, ${config?.theme?.secondaryColor || '#357abd'} 100%)`
      }"
    >
      {{ config?.avatar || '🤖' }}
    </button>

    <div 
      v-else
      class="chatbot-window"
      :style="{
        width: `${config?.size?.width || 380}px`,
        height: `${config?.size?.height || 600}px`,
        backgroundColor: config?.theme?.backgroundColor || '#ffffff'
      }"
    >
      <div 
        class="chatbot-header"
        :style="{
          background: `linear-gradient(135deg, ${config?.theme?.primaryColor || '#4a90e2'} 0%, ${config?.theme?.secondaryColor || '#357abd'} 100%)`
        }"
      >
        <h3>
          {{ config?.avatar || '🤖' }} {{ config?.title || 'Chatbot' }}
        </h3>
        <button class="close-button" @click="toggleChat">×</button>
      </div>

      <div class="chatbot-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message"
          :class="message.sender"
          :style="{
            color: message.sender === 'user' ? 'white' : config?.theme?.textColor || '#2c3e50',
            background: message.sender === 'user' 
              ? `linear-gradient(135deg, ${config?.theme?.primaryColor || '#4a90e2'} 0%, ${config?.theme?.secondaryColor || '#357abd'} 100%)`
              : config?.theme?.backgroundColor || '#ffffff'
          }"
        >
          {{ message.text }}
        </div>
        <div v-if="isLoading" class="message bot">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <form @submit.prevent="sendMessage" class="chatbot-input">
        <input
          v-model="input"
          type="text"
          placeholder="Type your message..."
          :disabled="isLoading"
          :style="{
            color: config?.theme?.textColor || '#2c3e50',
            backgroundColor: config?.theme?.backgroundColor || '#ffffff'
          }"
        />
        <button 
          type="submit"
          :disabled="isLoading"
          :style="{
            background: `linear-gradient(135deg, ${config?.theme?.primaryColor || '#4a90e2'} 0%, ${config?.theme?.secondaryColor || '#357abd'} 100%)`
          }"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

export default {
  name: 'Chatbot',
  setup() {
    const isOpen = ref(false)
    const input = ref('')
    const messages = ref([])
    const isLoading = ref(false)
    const config = ref(null)
    const messagesContainer = ref(null)

    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/chatbot')
        config.value = response.data
        if (config.value.isActive) {
          messages.value = [{ text: config.value.welcomeMessage, sender: 'bot' }]
        }
      } catch (error) {
        console.error('Error fetching chatbot config:', error)
      }
    }

    const toggleChat = () => {
      isOpen.value = !isOpen.value
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const sendMessage = async () => {
      if (!input.value.trim() || !config.value?.isActive) return

      const userMessage = input.value.trim()
      input.value = ''
      messages.value.push({ text: userMessage, sender: 'user' })
      isLoading.value = true

      try {
        const response = await axios.post('/api/chatbot/message', { message: userMessage })
        messages.value.push({ text: response.data.message, sender: 'bot' })
      } catch (error) {
        console.error('Error sending message:', error)
        messages.value.push({ 
          text: 'Sorry, there was an error processing your message. Please try again.',
          sender: 'bot'
        })
      } finally {
        isLoading.value = false
      }
    }

    watch(messages, () => {
      scrollToBottom()
    })

    onMounted(fetchConfig)

    return {
      isOpen,
      input,
      messages,
      isLoading,
      config,
      messagesContainer,
      toggleChat,
      sendMessage
    }
  }
}
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
}

.chatbot-button {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
}

.chatbot-button:hover {
  transform: scale(1.05);
}

.chatbot-window {
  position: fixed;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.chatbot-header {
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatbot-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 50%;
  line-height: 1;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: #f8f9fa;
}

.message {
  max-width: 85%;
  padding: 12px 18px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  position: relative;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.message.bot {
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

.chatbot-input {
  padding: 20px;
  background: white;
  border-top: 1px solid #e4e6eb;
  display: flex;
  gap: 12px;
}

.chatbot-input input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e4e6eb;
  border-radius: 25px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.chatbot-input input:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
}

.chatbot-input button {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

.chatbot-input button:hover {
  transform: scale(1.05);
}

.chatbot-input button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 18px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #4a90e2;
  border-radius: 50%;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style> 