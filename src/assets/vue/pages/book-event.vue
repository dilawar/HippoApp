<template>
  <f7-page> 
  <f7-navbar title="Booking Events" back-link="Back"></f7-navbar>

  <!-- VENUE POPUP -->
  <f7-popup :opened="popupVenueSelect" @popup:close="popupVenueSelect=false">
    <f7-page>
      <f7-navbar title="Select a venue">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

      <f7-block-title small>
        Available venues:
        {{dbDateTime(thisBooking.startDateTime)}} 
        to {{dbTime(thisBooking.endTime)}}
      </f7-block-title>

      <!-- Fetch venues and show the status. -->
      <f7-block>
        <f7-list media-list>
          <f7-list-item v-for="(venue, key) in venues" 
                        :key="key"
                        @click="onVenueSelected(venue.id)">
            <div slot="header" bg-color="blue">{{venue.note_to_user}}</div>
            <div slot="title">{{venue.name}}</div>
            <div slot="after" v-if="isAvailable(venue)">Available</div>
            <div slot="footer" v-if="venue.BOOKING_STATUS!=='AVAILABLE'">
              {{venue.BOOKING}}
            </div>
            <div slot="header">
              Capacity {{venue.strength}}, Projector {{venue.has_projector}}
            </div>
          </f7-list-item>
        </f7-list>
      </f7-block>
    </f7-page>
  </f7-popup>

  <!-- BOOKING INTERFACE -->
  <f7-block>
    <div v-if="thisEvent.readonly">
      You are booking for an aleady registered event, most likely a 
      TALK/SEMINAR etc. You won't be able to modify
      <tt>TITLE</tt> and <tt>DESCRIPTION</tt> here.
    </div>

    <f7-list media-list>

      <f7-list-group v-if="! thisEvent.readonly">
        <f7-list-input @input="thisEvent.title = $event.target.value"
                     floating-label 
                     label="Title" outline
                     :readonly="thisEvent.readonly"
                     type="textarea" resizable required 
                     :value="thisEvent.title">
        </f7-list-input>

        <f7-list-input :input="false" v-if="! thisEvent.readonly">
          <vue-editor ref="description" 
                      slot="input"
                      placeholder="Description of this talk"
                      v-model="thisEvent.description">
          </vue-editor>
        </f7-list-input>
      </f7-list-group>

      <f7-list-group v-else media-list>
        <f7-list-item header="Title">
          <div slot="text">
            {{thisEvent.class | firstUpper}} by {{thisEvent.speaker}}  on
            '{{thisEvent.title}}'
          </div>
        </f7-list-item>
        <f7-list-item header="Description">
          <div slot="text" v-html="thisEvent.description">
          </div>
        </f7-list-item>
      </f7-list-group>

      <f7-list-group media-list>
        <!-- VENUE AND TIME -->
        <f7-list-input label="Start Date/Time" :input="false">
          <date-picker slot="input" 
                       v-model="thisBooking.startDateTime"
                       placeholder="Select Datetime"
                       type="datetime" 
                       lang="en"
                       format="YYYY-MM-DD hh:mm a" 
                       :minute-step="15">
          </date-picker>
        </f7-list-input>

        <f7-list-input label="End Time" :input="false">
          <date-picker slot="input" 
                       v-model="thisBooking.endTime"
                       placeholder="End time"
                       type="time" 
                       lang="en"
                       format="hh:mm a" 
                       :minute-step="15">
          </date-picker>
        </f7-list-input>

        <!-- FIND A VENUE -->
        <f7-list-item v-if="thisBooking.venue"
                      title="Selected venue" 
                      :after="thisBooking.venue"
                      @click="popupVenueSelect=true">
        </f7-list-item>
        <f7-list-item v-else>
          <f7-button small slot="after" @click="openVenueSelectPopup()">
            Find a venue
          </f7-button>
        </f7-list-item>

        <!-- SUBMIT BUTTON -->
        <f7-list-item>
          <f7-button raised 
                     :disabled="! (isTalkValid.status && isBookingValid.status)" 
                     @click="bookThisEvent()"
                     slot="after">
            {{isBookingValid.msg}}
          </f7-button>
        </f7-list-item>

      </f7-list-group>

    </f7-list>
  </f7-block>
  </f7-page>

</template>

<script>
import moment from 'moment';

