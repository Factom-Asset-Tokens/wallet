import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: "#7287b1",
    secondary: "#EEB71C",
    accent: "#23182D",
    lightGrey: "#55585e"
  }
})