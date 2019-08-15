// Import Vue
import Vue from 'vue'

// Import css from dropzone.
import Dropzone from "vue2-dropzone";
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
Vue.component('vue-dropzone', Dropzone);

// Multi uploader.
import MultipleFileUploader from '@updivision/vue2-multi-uploader'
Vue.component('v-multifile-uploader', MultipleFileUploader);

// import VueQrcodeReader from "vue-qrcode-reader";
// Vue.use(VueQrcodeReader);
// import 'vue-qrcode-reader/dist/vue-qrcode-reader.css';

// OSM and leaflet.
import {LMap, LTileLayer, LMarker, LPolyline, LPopup, LTooltip, LControlLayers} from 'vue2-leaflet';
import Vue2LeafletLocateControl from 'vue2-leaflet-locatecontrol';

import {Icon} from 'leaflet'
import 'leaflet/dist/leaflet.css'

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-popup', LPopup);
Vue.component('l-tooltip', LTooltip);
Vue.component('l-polyline', LPolyline);
Vue.component('l-control-layers', LControlLayers);
Vue.component('v-locatecontrol', Vue2LeafletLocateControl);

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// GoogleMap services.
import { OpenStreetMapProvider, GoogleProvider } from 'leaflet-geosearch'; 

//// fixme: Lightweight timeline.
//import LightTimeline from 'vue-light-timeline';
//Vue.use(LightTimeline);

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
   data: function() {
      return {
         googleMapProvider: new GoogleProvider({
            params: {
               key: this.loadStoreStr('GOOGLE-MAP-API-KEY'), 
               client: 'HippoAndroidApp',
            },
         }),
      };
   },
   methods : {
      dbDate: function( date ) {
         return moment(date).format("YYYY-MM-DD");
      },
      humanReadableDate: function( date ) {
         return moment(date, "YYYY-MM-DD").format("MMM DD");
      },
      toNow: function(date, time){
         let b = moment(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss');
         let a = moment();
         return b.toNow(a, true);
      },
      dbTime: function(date, addminutes=0) {
         return moment(date, "HH:MM").add(addminutes, 'm').format("HH:mm");
      },
      humanReadableTime: function( time ) {
         return moment(time, "HH:MM:ss").format("HH:mm");
      },
      humanReadableDateTime: function(date, time) {
         var d = moment(date, "YYYY-MM-DD").format("(ddd) MMM DD");
         var t = moment(time, "hh:mm:ss").format("hh:mm A");
         return d+', '+t;
      },
      dbDateTime: function(date) {
         return moment(date).format('YYYY-MM-DDTHH:mm');
      },
      datetime2Moment: function(timestamp) {
         return moment(timestamp, 'YYYY-MM-DD HH:mm:ss');
      },
      toDate: function(dateStr) {
         return moment(dateStr).toDate();
      },
      str2Moment: function(str, fmt) {
         return moment(str, fmt);
      },
      addToCalendar: function(ev) {
         createCalendar(ev);
      },
      stringToColour: function(str, trans='ff') {
         if(! str)
            return '';
         var hash = 0;
         for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
         }
         var colour = '#'+trans;
         for (var i = 0; i < 3; i++) 
         {
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
      getLogin: function() {
         const self = this;
         return self.apiPostData().login;
      },
      isUserAuthenticated: function() {
         // If API key is found then user is logged in.
         const self = this;
         const apiKey = self.$localStorage.get('HIPPO-API-KEY');
         if( apiKey && apiKey.trim().length > 0 )
            return true;
         return false;
      },
      formatKey: function(key) {
         return key.split('_').join(' ').toUpperCase();
      },
      postWithPromise: function(endpoint) {
         const self = this;
         const app = self.$f7;
         return app.request.promise.post(self.$store.state.api+'/'+endpoint, self.apiPostData());
      },
      promiseWithAuth: function(endpoint, post) {
         const self = this;
         const app = self.$f7;
         let data = { ...self.apiPostData(), ...post};
         return app.request.promise.post(self.$store.state.api+'/'+endpoint, data);
      },
      getGoogleMapApiKey: function( ) {
         const self = this;
         return this.$store.state.google_map_api_key;
      },
      fetchAndStore: function(endpoint, key) {
         const self = this;
         const app = self.$f7;
         app.request.post(self.$store.state.api+'/'+endpoint
            , self.apiPostData()
            , function(json)
            {
               const res = JSON.parse(json);
               if(res.status=='ok')
                  self.$localStorage.set(key, JSON.stringify(res.data));
               else
                  console.log('Warn: Failed to fetch ',);
            }
         );
      },
      saveStore: function(key, data) {
         const self=this;
         self.$localStorage.set(key, JSON.stringify(data));
      },
      saveStoreStr: function(key, data) {
         const self=this;
         self.$localStorage.set(key, data);
      },
      loadStore: function(key) {
         const self=this;
         return JSON.parse(self.$localStorage.get(key, '[]'));
      },
      loadStoreStr: function(key) {
         return this.$localStorage.get(key, '');
      },
      sendRequest: function(endpoint, post) {
         const self = this;
         const app = self.$f7;
         app.dialog.preloader();
         let data = { ...self.apiPostData(), ...post};
         app.request.promise.post(self.$store.state.api+'/'+endpoint, data)
            .then( function(json) {
               const res = JSON.parse(json);
               app.dialog.close();
               return;
            }
         );
         setTimeout( () => app.dialog.close(), 1000);
      },
      sendCoordinates: function(endpoint, coords) {
         const self = this;
         const app = self.$f7;
         let data = {};

         // Construct a object for JSON.
         for(let k in coords)
            data[k] = coords[k];
         app.request.promise.post(self.$store.state.api+'/'+endpoint, data)
            .then( function(json) {
               const res = JSON.parse(json);
               return res.status;
            }
         );
      },
      fetchVenues: function() {
         const self = this;
         self.fetchAndStore( '/venue/list/all', 'venues');
      },
      fetchProfile: function() {
         const self = this;
         const app = self.$f7;
         self.fetchAndStore('/me/profile', 'me.profile');
      },
      filterSchema: function(schema, toremove) 
      {
         toremove = toremove.split(',');
         return schema.filter(obj => ! toremove.find(k => k == obj.Field));
      },
      getInputTypeFromSchema: function(schemaObj) {
         let ret = 'type="text"';
         if( schemaObj.Type == 'date')
             ret = 'date';
         else if( schemaObj.Type == 'time')
             ret = 'time';

         console.log('type is ', ret);
         return ret;
      },
      fetchNotifications: function() {
         const self = this;
         self.postWithPromise( 'notifications/get' ).then(
            function(json) {
               let notifications = JSON.parse(json).data;
               self.saveStore("notifications", notifications);
            }
         );
      },
      displayNotifications: function() {
         const self = this;
         // Popup notification.
         // See https://github.com/katzer/cordova-plugin-local-notifications#properties
         // for available properties.
         let data = self.loadStore('notifications');
         const nots = data.filter( x => x.is_read == false);
         if( nots.length > 0)
            cordova.plugins.notification.local.schedule(nots);
      },
      removeFromArray: function(arr) {
         var what, a = arguments, L = a.length, ax;
         while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
               arr.splice(ax, 1);
            }
         }
         return arr; 
      },  
      deleteComment: function(id) {
         const self = this;
         self.sendRequest('/comment/delete/'+id);
      },
      addComment: function(comment) {
         const self = this;
         self.sendRequest('/comment/post', comment);
      },
      pageBeforeIn: function( ) {
         const self = this;
         const app = self.$f7;
         app.preloader.show();
      },
      pageAfterIn: function() {
         const self = this;
         const app = self.$f7;
         app.preloader.hide();
      },
   },
});

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
   mounted() {
      const self = this;
      document.addEventListener("deviceready", self.onDeviceReady, false);
   },
   methods: 
   { 
      onBackButton: function(e) {
         console.log( 'back button');
         var leftp = app.panel.left && app.panel.left.opened;
         var rightp = app.panel.right && app.panel.right.opened;
         if ( leftp || rightp ) 
         {
            app.panel.close();
            return false;
         } 
         else if (app.views.main.router.url == '/') 
         {
            app.dialog.confirm('Are you sure you want to exit?', 'Exit MyApp'
               , function() { navigator.app.exitApp();}
               , function() { }
            );
         } 
         else 
            app.views.main.router.back();
      },

      onDeviceReady : function(x) {
         const self = this;
         console.log( "Add onDeviceReady callback here.");
         ///////////////////////////////////////////////////////////////
         // Notifications 
         ///////////////////////////////////////////////////////////////
         cordova.plugins.notification.local.on("click", function(not) {
            // On click show notification page.
            self.$f7router.navigate('/notifications');
         }, self);
         cordova.plugins.notification.local.on("clear", function(not) {
            setTimeout( () => {
               self.postWithPromise('/notifications/dismiss/' + not.id);
            }, 500);
         }, self);

         // Open link in external browser
         window.open = cordova.InAppBrowser.open;
      },
   },
});