export default {
  data() {
    const self = this;
    return {
      venues: self.loadStore('venues'),
      popupVenueSelect: false,
      externalId: self.$f7route.params.externalId,
      thisEvent: {
         type: '' 
        , external_id: self.externalId
        , title: ''
        , description: ''
        , host: ''
        , host_extra: ''
        , coordinator: ''
        , is_public_event: false
        , readonly: false    // when external id is set, make is readonly
      },
      thisBooking: {
        startDateTime: moment().add(1, 'minutes')
        , endTime: moment().add(1, 'hours')
        , external_id: self.externalId
        , title: ''
        , description: ''
        , venue: ''
      },
    };
  },
  watch: {
    'thisBooking.startDateTime': function(val, old) {
      const self = this;
      self.thisBooking.endTime = moment(val).add(1, 'hours');
      self.thisBooking.venue = '';
    },
    'thisBooking.endTime': function(val, old) {
      const self = this;
      self.thisBooking.venue = '';
    },
  },
  mounted: function() {
    const self = this;
    const app = this.$f7;

    if(self.externalId)
    {
      app.dialog.preloader();
      self.postWithPromise('info/externalid/'+self.externalId)
        .then( function(x) {
          // Got the event with given external id
          self.thisEvent = JSON.parse(x.data).data;
          if(self.thisEvent)
          {
            self.thisEvent.type = self.thisEvent['class'];
            self.thisEvent.readonly = true;

            // Update thisBooking before sending to server.
            self.thisBooking.is_public_event = true;
            self.thisBooking.description = self.thisEvent.description;

            // This is most important.
            self.thisBooking.external_id = self.externalId;
            self.thisBooking['class'] = self.thisEvent.type;
            self.thisBooking.title = self.thisEvent.type + ' by ' 
                + self.thisEvent.speaker + " on '" 
                + self.thisEvent.title + "'";
          }
          app.dialog.close();
        });
    }
  },
  computed: {
    isTalkValid: function()
    {
      const self = this;
      if(! self.thisEvent.type || self.thisEvent.type === 'UNKNOWN')
        return {status:false, msg:''};

      if(parseInt(self.thisEvent.speaker_id) < 1)
        return {status:false, msg:'No valid speaker'};

      if(self.thisEvent.title.length < 4)
        return {status:false, msg:'Title too short'};

      if(!(self.thisEvent.host && self.thisEvent.host.includes('@')))
        return {status:false, msg:'Invalid Host/PI'};

      return {status:true, msg:'Save it. I will book later'};
    },
    isBookingValid: function()
    {
      const self = this;
      if(moment(self.thisBooking.startDateTime) <= moment())
        return {status: false, msg: 'Start time is in the past!'};
      if(! self.thisBooking.venue)
        return {status: false, msg: 'No venue selected.'};
      return {status: true, msg: 'BOOK'};
    },
  },
  methods: { 
    searchPeopleURI: function(q, what) {
      const self = this;
      return self.getAPIUrl() + '/search/'+what+'/'+encodeURIComponent(q);
      if(moment(self.thisBooking.startDateTime) <= moment())
        return {status: false, msg: 'Start datetime is in the past!'};
      return {status: true, msg: 'ok'};
    },
    isTalkOrSeminar: function() {
      const self = this;
      if(self.thisEvent.type.includes("TALK"))
        return true;
      if(self.thisEvent.type.includes("SEMINAR"))
        return true;
      return false;
    },
    onVenueSelected: function(venueid)
    {
      const self = this;
      self.thisBooking.venue = venueid;
      console.log('Selected venue is ' + venueid);
      self.popupVenueSelect = false;
    },
    foundSpeakersOnSearch: function(res)
    {
      const self = this;
      self.potentialSpeakers = res.results;
      self.createNewSpeaker = false;
    },
    bookThisEvent: function( )
    {
      const self = this;
      const app = self.$f7;

      console.log('BOOKING', self.thisBooking);

      // Assign the class to talk.
      // console.log("Registering talk.", self.thisEvent);
      app.dialog.preloader();

      // Before sending, change date to str format.
      var args = self.thisBooking.venue + '/' +
        moment(self.thisBooking.startDateTime).format('X') + '/' +
        moment(self.thisBooking.endTime).format('X');

      self.promiseWithAuth('venue/book/'+args, self.thisBooking)
        .then(function(x) {
          app.dialog.close();
          var res = JSON.parse(x.data).data;
          if(! res.success)
            navigator.notification.confirm(res.msg, null, "Failed");
          else
          {
            navigator.notification.confirm("Successfully booked.", null, "Success");
            // Go back
            self.$f7router.navigate('/smartbook/', {ignoreCache:true});
          }
        });
    },
    isAvailable: function(venue)
    {
      if(venue.allowd_booking_on_hippo === 'NO')
        return false;
      if(venue.BOOKING_STATUS !== 'AVAILABLE')
        return false;
      return true;
    },
    openVenueSelectPopup: function() 
    {
      const self = this;
      const app = self.$f7;

      let date = self.dbDate(self.thisBooking.startDateTime);
      let startTime = self.dbTime(self.thisBooking.startDateTime);
      let endTime = self.dbTime(self.thisBooking.endTime);

      app.dialog.preloader();

      self.promiseWithAuth('info/venues/availability/all'
        , {'date':date, 'start_time': startTime, 'end_time': endTime}
      ).then(function(x) {
          self.venues = JSON.parse(x.data).data;
          app.dialog.close();
          self.popupVenueSelect = true;
        });
    },
  },
}; 

</script>
