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
    tobook: null
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
