<template>

  <f7-page @page:init="refreshVenues">
  <f7-navbar title="Booking" back-link="Back"></f7-navbar>

  <!--  Show venues as grid or list. -->
  <f7-page-content>


    <!-- Date and time -->
    <f7-list simple-list>
      <f7-list-item>
        <f7-list-item-cell>
          <date-picker v-model="bookingDateTime" lang="en"
                       value-type="date"
                       format="MMM DD hh:mm A"
                       :time-picker-options="{ start: '8:00', step: '00:15', end: '22:30' }"
                       :minute-step="15"
                       :append-to-body=true
                       :popupStyle="{'z-index':10000}"
                       type="datetime"
                       > 
          </date-picker>
        </f7-list-item-cell>
        <f7-list-item-cell>
          <f7-range :min="0.25" :max="8" :step="0.5" :value="1" :label="true"></f7-range>
        </f7-list-item-cell>
      </f7-list-item>
      <f7-list-item>
        <f7-list-item-cell>
          <f7-button raised fill @click="refreshVenues" >Filter Venues</f7-button>
        </f7-list-item-cell>
      </f7-list-item>
    </f7-list>

    <f7-block-title>Free venues</f7-block-title>
    <f7-list>
      <f7-list-item v-for="(item, index) in venuesFree" :title="`${item.id}`">
      </f7-list-item>
    </f7-list>
    </f7-block-title>

  </f7-page-content>
</f7-page>

</template>

<script>

export default {
  data() {
    return {
      venuesStatus : [],
      venuesFree: [],
      venuesTaken: [],
      bookingDateTime: self.Date()
    };
  },
  methods: {
    bookingButton: function(data) {
      console.log(data);
    },
    refreshVenues : function(data) {

      const self         = this;
      const app          = self.$f7;
      const thisDateTime = new Date(self.bookingDateTime);
      const date         = self.dbDate(thisDateTime);
      const time         = self.dbTime(thisDateTime);
      self.isOpen        = false;

      // Try to connect.
      app.request.post(
          self.$store.state.api+'/venue/status/all/'+date+'/'+time
          , { 'HIPPO-API-KEY': self.$localStorage.get('HIPPO-API-KEY')
          , 'login': self.$localStorage.get('HIPPO-LOGIN') 
          }, 
        function(json) {
          var res = JSON.parse(json);
          console.log(res);
          if(res.status == 'ok')
          {
            self.venuesStatus = res.data.venues;
            self.venuesFree = self.venuesStatus.filter(el=>el.events.length==0);
            self.venuesTaken = self.venuesStatus.filter(el=>el.events.length>0);
          }
        });
    }
  },
}; </script>
