// Import Vue
import Vue from 'vue';

// Import css from dropzone.
import Dropzone from "vue2-dropzone";
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
Vue.component('vue-dropzone', Dropzone);

// Vue charts.
import Chartkick from 'vue-chartkick';
//import Chart from 'chart.js'
//Vue.use(Chartkick.use(Chart));
import Highcharts from 'highcharts';
Vue.use(Chartkick.use(Highcharts))

// linkify
import linkify from 'vue-linkify';
Vue.directive('linkified', linkify);

// Editor
import { VueEditor, Quill } from 'vue2-editor';
Vue.component('vue-editor', VueEditor);

// Autocomplete
import Autocomplete from 'vuejs-auto-complete';
Vue.component('v-autocomplete', Autocomplete);

// Analytics
import VueGtag from 'vue-gtag';
Vue.use(VueGtag, {config : { id : 'G-RLF9RVR5T6'}});

// OSM and leaflet.
import {LMap, LTileLayer, LMarker, LPolyline, LPopup, LTooltip, LCircle, LControlLayers} from 'vue2-leaflet';

import {Icon} from 'leaflet'
import 'leaflet/dist/leaflet.css'

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-popup', LPopup);
Vue.component('l-tooltip', LTooltip);
Vue.component('l-polyline', LPolyline);
Vue.component('l-circle', LCircle);
Vue.component('l-control-layers', LControlLayers);

// import Vue2LeafletLocateControl from 'vue2-leaflet-locatecontrol';
// Vue.component('v-locatecontrol', Vue2LeafletLocateControl);
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// GoogleMap services.
import { OpenStreetMapProvider, GoogleProvider } from 'leaflet-geosearch'; 

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
// import FontAwesome from 'font-awesome/css/font-awesome.css'
import FontAwesome from '@fortawesome/fontawesome-free/css/all.min.css'

// Import App Custom Styles
import AppStyles from './assets/sass/main.scss'

import DatePicker from 'vue2-datepicker'
Vue.use(DatePicker)

// Import App Component
import app from './main.vue'

// Import Vuex Storage
import store from './assets/vuex/storage.js'

// Local file-storage
import VueLocalStorage from 'vue-localstorage';

// Different F7-Vue plugin initialization with f7 v3.0
Framework7.use(Framework7Vue)

Vue.use(VueLocalStorage)

