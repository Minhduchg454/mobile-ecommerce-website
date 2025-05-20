import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'
import adminRouter from './routes/admin'
import axios from 'axios'

// Configure axios
axios.defaults.baseURL = 'http://localhost:3000'

const app = createApp(App)

// Use routers
app.use(router)
app.use(adminRouter)

app.mount('#app') 