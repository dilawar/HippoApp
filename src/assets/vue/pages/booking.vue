<template>
  <f7-page page-content @page:init="refreshVenues">
  <f7-navbar title="Book" back-link="Back"></f7-navbar>

  <!-- Date and time -->
  <f7-block>
     <f7-row>
        <f7-col width="60">
           <small>Date and start time</small>
           <date-picker v-model="startDateTime"
                        lang="en"
                        format="MMM DD HH:mm A"
                        :width="150"
                        :time-picker-options="{ start: '8:00', step: '00:15', end: '22:30' }"
                        :minute-step="15"
                        :append-to-body=true
                        :popupStyle="{'z-index':10000}"
                        readonly
                        type="datetime"> 
           </date-picker>
        </f7-col>
        <f7-col width="40">
           <small>End time </small>
           <date-picker v-model="endDateTime" 
                        lang="en"
                        placeholder="Ending time"
                        :width="100"
                        :minute-step="15"
                        :append-to-body=true
                        :time-picker-options="{ start: '8:00', step: '00:15', end: '22:30' }"
                        :popupStyle="{'z-index':10001}"
                        format="HH:mm A"
                        readonly
                        type="time">
           </date-picker>
        </f7-col>
     </f7-row>
     <f7-row>
        <f7-col></f7-col>
        <f7-col>
           <f7-button raised fill @click="refreshVenues" >Filter Venues</f7-button>
        </f7-col>
     </f7-row>
  </f7-block>

  <f7-block-title>Available venues</f7-block-title>
  <f7-list>
     <f7-list-item v-for="(item, index) in venuesFree" 
                   :title="`${item.id}`"
                   :value="`${item.id}`"
                   :key="index"
                   :link="`/book/${item.id}/${startTimeStamp}/${endTimeStamp}/`"
                   after="Book">
        <f7-icon slot="media" ios="f7:info" md="material:info"></f7-icon>
     </f7-list-item>
  </f7-list>
  </f7-block-title>

  <f7-block-title>Occupied venues</f7-block-title>
  <f7-list>
     <f7-list-item v-for="(item, index) in venuesTaken" 
                   :title="`${item.id}`"
                   :header="`${item.events[0].title}`"
                   :footer="`${item.events[0].date}
                   ${item.events[0].start_time} to ${item.events[0].end_time}`"
                   :key="index"
                   >
     </f7-list-item>
  </f7-list>
  </f7-block-title>

  </f7-page-content>
  </f7-page>

</template>

<script>
import moment from 'moment';

export default {
   data() {
      return {
         venuesStatus : [],
         venuesFree: [],
         venuesTaken: [],
         startDateTime: moment(),
         startTimeStamp: moment().format('X'),
         endDateTime: moment().add(60, 'm'),
         endTimeStamp: moment().add(60, 'm').format('X'),
      };
   },
   actions: {
      bookingPopup: function(data) {
         console.log(data);
      },
   },
   watch : {
      startDateTime: function(data){ this.startTimeStamp = moment(data).format('X');}, 
      endDateTime: function(data){ this.endTimeStamp = moment(data).format('X');},
   },
   methods: { 
      refreshVenues: function(data) 
      {
         const self         = this;
         const app          = self.$f7;
         self.isOpen        = false;

         console.log( moment(self.endDateTime).diff(moment(self.startDateTime), 'd') );

         // Try to connect. Convert date to unix-timestamp.
         var link = self.$store.state.api+'/venue/status/all/'
            +self.startTimeStamp+'/'+self.endTimeStamp;

         app.request.post( link, this.apiPostData()
            , function(json) 
            {
               var res = JSON.parse(json);
               if(res.status == 'ok')
               {
                  self.venuesStatus = res.data.venues;
                  self.venuesFree = self.venuesStatus.filter(el=>el.events.length==0);
                  self.venuesTaken = self.venuesStatus.filter(el=>el.events.length>0);
                  self.$localStorage.set('venueIDs', res.data.venues.map(x=>x.id));
               }
            });

      }
   },
}; 

</script>
