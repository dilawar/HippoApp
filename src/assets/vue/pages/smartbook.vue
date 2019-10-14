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
             floating-label 
             label="Email">
        <input :value="thisSpeaker.email" 
             slot="input"
             type="email" 
             required
             @change="thisSpeaker.email=$event.target.value"
             />
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.name" 
              required
              @change="thisSpeaker.name = $event.target.value"
              floating-label label="Name">
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.homepage"
             type="url" 
             @change="thisSpeaker.homepage = $event.target.value"
             floating-label label="Homepage">
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.department"
              @change="thisSpeaker.department = $event.target.value"
              floating-label label="Department">
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.institute"
             type="text"
             required
             @change="thisSpeaker.institute = $event.target.value"
             floating-label label="Institute">
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

      <!-- Speaker -->
      <f7-list-input :input="false"
                     label="Speaker (type to search)"
                     v-if="isSpeakerRequired()"
                     >
        <input slot="input"
               type="text" 
               class="input-item-wrap"
               :value="thisSpeaker.email"
               id="autocomplete_speaker"
               />
      </f7-list-input>
      <f7-list-item v-if="parseInt(thisSpeaker.id) > 0">
        <div slot="header">Found speaker id: {{thisSpeaker.id}} </div>
        <div slot="footer" v-html="thisSpeaker.html"></div>
      </f7-list-item>
      <f7-list-item v-if="createNewSpeaker">
        <div slot="header">No one is found..</div>
        <f7-button small raised
                   @click="openSpeakerPopup=true"
          > Add new Speaker </f7-button>
      </f7-list-item>

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
      openSpeakerPopup: false,
      thisEvent: { type: 'UNKNOWN' },
      createNewSpeaker: false,
      thisSpeaker: {
        id: -1,
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

    // Autocomplete.
    app.autocomplete.create({
      inputEl : '#autocomplete_speaker',
      openIn: 'dropdown',
      valueProperty: 'email',
      textProperty: 'name',
      source: function(q, render)
      {
        const autocomplete = this;
        var results = [];
        if(2 >= q.length)
        {
          render(results);
          return;
        }

        autocomplete.preloaderShow();
        self.promiseWithAuth('search/speaker/'+encodeURIComponent(q))
          .then( (json) => {
            results = JSON.parse(json).data;
            autocomplete.preloaderHide();
            render(results);
            self.createNewSpeaker = (results.length == 0)?true:false;
            self.openSpeakerPopup = self.createNewSpeaker;
          });
      },
      on: {
        change: function(val) {
          self.thisSpeaker = val[0];
          // Fetch other information and show.
          console.log("Fetch more information and show", self.thisSpeaker);
        },
      },
    });

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
    refreshVenuesStatus: function(data) 
    {
      const self         = this;
      const app          = self.$f7;
      self.isOpen        = false;

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
        }
      );
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
    isSpeakerRequired: function() {
      const self = this;
      if(self.thisEvent.type.includes("TALK"))
        return true;
      if(self.thisEvent.type.includes("SEMINAR"))
        return true;
      return false;
    },
  },
}; 

</script>
