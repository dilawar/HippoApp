// Import Vue
import Vue from 'vue'

// OSM and leaflet.
import {LMap, LTileLayer, LMarker, LPopup, LTooltip} from 'vue2-leaflet';
import {Icon} from 'leaflet'
import 'leaflet/dist/leaflet.css'

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-popup', LPopup);
Vue.component('l-tooltip', LTooltip);

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Lightweight timeline.
import LightTimeline from 'vue-light-timeline';
Vue.use(LightTimeline);

// Moment 
import moment from 'moment';

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
import AppStyles from './assets/sass/main.scss'

import DatePicker from 'vue2-datepicker'

// Import App Component
import app from './main.vue'

// Import Vuex Storage
import store from './assets/vuex/storage.js'

// Local file-storage
import VueLocalStorage from 'vue-localstorage';

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
      str2Moment: function(str, fmt) {
         return moment(str, fmt);
      },
      stringToColour: function(str) {
         if(! str)
            return '';
         var hash = 0;
         for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
         }
         var colour = '#';
         for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
         }
         return colour;
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
   methods: {
   },
});
