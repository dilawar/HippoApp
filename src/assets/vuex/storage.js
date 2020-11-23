import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

let osmAttr = '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors';

export default new Vuex.Store({
   state: {
      user: localStorage.getItem('HIPPO-LOGIN'),
      alreadyLoggedIn: false,
      api : 'https://ncbs.res.in/hippo/v1/api',
      icalurl : 'https://ncbs.res.in/hippo/v1/pub/ical/',
      // api : 'http://172.16.223.30/hippo/v1/api',
      // icalurl : 'http://172.16.223.30/hippo/v1/pub/ical/',
      apikey : localStorage.getItem('HIPPO-API-KEY'),
      apiKeyGMap: '',
      tobook: null,
      profile: {roles:['USER']},
      OSM: {
         tileProviders: [ 
            {
               name: 'Satellite',
               visible: false,
               attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
               url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

            },
            {
               name: 'Streets',
               visible: true,
               attribution: osmAttr,
               url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            },
            {
               name: 'Cycling/Walking',
               visible: false,
               url: 'http://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=635faabc9da4464585a4b72ddb4c0917',
               attribution: '&copy; OpenCycleMap, ' + 'Map data ' + osmAttr
            },
            {
               name: 'Topography',
               visible: false,
               url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
               attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            },
         ],
         toolTipOpts: {permanent:false, interactive:true, direction:'top'},
         center: L.latLng(13.071081, 77.58025),
         url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
         attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
         mapStyle: 'width:100%; height:100%',
         venueIcon: L.divIcon( {className: 'fa fa-map-marker fa-2x' }),
      },
   },
   getters: {
      profile: state => {
         return state.profile;
      },
      myjcs: state => {
         return state.profile.jcs;
      },
      roles: state => {
         if(state.profile.hasOwnProperty('roles'))
            return state.profile.roles;
         return ['USER'];
      },
      login: state => {
         return state.user;
      },
      apikey: state => {
         return state.apikey;
      },
   },
   mutations: {
      USER_LOGGED (state, user) {
         state.user = user;
         state.alreadyLoggedIn = true;
         localStorage.setItem('HIPPO-LOGIN', user);
      },
      HIPPO_API_KEY (state, key) {
         localStorage.setItem('HIPPO-API-KEY', key);
         state.apikey = key;
      },
      ADD_BOOKING_DATA(state, data) {
         state.tobook = data;
      },
      ROLES(state, roles) {
         state.profile.roles = roles;
      },
      PROFILE(state, data) {
         state.profile = data;
      },
      GOOGLE_MAP_API_KEY(state, key) {
         state.apiKeyGMap = key;
      },
   },
});
