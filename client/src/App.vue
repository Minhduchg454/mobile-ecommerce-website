<template>
  <router-view></router-view>
  <Chatbot />
</template>

<script>
import Chatbot from '@/components/Chatbot.vue'

export default {
  name: 'App',
  components: {
    Chatbot
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: #f5f6fa;
}

#app {
  min-height: 100vh;
}
</style> 