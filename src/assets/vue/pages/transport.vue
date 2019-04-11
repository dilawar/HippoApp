<template>
   <!-- TODO: On schedule click. Open a right panel and show the route -->
  <f7-page ptr @ptr:refresh="fetchTransportAgain" page-content>
  <f7-navbar title="Transport" back-link="Back"></f7-navbar>

  <!-- Popup for route -->
  <f7-popup :opened="popupOpened" @popup:closed="popupOpened = false">
     <f7-page page-content>
        <f7-navbar title="Route Map">
           <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
           </f7-nav-right>
        </f7-navbar>
           <meta http-equiv="Content-Security-Policy" content="default-src *;" >
           </meta>
            <div class="google-maps">
               <iframe :src="`${thisRouteMap}`"> </iframe>
           </div>
     </f7-page>
  </f7-popup>

  <!-- Select days buttons. -->
  <f7-block>
     <f7-row noGap v-model="selectedDay">
        <f7-col v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="'col'+d">
           <f7-button  small
              :key="d" :fill="(d==selectedDay)?true:false" 
              @click="changeDay(d)"> 
              <font><small>{{d}}</small></font>
           </f7-button>
        </f7-col>
     </f7-row>
  </f7-block>

  <f7-block inner accordion-list>
     <f7-block-title small>
        <f7-link external 
                 style="float:right"
                 color="green" 
                 target="_system"
                 href="https://www.ncbs.res.in/shuttle_trips"
                 >
                 Official Schedule
        </f7-link> 
     </f7-block-title>

     <f7-accordion-item
                   v-for="(route, key) in transport.routes"
                   :key="key"
                   :title="route.pickup_point + ' to ' + route.drop_point"
                   >
           <f7-accodion-toggle> Item {{key}} </f7-accodion-toggle>
           <f7-accordion-content>
              <f7-list>
              <f7-list-item v-for="(t, key) in thisTimetable"
                            :key="key"
                            :title="`${str2Moment(t.trip_start_time, 'HH:mm:ss').format('HH:mm')}`"
                            >
                  <!--
                  <f7-icon slot="media"
                     :icon="transportIcon(t.vehicle,t.trip_start_time,t.day)">
                  </f7-icon>

                 <div slot="header"  v-if="t.day.toLowerCase() === today.toLowerCase()" >
                    <span v-if="str2Moment(t.trip_start_time, 'HH:mm:ss') > str2Moment()"> 
                       {{ str2Moment(t.trip_start_time, 'HH:mm:ss').fromNow() }}
                    </span>
                 </div>
                  -->
              </f7-list-item>
           </f7-list>
        </f7-accordion-content>
     </f7-accordion-item>

  </f7-block>

  <!-- FAB: Floating button for picking routes. -->
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
      };
   },
   mounted: function() {
      const self = this;
      self.transport = self.loadStore('transport');

      // If nothing found then only fetch. LAZY.
      if(self.transport.timetable.length == 0)
         self.fetchTransport();

      self.routeFromTo(self.pickup, self.drop);
   },
   methods: { 
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
         self.thisTimetable = [];
         for(let k in self.transport.timetable)
         {
            let x = self.transport.timetable[k];
            if( (x.day.toLowerCase() === self.selectedDay.toLowerCase()) && 
               (x.pickup_point.toLowerCase() === self.pickup.toLowerCase()) && 
               (x.drop_point.toLowerCase() === self.drop.toLowerCase()))
            {
               self.thisTimetable.push(x);
            }
         }
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
      fetchTransportAgain: function(event, done) {
         const self = this;
         self.fetchTransport();
         done();
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
               if(res.status == 'ok')
               {
                  self.transport = res.data;
                  self.saveStore('transport', res.data);
                  self.filterTransport();
               }
               else
               {
                  console.log('Failed to fetch transport.');
                  self.transport = self.loadStore('transport');
               }
            }
         );
      },
      routeMap: function(url) {
         const self = this;
         self.thisRouteMap = url;
         console.log( 'Showing route from ', url );
         self.popupOpened = true;
      },
   },
};

</script>
