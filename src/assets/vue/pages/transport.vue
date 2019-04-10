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

  <f7-block>
     <f7-block-title small>
        <f7-icon icon="fa fa-map-marker fa-fw"></f7-icon> {{pickup}} to {{drop}} 
        <span style="font-size:11px;float:right;color">
        <f7-link external color="green" href="https://www.ncbs.res.in/shuttle_trips">Official
           Schedule</f7-link> </span>
     </f7-block-title>

     <f7-row noGap v-for="ri in 1+Math.floor(currentTransport.length/3)" :key="ri">
        <f7-col style="margin-bottom:4px"
                v-for="(val,item) in currentTransport.slice(3*ri,3*(ri+1))" :key="'col'+ri+item"
                >
                <f7-button  v-if="val.url"
                            @click="routeMap(val.url)"
                            raised
                            :icon="transportIcon(val.vehicle,val.trip_start_time,val.day)"
                            :text="`${str2Moment(val.trip_start_time,'HH:mm:ss').format('HH:mm')}`"
                            >
                </f7-button>
                <f7-button v-else
                           :icon="transportIcon(val.vehicle,val.trip_start_time,val.day)"
                           :text="`${str2Moment(val.trip_start_time,'HH:mm:ss').format('HH:mm')}`"
                           >
                </f7-button>
        </f7-col>
     </f7-row>

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
      const ls = this.$localStorage;
      return {
         pickup: ls.get('lastPickup') || 'NCBS',
         drop : ls.get('lastDrop') || 'Mandara',
         nowTime: moment(),
         selectedDay: moment().format('ddd'),
         transport: [],
         currentTransport: [], 
         popupOpened: false,
         // This goes onto a poup showing route map.
         thisRouteMap: '<p>No route found.</p>',
      };
   },
   mounted: function() {
      const self = this;
      self.transport = JSON.parse(self.$localStorage.get('transport', '[]'));
      if(self.transport.length == 0)
      {
         self.fetchTransport();
         setTimeout( () => {
            self.filterTransport( );
            self.routeFromTo(self.pickup, self.drop);
         }, 2000);
      }
      else
      {
         self.filterTransport();
         self.routeFromTo(self.pickup, self.drop);
      }
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
         var day = self.selectedDay;
         self.currentTransport = self.transport.filter(x => 
            x.day.toLowerCase() == day.toLowerCase() && 
            x.pickup_point.toLowerCase() == self.pickup.toLowerCase() && 
            x.drop_point.toLowerCase() == self.drop.toLowerCase()
         );
      },
      routeFromTo: function(pickup, drop)
      {
         const self = this;
         self.pickup = pickup;
         self.drop = drop;
         self.$localStorage.set('lastPickup', self.pickup);
         self.$localStorage.set('lastDrop', self.drop);
         // Change currentTransport else DOM won't render
         self.filterTransport( );
      },
      changeDay: function(data) {
         const self = this;
         self.selectedDay = data;
         // Change currentTransport else DOM wont change 
         self.filterTransport( );
      },
      fetchTransportAgain: function(event, done) {
         const self = this;
         setTimeout( () => {
            self.fetchTransport();
            done();
            }, 1000
         );
      },
      fetchTransport: function( ) 
      {
         const self         = this;
         const app          = self.$f7;
         var link = self.$store.state.api+'/transport';
         app.request.post(link, this.apiPostData(),
            function(json)
            {
               var res = JSON.parse(json);
               // to make sure it triggers the rendering.
               if(res.status == 'ok')
               {
                  console.log('Got transport data from: ' + link);
                  self.transport = res.data;
                  self.$localStorage.set('transport', JSON.stringify(res.data));
               }
               else
                  app.dialog.alert('Failed to fetch transport data', res.status);
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
