<template>
   <f7-page ptr @ptr:refresh="fetchTransportAgain" 
            @page:beforein="pageBeforeIn"
            @page:afterin="pageAfterIn"
            page-content>
  <f7-navbar title="Transport" back-link="Back"></f7-navbar>

  <f7-fab position="right-bottom" slot="fixed" color="green" href="/osm/liveroute/60">
     <f7-icon icon="fa fa-map fa-2x"></f7-icon>
  </f7-fab>

  <f7-link external 
           target="_system"
           style="float:right"
           href="https://www.ncbs.res.in/shuttle_trips">
    <small>Official Schedule</small>
  </f7-link> 

  <!-- Select days buttons. -->
  <f7-block>
  <f7-row no-gap>
    <f7-col no-gap v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="'col'+d">
      <f7-button small :key="d" :fill="(d==selectedDay)?true:false" @click="changeDay(d)"> 
        {{d}}
      </f7-button>
    </f7-col>
  </f7-row>
  </f7-block>

  <!-- List of transport. -->
  <f7-block inset>
  <f7-list media-list accordion-list no-hairlines class="display-block">
    <f7-row style="list-style-type:none">
       <f7-list-item accordion-item 
                     v-for="(route, key) in transport.routes" 
                     class="col-100 medium-50" 
                     :key="key">
         <div slot="title">
           {{route.pickup_point}} to {{ route.drop_point }}
         </div>
         <span slot="footer"> {{ nextTrip(route) }}</span>
         <f7-accordion-content>
           <f7-list media-list>
             <f7-list-item v-for="(t, key) in thisRouteTimetable(route)"
                           :key="key" v-if="isUpcomingTrip(t)">
               <div slot="title">
                 {{str2Moment(t.trip_start_time, 'HH:mm:ss').format('hh:mm A')}}
               </div>
               <f7-icon slot="media"
                        :icon="transportIcon(t.vehicle,t.trip_start_time,t.day)">
               </f7-icon>
               <span slot='after' v-if="isUpcomingTrip(t)">
                 {{str2Moment(t.trip_start_time, 'HH:mm:ss').fromNow()}}
               </span>
             </f7-list-item>
           </f7-list>
         </f7-accordion-content>
     </f7-list-item>
    </f7-row>
  </f7-list>
  </f7-block>

  <f7-block v-if="! tracking === 'Stop'" style="align:bottom">
  <div>If you are inside a vehicle, click on <tt>TRACK</tt> button to anonymously
     share you location. We use it to display live location and create routes.
  </div>
  </f7-block>
</f7-page>
</template>

<script>
import moment from 'moment'

