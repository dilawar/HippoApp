import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: '',
    alreadyLoggedIn: false,
    api : 'https://ncbs.res.in/hippo/api',
    //api : 'https://172.16.223.30/hippo/api',
    key : '',
    tobook: null,
    OSM: {
       tileProviders: [ 
          {
             name: 'OpenStreetMap',
             visible: true,
             attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
             url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          },
          {
             name: 'OpenTopoMap',
             visible: false,
             url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
             attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          }],
       toolTipOpts: {permanent:false, interactive:true},
       center: L.latLng(13.071081, 77.58025),
       url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
       attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
       mapStyle: 'width:100%; height:100%',
       venueIcon: L.divIcon( {className: 'fa fa-map-marker fa-2x' }),
    },
  },
  actions: {
    userLogged ({commit}, user) {
      commit('USER_LOGGED', user)
    },
    keyLogger ( {commit}, key ) {
      commit('HIPPO_API_KEY', key)
    },
    addBookingData( {commit}, data){
      commit('ADD_BOOKING_DATA', data)
    },
  },
  mutations: {
    USER_LOGGED (state, user) {
      state.user = user;
      state.alreadyLoggedIn = true;
    },
    HIPPO_API_KEY (state, key) {
      state.key = key;
    },
    ADD_BOOKING_DATA(state, data) {
      state.tobook = data;
    }
  },
});
