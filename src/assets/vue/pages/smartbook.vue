<template>
  <f7-page>
  <f7-navbar title="Book a venue" back-link="Back"></f7-navbar>

  <!-- SPEAKER POPUP -->
  <!-- POPUP  -->
  <f7-popup :opened="openSpeakerPopup" @popup:close="openSpeakerPopup = false">
    <f7-page>
      <f7-navbar title="Add new speaker">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

    <!-- Once the CLASS is known, expand the speaker card. -->
    <f7-block-title small>Your search was futile. 
      Add a new speaker now.</f7-block-title>
    <f7-block>
    <f7-list no-hairlines>
      <f7-list-input :input="false"
             label="Email">
        <input :value="thisSpeaker.email" 
             slot="input"
             type="email" required
             @change="thisSpeaker.email=$event.target.value"
             />
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.name" 
              required
              @change="thisSpeaker.name = $event.target.value"
              label="Name">
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.homepage"
             type="url" 
             @change="thisSpeaker.homepage = $event.target.value"
             label="Homepage">
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.department"
              @change="thisSpeaker.department = $event.target.value"
              label="Department">
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.institute"
             type="text"
             required
             @change="thisSpeaker.institute = $event.target.value"
             label="Institute">
      </f7-list-input>
    </f7-list>
    <f7-row>
      <f7-col></f7-col>
      <f7-col>
        <f7-button panel-close raised
                   @click="submitSpeaker(thisSpeaker)">
          Add Speaker
        </f7-button>
      </f7-col>
    </f7-row>
    </f7-block>

    </f7-page>
  </f7-popup>


  <f7-block>
    <f7-list no-hairlines>
      <!-- Ask user for what purpose they are booking -->
      <f7-list-item title="Type of event?"
                    smart-select
                    @smartselect:closed="onEventTypeSelection()"
                    :smart-select-params="{openIn:'popup', searchbar: true, closeOnSelect:true, searchbarPlaceholder:'Search Class'}">
        <select @change="thisEvent.type = $event.target.value"
                    :value="thisEvent.type">
          <option v-for="(cls, key) in classes.all" 
                  :key="key" 
                  :value="cls">
          {{cls}}
          </option>
        </select>
      </f7-list-item>
    </f7-list>

    <f7-list v-if="isTalkOrSeminar()">
      <!-- SPEAKER -->
      <f7-list-input :input="false">
        <v-autocomplete  slot="input"
                         placeholder="Search for speaker"
                         inputClass="item-input-wrap"
                         results-property="email"
                         results-display="name"
                         :request-headers="apiPostData()"
                         method="post"
                         @selected="onSpeakerSelected"
                         @results="foundSpeakersOnSearch"
                         @noResults="createNewSpeaker=true"
                         :source="searchSpeakerURI">
        </v-autocomplete>
      </f7-list-input>
      <f7-list-item v-if="parseInt(thisSpeaker.id) > 0">
        <!-- <div slot="header">Found speaker id: {{thisSpeaker.id}} </div> -->
        <div slot="header" v-html="thisSpeaker.html"></div>
        <f7-link slot="footer" @click="openSpeakerPopup=true" >Update</f7-link>
      </f7-list-item>
      <f7-list-item v-if="createNewSpeaker">
        <div slot="header">No one is found..</div>
        <f7-button small raised
                   @click="openSpeakerPopup=true"
          > Add new Speaker </f7-button>
      </f7-list-item>

      <!-- Talk tile and description -->
      <f7-list-input v-if="parseInt(thisTalk.speaker_id) > 0"
                     @input="thisTalk.title = $event.target.value"
                     label="Title"
                     type="textarea" resizable required 
                     :value="thisTalk.title">
      </f7-list-input>

    </f7-list>
  </f7-block>
  </f7-page>

</template>

<script>
import moment from 'moment';

export default {
  data() {
    return {
      classes: [],
      venues: [], 
      potentialSpeakers: [],
      openSpeakerPopup: false,
      thisEvent: { type: 'TALK' },
      createNewSpeaker: false,
      thisSpeaker: {
        id: '-1',
        honorific: '',
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        designation: '',
        homepage: '',
        department: '',
        institute: '',
      },
      thisTalk: {
        speaker_id: '1'
        , title: ''
        , description: ''
      },
      thisBooking: {
        date: ''
        , time: ''
        , venue: ''
      },
    };
  },
  actions: {
    bookingPopup: function(data) {
      console.log('popup');
    },
  },
  watch : {
    startDateTime: function(data){ this.startTimeStamp = moment(data).format('X');}, 
    endDateTime: function(data){ this.endTimeStamp = moment(data).format('X');},
  },
  mounted: function() {
    // Fetch the available classes of booking. 
    const self = this;
    const app = this.$f7;

    // Currently only NOPUBLIC type of bookings are allowed.
    app.dialog.preloader();
    self.postWithPromise('info/bmv/bookingclasses')
      .then( function(json) {
        self.classes = JSON.parse(json).data;
        app.dialog.close();
      });
    self.fetchVenues();
    self.venues = self.loadStore('venues');
  },
  methods: { 
    venueToStr: function(venueID)
    {
      const self = this;
      const v = self.venues[venueID];
      if(v)
        return '('+v.strength+') ' + v.summary;
      return 'Info not available.';
    },
    searchSpeakerURI: function(q) {
      const self = this;
      return self.getAPIUrl() + '/search/speaker/'+encodeURIComponent(q);
    },
    onEventSelect: function(type) 
    {
      const self = this;
      console.log("Selected type ", type);
    },
    onEventTypeSelection: function() {
      const self = this;
      console.log( "Selected type is", self.thisEvent.type);
    },
    isTalkOrSeminar: function() {
      const self = this;
      if(self.thisEvent.type.includes("TALK"))
        return true;
      if(self.thisEvent.type.includes("SEMINAR"))
        return true;
      return false;
    },
    onSpeakerSelected: function(spkr) 
    {
      const self = this;
      console.log('Selected ', spkr);
      console.log('Available ', self.potentialSpeakers);
      self.thisSpeaker = self.potentialSpeakers.find(x=> x.id === spkr.value);

      // Assign this speaker to the talk.
      self.thisTalk.speaker_id = self.thisSpeaker.id;
    },
    foundSpeakersOnSearch: function(res)
    {
      const self = this;
      self.potentialSpeakers = res.results;
      self.createNewSpeaker = false;
    },
    submitSpeaker: function(speaker) 
    {
      const self = this;
      const app = self.$f7;
      console.log('Adding ', speaker);
      app.dialog.preloader();
      self.promiseWithAuth('people/speaker/add', speaker)
        .then( function(json) {
          var data = JSON.parse(json).data;
          self.thisSpeaker = data.data;
          app.dialog.close();
          console.log( 'Added ', self.thisSpeaker);
        });
      setTimeout(() => app.dialog.close(), 500);
    },
  },
}; 

</script>
