<template>

  <f7-page @page:init="refreshVenues">
  <f7-navbar title="Venues" back-link="Back"></f7-navbar>

  <!--  Show venues as grid or list. -->
  <f7-page-content>

    <!-- Date and time -->
    <f7-list simple-list>
      <f7-list-item>
        <f7-list-item-cell>
          <date-picker v-model="startDateTime" lang="en"
                       format="MMM DD HH:mm A"
                       :time-picker-options="{ start: '8:00', step: '00:15', end: '22:30' }"
                       :minute-step="15"
                       :append-to-body=true
                       :popupStyle="{'z-index':10000}"
                       type="datetime"> 
          </date-picker>
        </f7-list-item-cell>
        <f7-list-item-cell>
          <date-picker v-model="endDateTime" lang="en"
                       placeholder="Ending time"
                       :time-picker-options="{ start: '8:00', step: '00:15', end: '22:30' }"
                       :append-to-body=true
                       :popupStyle="{'z-index':10000}"
                       format="HH:mm A"
                       type="time">
          </date-picker>
        </f7-list-item-cell>
      </f7-list-item>
      <f7-list-item>
        <f7-list-item-cell>
          <f7-button raised fill @click="refreshVenues" >Filter Venues</f7-button>
        </f7-list-item-cell>
      </f7-list-item>
    </f7-list>

    <f7-block-title>Available venues</f7-block-title>
    <f7-list>
      <f7-list-item v-for="(item, index) in venuesFree" 
                    :title="`${item.id}`"
                    :value="`${item.id}`"
                    :key="index"
                    :link="`/book/${item.id}/${startDateTime}/${endDateTime}//`"
                    after="Book">
        <f7-icon slot="media" ios="f7:info" md="material:info"></f7-icon>
      </f7-list-item>
    </f7-list>
    </f7-block-title>

    <f7-block-title>Occupied venues</f7-block-title>
    <f7-list>
      <f7-list-item v-for="(item, index) in venuesTaken" 
                    :title="`${item.id}`"
                    :footer="`${item.events[0].title}`"
                    :key="index"
                    after="Add to calendar"
        >
      </f7-list-item>
    </f7-list>
    </f7-block-title>

  </f7-page-content>
</f7-page>

</template>

<script>
import moment from 'moment';
//moment.defaultFormat = "DD-MM-YYYY HH:mm";

export default {
  data() {
    return {
      venuesStatus : [],
      venuesFree: [],
      venuesTaken: [],
      startDateTime: moment(),
      endDateTime: moment().add(60, 'm')
    };
  },
  actions: {
    bookingPopup: function(data) {
      console.log(data);
    },
  },
  watch: {
    startDateTime: function(data) {
      if(this.endDateTime < this.startDateTime)
        this.endDateTime = moment(data).add(60, 'm').format('x');
    }
  },
  methods: {
    bookingButton: function(data) {
      console.log(data);
    },
    refreshVenues: function(data) {
      const self         = this;
      const app          = self.$f7;
      self.isOpen        = false;

      // Try to connect.
      app.request.post(
        self.$store.state.api+'/venue/status/all/'+self.dbDateTime(self.startDateTime)+'/'+self.dbDateTime(self.endDateTime)
        , { 'HIPPO-API-KEY': self.$localStorage.get('HIPPO-API-KEY')
          , 'login': self.$localStorage.get('HIPPO-LOGIN') 
        }, 
        function(json) {
          var res = JSON.parse(json);
          if(res.status == 'ok')
          {
            self.venuesStatus = res.data.venues;
            self.venuesFree = self.venuesStatus.filter(el=>el.events.length==0);
            self.venuesTaken = self.venuesStatus.filter(el=>el.events.length>0);
            self.$localStorage.set('venueIDs', res.data.venues.map(x=>x.id));
          }
        });
      
      // Fetch classes of booking.
      app.request.post( self.$store.state.api+'/config/bookmyvenue.class'
        , this.apiPostData()
        , function(json) {
          const res = JSON.parse(json);
          if( res.status=='ok')
            self.$localStorage.set('classes', res.data.value);
        });
    }
  },
}; </script>
