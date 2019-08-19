import Home from './assets/vue/pages/home.vue';
import AboutPage from './assets/vue/pages/about.vue';
import ProfilePage from './assets/vue/pages/myprofile.vue';
import NotificationPage from './assets/vue/pages/notifications.vue';
import AccomodationPage from './assets/vue/pages/accomodation.vue';
import CanteenPage from './assets/vue/pages/canteen.vue';
import AWSPage from './assets/vue/pages/myaws.vue';
import CoursePage from './assets/vue/pages/mycourse.vue';
import PanelLeftPage from './assets/vue/pages/panel-left.vue';
import PanelTimelinePage from './assets/vue/pages/panel-right-timeline.vue';
import WhatWhereWhenPage from './assets/vue/pages/whatwherewhen.vue';
import FormPage from './assets/vue/pages/form.vue';
import DynamicRoutePage from './assets/vue/pages/dynamic-route.vue';
import BookingPage from './assets/vue/pages/booking.vue';
import MyBookingPage from './assets/vue/pages/mybooking.vue';
import MyInventoryPage from './assets/vue/pages/myinventory.vue';
import BookThisVenuePage from './assets/vue/pages/bookthisvenue.vue';
import EventPage from './assets/vue/pages/events.vue';
import TravelPage from './assets/vue/pages/travel.vue';
import NCBSMap from './assets/vue/pages/map.vue';
import OSM from './assets/vue/pages/osm.vue';
import TransportPage from './assets/vue/pages/transport.vue';
import ColorThemes from './assets/vue/pages/color-themes.vue';
import Chat from './assets/vue/pages/chat.vue';
import SearchPage from './assets/vue/pages/search.vue';
import Vuex from './assets/vue/pages/vuex.vue';
import InventoryPage from './assets/vue/pages/inventory.vue';
import NoticeBoards from './assets/vue/pages/noticeboards.vue';

export default [
   {
      path: '/',
      component: Home
   },
   {
      path: '/home/',
      component: Home
   },
   {
      path: '/userpanel/',
      component: PanelLeftPage
   },
   {
      path: '/myprofile/',
      component: ProfilePage
   },
   {
      path: '/notifications/',
      component: NotificationPage
   },
   {
      path: '/myaws/',
      component: AWSPage
   },
   {
      path: '/mycourse/',
      component: CoursePage
   },
   {
      path: '/accomodation/',
      component: AccomodationPage
   },
   {
      path: '/canteen/',
      component: CanteenPage
   },
   {
      path: '/inventory/',
      component: InventoryPage
   },
   {
      path: '/myinventory/',
      component: MyInventoryPage
   },
   {
      path: '/timelinepanel/:venue',
      component: PanelTimelinePage
   },
   {
      path: '/whatwherewhen/',
      component: WhatWhereWhenPage
   },
   {
      path: '/booking/',
      component: BookingPage
   },
   {
      path: '/map/',
      component: NCBSMap
   },
   {
      path: '/osm/:arg1/:arg2/:arg3?',
      component: OSM
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
      path: '/noticeboards/',
      component: NoticeBoards
   },
   {
      path: '/vuex/',
      component: Vuex
   },
]
