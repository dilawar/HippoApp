import Home from './assets/vue/pages/home.vue';
import NotificationPage from './assets/vue/pages/notifications.vue';
import AccomodationPage from './assets/vue/pages/accomodation.vue';
import CanteenPage from './assets/vue/pages/canteen.vue';
import AWSPage from './assets/vue/pages/myaws.vue';
import AWSEditPage from './assets/vue/pages/aws_edit.vue';
import JCPage from './assets/vue/pages/myjc.vue';
import MyCoursePage from './assets/vue/pages/mycourse.vue';
import PanelLeftPage from './assets/vue/pages/panel-left.vue';
import PanelRightPage from './assets/vue/pages/panel-right.vue';
import WhatWhereWhenPage from './assets/vue/pages/whatwherewhen.vue';
import FormPage from './assets/vue/pages/form.vue';

import BookingPage from './assets/vue/pages/booking.vue';
import SmartBookingPage from './assets/vue/pages/smartbook.vue';
import RegisterEventWithSpeaker from './assets/vue/pages/event-with-speaker.vue';

import BookEvent from './assets/vue/pages/book-event.vue';
import MyBookingPage from './assets/vue/pages/mybooking.vue';
import MyInventoryPage from './assets/vue/pages/myinventory.vue';
import EventPage from './assets/vue/pages/events.vue';
import UpdateTalkPage from './assets/vue/pages/updatetalk.vue';

import InfoPage from './assets/vue/pages/info.vue';

import TravelPage from './assets/vue/pages/travel.vue';
import NCBSMap from './assets/vue/pages/map.vue';
import OSM from './assets/vue/pages/osm.vue';
import TransportPage from './assets/vue/pages/transport.vue';
import ColorThemes from './assets/vue/pages/color-themes.vue';
import SearchPage from './assets/vue/pages/search.vue';
import Vuex from './assets/vue/pages/vuex.vue';
import InventoryPage from './assets/vue/pages/inventory.vue';
import NoticeBoards from './assets/vue/pages/noticeboards.vue';
import Email from './assets/vue/pages/email.vue';

// Common profile page.
import ProfilePage from './assets/vue/pages/profile.vue';

// BMV ADMIN
import BmvBookingRequests from './assets/vue/pages/bmv_booking_requests.vue';
import BmvEvents from './assets/vue/pages/bmv_events.vue';
import BmvVenues from './assets/vue/pages/venues.vue';

// ACAD ADMIN 
import AcadAdminAWSRoster from './assets/vue/pages/acad_aws_roster.vue';
import AcadAdminAWS from './assets/vue/pages/acad_aws.vue';
import AcadAdminAllAWS from './assets/vue/pages/acad_allaws.vue';
import AcadAdminCourses from './assets/vue/pages/acad_courses.vue';
import AcadAdminJC from './assets/vue/pages/acad_jc.vue';
import UpdateCoursePage from './assets/vue/pages/updatecourse.vue';
import CourseFeedbackPage from './assets/vue/pages/acad_courses_feedback.vue';
import AdminManageTalks from './assets/vue/pages/admin_manages_talks.vue';
import AdminManageSpeaker from './assets/vue/pages/admin_manages_speakers.vue';

// Service Admin
import ServiceAdminTransport from './assets/vue/pages/service_transport.vue';

// Admin
import AdminHolidays from './assets/vue/pages/admin_holidays.vue';
import AdminEmailTemplates from './assets/vue/pages/admin_email_template.vue';
import AdminManagesPeople from './assets/vue/pages/admin_people.vue';
import AdminHippoConfig from './assets/vue/pages/admin_config.vue';

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
      path: '/adminpanel/',
      component: PanelRightPage
   },
   {
      path: '/bmvadmin/bookingrequests/',
      component: BmvBookingRequests
   },
   {
      path: '/bmvadmin/events/',
      component: BmvEvents
   },
   {
      path: '/updatetalk/:talkid/',
      component: UpdateTalkPage
   },
   {
      path: '/email/:table/:id',
      component: Email
   },
   {
      path: '/updatecourse/:courseid/',
      component: UpdateCoursePage
   },
   {
      path: '/coursefeedback/:year/:semester/:cid?',
      component: CourseFeedbackPage
   },
   {
      path: '/acadadmin/aws/',
      component: AcadAdminAWS
   },
   {
      path: '/acadadmin/allaws/',
      component: AcadAdminAllAWS
   },
   {
      path: '/acadadmin/awsroster/',
      component: AcadAdminAWSRoster
   },
   {
      path: '/acadadmin/jc/',
      component: AcadAdminJC
   },
   {
      path: '/acadadmin/courses/',
      component: AcadAdminCourses
   },
   {
      path: '/admin/talks/',
      component: AdminManageTalks 
   },
   {
      path: '/admin/speaker/:action/:speakerid',
      component: AdminManageSpeaker 
   },
   {
      path: '/serviceadmin/transport/',
      component: ServiceAdminTransport
   },
   {
      path: '/profile/:login',
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
      path: '/awsedit/:awsid/:isupcoming',
      component: AWSEditPage
   },
   {
      path: '/myjc/',
      component: JCPage
   },
   {
      path: '/mycourse/',
      component: MyCoursePage
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
      path: '/whatwherewhen/',
      component: WhatWhereWhenPage
   },
   {
      path: '/booking/',
      component: BookingPage
   },
   {
      path: '/smartbook/',
      component: SmartBookingPage
   },
   {
      path: '/register-event-with-speaker/:eventType',
      component: RegisterEventWithSpeaker
   },
   {
      path: '/bookevent/:externalId/:evType',
      component: BookEvent
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
      path: '/search/',
      component: SearchPage
   },
   {
      path: '/noticeboards/:boardName',
      component: NoticeBoards
   },
   {
      path: '/admin/holidays',
      component: AdminHolidays
   },
   {
      path: '/admin/emailtemplate',
      component: AdminEmailTemplates
   },
   {
      path: '/admin/people',
      component: AdminManagesPeople
   },
   {
      path: '/admin/venues',
      component: BmvVenues
   },
   {
      path: '/admin/config',
      component: AdminHippoConfig
   },
   {
      path: '/info/:what',
      component: InfoPage
   },
]
