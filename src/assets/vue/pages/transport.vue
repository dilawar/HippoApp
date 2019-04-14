<template>
  <f7-page ptr @ptr:refresh="fetchTransportAgain" page-content>

  <f7-navbar title="Transport" back-link="Back"></f7-navbar>


  <!-- Select days buttons. -->
  <f7-block>
     <f7-row>
        <f7-col width="40">
           <f7-button external 
                    color="green" 
                    target="_system"
                    href="https://www.ncbs.res.in/shuttle_trips"
                    ><small>Official Schedule</small>
           </f7-button> 
        </f7-col>
        <f7-col width="30">
           <f7-button color="green" 
                      raised  small
                      href="/osm/liveroute/30/"
                      >Track</f7-button>
        </f7-col>
        <f7-col width="30">
           <f7-button color="green" 
                      raised small
                      @click="trackMe()"
                      :text="tracking?'Stop':'Share'"
                      >
           </f7-button>
        </f7-col>
     </f7-row>
     <f7-row noGap>
        <f7-col noGap v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="'col'+d">
           <f7-button  small
                       :key="d" 
                       :fill="(d==selectedDay)?true:false" 
                       @click="changeDay(d)"
                       > {{d}}
           </f7-button>
        </f7-col>
     </f7-row>
  </f7-block>

  <f7-block accordion-list>
     <f7-list accordion-list no-hairlines>
     <f7-list-item accordion-item 
                   v-for="(route, key) in transport.routes" 
                   :key="key"
            >
            <div slot="title" style="font-size:large;margin-bottom:10px">
               <f7-icon icon="fa fa-map-marker fa-fw"></f7-icon>
               {{route.pickup_point}} to {{ route.drop_point }}
            </div>
            <span slot="footer"> {{ nextTrip(route) }}</span>

           <f7-accordion-content>

              <f7-list media-list inner>
              <f7-list-item v-for="(t, key) in thisRouteTimetable(route)"
                            :key="key"
                            style='margin-top:-1ex;padding:-1px'
                            >
                   <div slot="title">
                      {{str2Moment(t.trip_start_time, 'HH:mm:ss').format('hh:mm A')}}
                   </div>
                  <f7-icon slot="media"
                     :icon="transportIcon(t.vehicle,t.trip_start_time,t.day)">
                  </f7-icon>

                  <span slot='after' v-if="upcomingTrip(t)">
                    {{ str2Moment(t.trip_start_time, 'HH:mm:ss').fromNow() }}
                 </span>

                 <div slot="after"  v-if="t.url">
                    <f7-link @click="routeMap(t.url)">Route</f7-link>
                 </div>
              </f7-list-item>
           </f7-list>

        </f7-accordion-content>

     </f7-list-item>
     </f7-list>

  </f7-block>

  <!-- FAB
  <f7-fab position="right-bottom" fab-extended color="green">
     <f7-icon icon="fa fa-map-marker fa-2x"></f7-icon>
     <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
     <f7-fab-buttons position="left">
        <f7-fab-button  extended
                        fab-close 
                        tooltip="NCBS to Mandara"
                        @click="routeFromTo('NCBS', 'Mandara')"
                        >
                        <small>N→M</small>
        </f7-fab-button>
        <f7-fab-button tooltip="Mandara to NCBS"
                       fab-close
                       @click="routeFromTo('Mandara', 'NCBS')"
                       >
              <small>M→N</small>
        </f7-fab-button>
        <f7-fab-button fab-close
                       @click="routeFromTo('NCBS', 'IISc')"
                       tooltip="NCBS to IISc"
                       >
                       <small>N→I</small>
        </f7-fab-button>
        <f7-fab-button fab-close
                       @click="routeFromTo('IISc', 'NCBS')"
                       tooltip="IISc to NCBS"
                       >
              <small>I→N</small>
        </f7-fab-button>
     </f7-fab-buttons>
  </f7-fab>
  -->

  <f7-block v-if="! tracking" style="align:bottom">
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
         today: moment().format('ddd'),
         pickup: self.loadStoreStr('lastPickup') || 'NCBS',
         drop : self.loadStoreStr('lastDrop') || 'Mandara',
         nowTime: moment(),
         selectedDay: moment().format('ddd'),
         transport: [],
         thisTimetable: [], 
         popupOpened: false,
         // This goes onto a poup showing route map.
         thisRouteMap: '<p>No route found.</p>',
         tracking: self.loadStore('tracking'), 
         watchID: null,
      };
   },
   mounted: function() {
      const self = this;
      self.transport = self.loadStore('transport');
      // If nothing found then only fetch. LAZY.
      if(self.transport.timetable.length == 0)
         self.fetchTransport();
      self.filterTransport();
   },
   methods: { 
      upcomingTrip: function(t) {
         const self = this;
         if(t.day.toLowerCase() === self.today.toLowerCase())
            if(self.str2Moment(t.trip_start_time, 'HH:mm:ss') >= self.str2Moment())
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

         if(self.isUpcomingTrip(startTime, day))
            icon += ' fa-spin fa-pulse fa-2x';

         icon += ' fa-fw';
         return icon;
      },
      isUpcomingTrip: function(startTime, day)
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
      filterTransport: function()
      {
         const self = this;
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
         self.postWithPromise('/transport').then(
            function(json)
            {
               var res = JSON.parse(json);
               // to make sure it triggers the rendering.
               if(res.status == "ok")
               {
                  self.transport = res.data;
                  self.saveStore('transport', res.data);
                  self.filterTransport();
               }
               else
               {
                  console.log("Failed to fetch transport.");
                  self.transport = self.loadStore("transport");
               }
            }
         );
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
      trackMe: function() {
         const self = this;
         const app = self.$f7;

         self.tracking = ! self.tracking;
         self.saveStore('tracking', self.tracking);

         if(self.tracking) 
         {
            self.watchID = navigator.geolocation.watchPosition( 
               function(pos) {
                  self.sendCoordinates('/geolocation/submit', pos.coords);
               }
               , function() { console.log( 'error'); }
               , { enableHighAccuracy : true }
            );

            // Do not track more than 45 mins.
            setTimeout(() => {
               if(self.watchID)
                  navigator.geolocation.clearWatch(self.watchID);
               self.tracking = false;
               self.saveStore('tracking', self.tracking);
               }, 1000*60*45);
         }
         else 
         {
            self.tracking = false;
            navigator.geolocation.clearWatch(self.watchID);
            self.saveStore('tracking', self.tracking);
         }
      },
   },
};

</script>
