// Import Vue
import Vue from 'vue'

// Import Framework7
import Framework7 from 'framework7/framework7.esm.bundle.js';

// Import Framework7 Vue
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js';

// Import F7 Style
import Framework7CSS from 'framework7/css/framework7.bundle.css'

// Import F7 iOS Icons
import Framework7Icons from 'framework7-icons/css/framework7-icons.css'

// Import Material Icons
import MaterialIcons from 'material-design-icons/iconfont/material-icons.css'

// Import Fontawesome Theme Styles
import FontAwesome from 'font-awesome/css/font-awesome.css'

// Import App Custom Styles
// import AppStyles from './assets/sass/main.scss'

import DatePicker from 'vue2-datepicker'
var AddToCalendar = require('vue-add-to-calendar');
Vue.use(AddToCalendar);

// Import App Component
import app from './main.vue'

// Import Vuex Storage
import store from './assets/vuex/storage.js'

// Local file-storage
import VueLocalStorage from 'vue-localstorage';

// Moment
import moment from 'moment';

// Different F7-Vue plugin initialization with f7 v3.0
Framework7.use(Framework7Vue)

// External components.
Vue.use(DatePicker)
Vue.use(VueLocalStorage)

// Global function.
Vue.mixin({
   methods : {
      dbDate: function( date ) {
         return moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");
      },
      humanReadableDate: function( date ) {
         return moment(date, "YYYY-MM-DD").format("MMM DD");
      },
      dbTime: function(date, addminutes=0) {
         return moment(date, "HH:MM").add(addminutes, 'm').format("HH:mm");
      },
      humanReadableTime: function( time ) {
         return moment(time, "HH:MM:ss").format("hh:mm a");
      },
      humanReadableDateTime: function(date, time) {
         var d = moment(date, "YYYY-MM-DD").format("(ddd) MMM DD");
         var t = moment(time, "hh:mm:ss").format("hh:mm A");
         return d+', '+t;
      },
      dbDateTime: function(date) {
         return moment(date).format('YYYY-MM-DDTHH:mm');
      },
      toDate: function(dateStr) {
         return moment(dateStr).toDate();
      },
      apiPostData: function() {
         const self = this;
         return {
            'HIPPO-API-KEY': self.$localStorage.get('HIPPO-API-KEY'), 
            'login': self.$localStorage.get('HIPPO-LOGIN')
         };
      },
      isUserAuthenticated: function() {
         // If API key is found then user is logged in.
         const self = this;
         const apiKey = self.$localStorage.get('HIPPO-API-KEY');
         if( apiKey && apiKey.trim().length > 0 )
            return true;
         return false;
      },
   },
})

// Init Vue App
export default new Vue({
   // Root Element
   el: '#app',
   store,
   render: c => c('app'),
   components: {app},
   localStorage : {
      HippoApiKey : ''
   },
});
