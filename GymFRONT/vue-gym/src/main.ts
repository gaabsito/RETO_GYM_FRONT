import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2c3e50',
          secondary: '#42b883',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  },
  defaults: {
    global: {
      ripple: false,
    },
    VBtn: {
      fontFamily: 'Staatliches',
    },
    VCard: {
      fontFamily: 'Staatliches',
    },
    VTextField: {
      fontFamily: 'Roboto Condensed',
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')