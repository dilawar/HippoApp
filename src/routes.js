import Home from './assets/vue/pages/home.vue';
import AboutPage from './assets/vue/pages/about.vue';
import PanelLeftPage from './assets/vue/pages/panel-left.vue';
import FormPage from './assets/vue/pages/form.vue';
import LoginPage from './assets/vue/pages/login.vue';
import DynamicRoutePage from './assets/vue/pages/dynamic-route.vue';
import BookingPage from './assets/vue/pages/booking.vue';
import MyBookingPage from './assets/vue/pages/mybooking.vue';
import BookThisVenuePage from './assets/vue/pages/bookthisvenue.vue';
import EventPage from './assets/vue/pages/events.vue';
import TravelPage from './assets/vue/pages/travel.vue';
import TransportPage from './assets/vue/pages/transport.vue';
import ColorThemes from './assets/vue/pages/color-themes.vue';
import Chat from './assets/vue/pages/chat.vue';
import SearchPage from './assets/vue/pages/search.vue';
import Vuex from './assets/vue/pages/vuex.vue';

export default [
   {
      path: '/',
      component: Home
   },
   {
      path: '/userpanel/',
      component: PanelLeftPage
   },
   {
      path: '/booking/',
      component: BookingPage
   },
   {
      path: '/mybooking/',
      component: MyBookingPage
   },
   {
      path: '/book/:venue/:startDateTime/:endDateTime/',
      component: BookThisVenuePage,
      pushState: false,
   },
   {
      path: '/events/',
      component: EventPage
   },
   {
      path: '/travel/',
      component: TravelPage
   },
   {
      path: '/transport/',
      component: TransportPage
   },
   {
      path: '/login/',
      component: LoginPage
   },
   {
      path: '/form/',
      component: FormPage
   },
   {
      path: '/dynamic-route/blog/:blogId/post/:postId/',
      component: DynamicRoutePage
   },
   {
      path: '/search/',
      component: SearchPage
   },
   {
      path: '/color-themes/',
      component: ColorThemes
   },
   {
      path: '/chat/',
      component: Chat
   },
   {
      path: '/vuex/',
      component: Vuex
   },
]