export default {
  data() {
    const self = this;
    return {
      thisDay: moment().format('ddd'),
      pickup: self.loadStoreStr('lastPickup') || 'NCBS',
      drop : self.loadStoreStr('lastDrop') || 'Mandara',
      nowTime: moment(),
      selectedDay: moment().format('ddd'),
      transport: [],
      thisTimetable: [], 
      popupOpened: false,
      // This goes onto a poup showing route map.
      thisRouteMap: '<p>No route found.</p>',
      tracking: (self.loadStoreStr('tracking') === '')?'Start':'Stop', 
    };
  },
  mounted: function() {
    const self = this;
    self.fetchTransport();
  },
  methods: { 
    isUpcomingTrip: function(t) {
      const self = this;
      console.log('x', t.day, self.thisDay );
      if(t.day.toLowerCase() === self.thisDay.toLowerCase())
        if(self.str2Moment(t.trip_start_time, 'HH:mm:ss') >= self.str2Moment())
          return true;
      if(self.str2Moment(t.day,"ddd") > self.str2Moment(self.thisDay,"ddd"))
        return true;
      return false;
    },
    transportIcon: function(vehicle, startTime, day) {
      const self = this;
      var icon = 'fa ';
      vehicle = vehicle.toLowerCase();
      if(vehicle == 'shuttle')
        icon += ' fa-bus'
      else if(vehicle == 'buggy')
        icon += ' fa-bug';
      else
        icon += ' fa-bus';

      if(self.isNextTrip(startTime, day))
        icon += ' fa-spin fa-pulse fa-2x';

      icon += ' fa-fw';
      return icon;
    },
    isNextTrip: function(startTime, day)
    {
      const self = this;
      if( self.selectedDay != day )
        return false;
      var tt = moment(startTime, 'HH:mm:ss');
      var now = moment();
      var minutesToLeave = tt.diff(now, 'minutes');
      if(minutesToLeave > 0 && minutesToLeave < 30)
        return true;
      return false;
    },
    filterTransport: function() {
      const self = this;
      if(! self.transport.hasOwnProperty('timetable'))
        return;
      let d = self.transport.timetable[self.selectedDay.toLowerCase()];
      if(d)
        d = d[self.pickup.toLowerCase()];
      if(d)
        d = d[self.drop.toLowerCase()];
      self.thisTimetable = Object.values(d);
    },
    routeFromTo: function(pickup, drop)
    {
      const self = this;
      self.pickup = pickup;
      self.drop = drop;
      self.saveStoreStr('lastPickup', self.pickup);
      self.saveStoreStr('lastDrop', self.drop);
      // Change timetable else DOM won't render
      self.filterTransport( );
    },
    changeDay: function(data) {
      console.log('Changing day ', data);
      const self = this;
      self.selectedDay = data;

      // Change timetable else DOM wont change 
      self.filterTransport( );
    },
    fetchTransportAgain: function( ) {
      const self = this;
      self.fetchTransport();
      self.$f7.ptr.done();
    },
    fetchTransport: function( ) 
    {
      const self         = this;
      const app          = self.$f7;
      app.preloader.show();
      self.postWithPromise('/transport').then(function(x) {
        var res = JSON.parse(x.data);
        // to make sure it triggers the rendering.
        self.transport = res.data;
        self.saveStore('transport', res.data);
        self.filterTransport();
        app.preloader.hide();
      });
      setTimeout(() => app.preloader.hide(), 5000);
    },
    routeMap: function(url) {
      const self = this;
      self.thisRouteMap = url;
      self.popupOpened = true;
    },
    thisRouteTimetable: function(route) {
      const self = this;
      let d = self.transport.timetable[self.selectedDay.toLowerCase()];
      if(d)
        d = d[route.pickup_point.toLowerCase()];
      if(d) 
        d = d[route.drop_point.toLowerCase()];
      return Object.values(d);
    },
    nextTrip: function(route) {
      const self = this;

      let thisTimeTable = self.thisRouteTimetable(route);
      let nextTrip = null;
      for(let k in thisTimeTable)
      {
        let x = thisTimeTable[k];
        let t = self.str2Moment(x.day + ' ' + x.trip_start_time, 'ddd HH:mm:ss');
        if( t > moment())
        {
          nextTrip = t
          break;
        }
      }
      if(nextTrip)
        return 'Next trip ' + nextTrip.fromNow();
      return 'All trips are over!';
    },
    trackMe: function()
    {
      const self = this;
      const app = self.$f7;

      if(self.tracking === 'Start') 
      {
        BackgroundGeolocation.configure({
          locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
          //locationProvider: BackgroundGeolocation.RAW_PROVIDER,
          desiredAccuracy: BackgroundGeolocation.LOW_ACCURACY,
          stationaryRadius: 10,
          distanceFilter: 30,
          notificationTitle: 'Background Tracking',
          notificationText: 'enabled',
          debug: false,
          interval: 10000,
          fastestInterval: 5000,
          activitiesInterval: 10000,
        });

        BackgroundGeolocation.start();
        BackgroundGeolocation.on('location', function(loc) {
          self.sendCoordinates('/geolocation/submit', loc);
        });

        // When successful, flip the button text.
        self.tracking = 'Stop';
      }
      else 
      {
        self.saveStoreStr('tracking', self.tracking);
        BackgroundGeolocation.removeAllListeners();
        console.log( 'Switching off location tracking.');
        self.tracking = 'Start';
      }
    },
    showRoute: function() {
      console.log( "Show me this route" );
    },
  },
};

</script>