// Papa
import Papa from 'papaparse';

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
         locationIQ: {
            "async": true,
            "crossDomain": true,
            "method": "GET",
            "url": "https://us1.locationiq.com/v1/search.php?key=0d166e7f031bfd" 
            + "&countrycodes=in&matchlevel=city&format=json",
         },
         locationIQSearchURL: "https://us1.locationiq.com/v1/autocomplete.php?key=0d166e7f031bfd" 
         + "&countrycodes=in&matchlevel=city&format=json",
      };
   },
   methods : {
      dbDate: function( date ) {
         return moment(date).format("YYYY-MM-DD");
      },
      inBetweenDates: function(date1, date2, today=null) {
         const self = this;
         if(today === null)
            today = moment();
         const inb = (today >= moment(date1) && today <= moment(date2));
         console.log('inbetwee', inb);
         return inb;
      },
      osmUrl: function(lat, lon, text) {
         let href = "https://www.openstreetmap.org/?lat="+lat+"&lon="+lon+"&zoom=14&layers=M";
         return '<a target="_system" external href="' + href + '">' + text + '</a>';
      },
      resetSimple: function(obj) {
         Object.keys(obj).map(key => {
            if (obj[key] instanceof Array) obj[key] = []
            else if (obj[key] instanceof Number) obj[key] = 0
            else if (obj[key] instanceof Boolean) obj[key] = false
            else if (obj[key] instanceof Object) obj[key] = {}
            else obj[key] = ''
         })
      },
      subscribeFCM: function(topic) {
         try {
            cordova.plugins.firebase.messaging.subscribe(topic);
         } catch (e) {
            /* handle error */
            console.log("Failed to subscribe:", e);
         }
      },
      unsubscribeFCM: function(topic) {
         try {
            cordova.plugins.firebase.messaging.unsubscribe(topic);
         } catch (e) {
            /* handle error */
            console.log("Failed to unsubscribe:", e);
         }
      },
      humanReadableDate: function(date, withyear=true) {
         if(withyear)
            return moment(date, "YYYY-MM-DD").format("MMM DD, YYYY");
         else
            return moment(date, "YYYY-MM-DD").format("MMM DD");
      },
      toNow: function(date, time){
         let b = moment(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss');
         return b.toNow(true);
      },
      toNowDatetime: function(datetime){
         let b = moment(datetime, 'YYYY-MM-DD HH:mm:ss');
         return b.toNow(true);
      },
     wrtNow: function(date, time) {
         let b = moment(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss');
         return b.from(moment());
     },
      dbTime: function(date, addminutes=0) {
         return moment(date, "HH:mm").add(addminutes, 'm').format("HH:mm");
      },
      humanReadableTime: function( time ) {
         return moment(time, "HH:mm:ss").format("hh:mm A");
      },
      whichDay: function(date) {
         return moment(date, "YYYY-MM-DD").format("ddd");
      },
      humanReadableDateTime: function(date, time) {
         var d = moment(date, "YYYY-MM-DD").format("(ddd) MMM DD");
         var t = moment(time, "HH:mm:ss").format("hh:mm A");
         return d+', '+t;
      },
      today : function() {
         return moment().format();
      },
      anchor: function(url) {
         return "<a href='" + url + "'>"+url+"</a>";
      },
      dbDateTime: function(date) {
         return moment(date).format('YYYY-MM-DD HH:mm');
      },
      datetime2Moment: function(timestamp) {
         return moment(timestamp, 'YYYY-MM-DD HH:mm:ss');
      },
     meanArray: function(arr) {
       var s = 0.0;
       for(const x in arr)
         s += arr[x];
       return s / arr.length;
     },
      toDate: function(dateStr) {
         return moment(dateStr).toDate();
      },
      str2Moment: function(str, fmt) {
         return moment(str, fmt);
      },
      dbDate2Moment: function(str) {
         return moment(str, 'YYYY-MM-DD');
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
            'HIPPO-LOGIN': self.$store.getters.login
         };
      },
      getLogin: function() {
         const self = this;
         return self.apiPostData().login;
      },
      isUserAuthenticated: function() {
         // If API key is found then user is logged in.
         const self = this;
         const apiKey = self.$store.getters.apikey;
         if(apiKey && apiKey.trim().length > 0)
            return true;
         return false;
      },
      whoAmI: function() {
         const self = this;
         let user = self.$localStorage.get('HIPPO-LOGIN');
         if(user)
            return user.toLowerCase();
         else 
            return 'Guest';
      },
      formatKey: function(key) {
         return key.split('_').join(' ').toUpperCase();
      },
      getAPIUrl: function() {
         const self = this;
         return self.$store.state.api;
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
         if(! isUserAuthenticated())
         {
            self.$localStorage.set(key, '{}');
            return '';
         }
         app.request.promise.post(self.$store.state.api+'/'+endpoint
            , self.apiPostData() )
            .then( function(x) {
               const res = JSON.parse(x.data);
               if(res.status==='ok')
                  self.$localStorage.set(key, JSON.stringify(res.data));
               else
                  console.log('Warn: Failed to fetch from '+endpoint);
            });
      },
      writeCSVFile: function(filename, json) {
        const self = this;
        let csv = Papa.unparse(json, {quotes:true});
        let mimeType = "text/plain";
        var blob = new Blob([csv], {type:mimeType});
        let dlink = document.createElement('a');
        dlink.target = "_blank";
        dlink.download = filename;
        dlink.href = window.URL.createObjectURL(blob);
        dlink.onclick = function(e) {
          setTimeout( () => { 
            window.URL.revokeObjectURL(self.href);
          }, 1000);
        };
        dlink.click();
        dlink.remove();
      },
      saveBlob: function(filename, blob) {
        const self = this;
        let mimeType = "text/plain";
        let dlink = document.createElement('a');
        dlink.target = "_blank";
        dlink.download = filename;
        dlink.href = window.URL.createObjectURL(blob);
        dlink.onclick = function(e) {
          setTimeout( () => { 
            window.URL.revokeObjectURL(self.href);
          }, 1000);
        };
        dlink.click();
        dlink.remove();
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
      isMobileApp: function() {
         // From  https://stackoverflow.com/a/13252184/1805129
         return (window.cordova || window.PhoneGap || window.phonegap) 
            && /^file:\/{3}[^\/]/i.test(window.location.href) 
            && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
      },
      sendRequest: function(endpoint, post) {
         const self = this;
         const app = self.$f7;
         let data = { ...self.apiPostData(), ...post};
         return app.request.promise.post(self.$store.state.api+'/'+endpoint, data)
            .then( function(x) {
               const res = JSON.parse(x.data);
               return;
            });
      },
      sendCoordinates: function(endpoint, coords) {
         const self = this;
         const app = self.$f7;
         let data = {};

         // Construct a object for JSON.
         for(let k in coords)
            data[k] = coords[k];
         app.request.promise.post(self.$store.state.api+'/'+endpoint, data)
            .then( function(x) {
               const res = JSON.parse(x.data);
               return res.status;
            }
            );
      },
      fetchVenues: function() {
         const self = this;
         self.fetchAndStore( '/venue/list/all', 'venues');
      },
      venueInfo: function(vid) {
         const self = this;
         var venue = self.loadStore('venues')[vid];
         if(venue)
            return venue.name;
         return vid;
      },
      fetchProfile: function() {
         const self = this;
         const app = self.$f7;
         self.promiseWithAuth('/me/profile').then(function(x) {
            self.$store.commit('PROFILE', JSON.parse(x.data).data);
         });
      },
      getRoles: function() {
         const self = this;
         return self.$store.getters.roles;
      },
      hasRole: function(role) {
         const self = this;
         const roles = self.getRoles();
         if( ! roles)
            return false;
         return roles.includes(role);
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
      searchPeopleURI: function(q, what) {
         const self = this;
         // remove '@' if someone try to insert email.
         q = q.split('@')[0];
         return self.getAPIUrl() + '/search/'+what+'/'+encodeURIComponent(q);
      },
      fetchNotifications: function() {
         const self = this;
         if(! self.isUserAuthenticated())
            return;

         self.postWithPromise( 'notifications/get' ).then(
            function(x) {
               let notifications = JSON.parse(x.data).data;
               if(! notifications)
                  notifications = [];
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
         if(data) {
            const nots = data.filter( x => x.is_read == false);
            if(nots.length > 0)
               cordova.plugins.notification.local.schedule(nots);
         }
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
      sortDays: function(a, b) {
         const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
         a = days.indexOf(a);
         b = days.indexOf(b);
         return a < b ? 0 : 1;
      },
      notify: function(header, msg, timeout=3000) 
      {
         const app = this.$f7;
         var t = timeout + msg.split(" ").length / 3 * 1000; // 3 words per sec.
         app.notification.create({
            title: header,
            subtitle: msg,
            closeTimeout: t,
            closeOnClick: false,
            swipeToClose: true,
            closeButton: true,
         }).open();
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
      signOut: function() {
         const self = this;
         self.$store.commit('HIPPO_API_KEY', '');
         self.$store.commit('USER_LOGGED', '');
         self.$f7router.refreshPage();
      },
      _get: function(obj, key, o=null) {
         if(! obj)
            return o;
         else if(obj == null)
            return o;
         else if(obj.length == 0)
            return o;
         return obj.hasOwnProperty(key)?obj[key]:o;
      },
   },
   // Vue filter for parsing phone numbers.
   'filters' : {
      'phone' : function (ph) {
         ph = ph.toString();
         if(ph.length < 10)
            return ph;
         return ph.replace(/([+]91|0)?\s?(\d{3})\s?(\d{3})\s?(\d{4})/
            , '<a href="tel:$1$2$3$4"><i class="fa fa-phone"></i>$1$2$3$4</a>'
         );
      },
      'clockTime' : function(time) {
         return moment(time, 'HH:mm:ss').format('hh:mm A');
      },
      'date' : function(time) {
         return moment(time, 'YYYY-MM-DD').format('(ddd) MMM DD');
      },
      'dateTime' : function(date) {
         return moment(date).format('(ddd) MMM DD, hh:mm A');
      },
      'date2' : function(time) {
         return moment(time, 'YYYY-MM-DD').format('(ddd) MMM DD, YYYY');
      },
      'date3' : function(time) {
         return moment(time, 'YYYY-MM-DD').format('MMM DD, YYYY');
      },
      'name' : function(login) {
         if(login.middle_name === 'NA')
            login.middle_name = '';
         return [login.first_name, login.middle_name, login.last_name].join(' ');
      },
      'tt' : function(text) {
         return "<tt>" + text + "</tt>";
      },
      'firstUpper': function(x) {
         return x.substring(0,1).toUpperCase() + x.substring(1).toLowerCase();
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
      document.addEventListener("offline", self.onOffline, false);
      document.addEventListener("online", self.onOnline, false);
   },
   methods: 
   { 
      onOnline: function(e) {

      },
      onOffline: function(e) {
         const self = this;
         const app = self.$f7;
         app.dialog.confirm('I am useless without network.', 'Bad network connection!'
            , function() { navigator.app.exitApp();}
            , function() { }
         );
      },
      onBackButton: function(e) {
         const self = this;
         const app = self.$f7;

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
            app.dialog.confirm('Are you sure?', 'Exit Hippo?'
               , function() { navigator.app.exitApp();}
               , function() { }
            );
         } 
         else 
            app.views.main.router.back();
      },

      onDeviceReady : function(x) {
         const self = this;
         self.platform = device.platform;

         // Notifications 
         cordova.plugins.notification.local.on("click", function(not) {
            // On click show notification page.
            self.$f7router.navigate('/notifications');
         }, self);

         cordova.plugins.notification.local.on("clear", function(not) {
            setTimeout( () => {
               self.postWithPromise('/notifications/dismiss/' + not.id);
            }, 500);
         }, self);

         // Firebase
         cordova.plugins.firebase.messaging.requestPermission({forceShow: true}).then(function() {
            console.log("You'll get foreground notifications when a push message arrives");
         });

         cordova.plugins.firebase.messaging.onMessage( function(payload) {
            // console.log("New foreground FCM message.", JSON.stringify(payload));
         });

         cordova.plugins.firebase.messaging.onBackgroundMessage(function(payload) {
            // console.log("New background FCM message: ", JSON.stringify(payload));
         });

         try {
            // Subscribe to Emergency
            cordova.plugins.firebase.messaging.subscribe("emergency");
         } catch (e) {
            /* handle error */
            console.log(e);
         }
         //// Backbutton.
         document.addEventListener("backbutton", self.onBackButton, false);
         // Open link in external browser
         window.open = cordova.InAppBrowser.open;
      },
   },
});
g
