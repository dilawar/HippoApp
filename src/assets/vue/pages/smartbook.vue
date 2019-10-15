<template>
  <f7-page>
  <f7-navbar title="Booking Events" back-link="Back"></f7-navbar>

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
    <f7-block-title small>Your search was futile.  Add a new speaker...
    </f7-block-title>
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
    <f7-list form no-hairlines>
      <!-- If there is any unscheduled talks, show them here for booking.
      -->

      <!-- Ask user for what purpose they are booking -->
      <f7-list-item title="Select the TYPE of event to continue..."
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

    <f7-card v-if="isTalkOrSeminar() && myUnscheduledTalks.length > 0">
      <f7-card-header>
        Unscheduled events
        <f7-button small href="/me/talks">SCHEDULE/EDIT/CANCEL</f7-button>
      </f7-card-header>
      <f7-card-content style="font-size:small">
        <f7-list>
          <f7-list-item v-for="(talk, key) in myUnscheduledTalks">
            <div slot="header">
              {{talk.class}} by {{talk.speaker}} | {{talk.title}}
            </div>
            <div slot="footer">
              Created on: {{talk.created_on | date}}
            </div>
          </f7-list-item>
        </f7-list>
      </f7-card-content>
    </f7-card>

    <!-- SPEAKER -->
    <f7-list form no-hairlines>
    <f7-list-group v-if="isTalkOrSeminar()">
      <f7-list-item >
        <div slot="header">
          <tt>{{thisEvent.type}}</tt> must have a speaker. 
        </div>
        <div slot="footer">
          If no one is found in my database, I will ask you
          to fill-in speaker's details.
        </div>
      </f7-list-item>
      <f7-list-input :input="false">
        <v-autocomplete  slot="input"
                         input-class="item-input"
                         placeholder="Speaker"
                         results-property="email"
                         results-display="name"
                         :request-headers="apiPostData()"
                         method="post"
                         @selected="onSpeakerSelected"
                         @results="foundSpeakersOnSearch"
                         @noResults="createNewSpeaker=true"
                         :source="(q)=>searchPeopleURI(q, 'speaker')">
        </v-autocomplete>
      </f7-list-input>
      <f7-list-item v-if="parseInt(thisSpeaker.id) > 0">
        <div slot="header" v-html="thisSpeaker.html"></div>
        <f7-link slot="footer" @click="openSpeakerPopup=true" >Update</f7-link>
      </f7-list-item>
      <f7-list-item v-if="createNewSpeaker">
        <div slot="header">No one is found..</div>
        <f7-button small raised
                   @click="openSpeakerPopup=true"
          > Add new Speaker </f7-button>
      </f7-list-item>
    </f7-list-group>

    <!-- WHEN SPEAKER IS SET, SHOW THE TALK SECTION -->
    <f7-list-group v-if="parseInt(thisTalk.speaker_id)>0">
      <f7-list-item>
        <div slot="header">
          Cool! Now a valid speaker has been found, please fill-in 
          the details of your <tt>{{thisEvent.type}}</tt>.
        </div>
      </f7-list-item>
      <f7-list-input v-if="parseInt(thisTalk.speaker_id) > 0"
                     @input="thisTalk.title = $event.target.value"
                     floating-label label="Title" outline
                     type="textarea" resizable required 
                     :value="thisTalk.title">
      </f7-list-input>

      <f7-list-input :input="false">
        <vue-editor ref="description" 
                    slot="input"
                    placeholder="Description of this talk"
                    v-model="thisTalk.description">
        </vue-editor>
      </f7-list-input>

      <f7-list-input :input="false" required>
        <v-autocomplete  slot="input"
                         input-class="item-input"
                         results-property="email"
                         results-display="name"
                         results-value="email"
                         placeholder="Host/PI"
                         :request-headers="apiPostData()"
                         method="post"
                         @selected="(v)=>thisTalk.host=v.selectedObject.email"
                         :source="(q)=>searchPeopleURI(q, 'host')">
        </v-autocomplete>
      </f7-list-input>

      <f7-list-input :input="false">
        <v-autocomplete slot="input"
            input-class="item-input"
            results-property="email"
            results-display="name"
            results-value="email"
            placeholder="Coordination email"
            :request-headers="apiPostData()"
            method="post"
            @selected="(v)=>thisTalk.coordinator=v.selectedObject.email"
            :source="(q)=>searchPeopleURI(q, 'login')">
        </v-autocomplete>
      </f7-list-input>

      <!-- VENUE AND TIME -->
      <f7-list-input label="Start Date/Time" :input="false">
        <date-picker slot="input" 
             v-model="thisBooking.startDateTime"
             placeholder="Select datetime"
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

      <f7-list-item title="Select a venue"
          smart-select
          :smart-select-params="{closeOnSelect:true}"
          @smartselect:closed="onEventTypeSelection()">
        <select @change="thisBooking.venue=$event.target.value"
            :value="thisEvent.venue">
          <option v-for="(venue, key) in venues" :key="key" :value="venue.id">
              {{venue.id}}
          </option>
        </select>
      </f7-list-item>

      <!-- SUBMIT BUTTON -->
      <f7-list-item>
        <f7-button v-if="isTalkValid()" 
                   @click="registerTalk()"
                   slot="after">
          Register This Talk
        </f7-button>
        <div slot="after" v-else>Missing details...</div>
      </f7-list-item>

      <!-- PROVIDE SOME SPACE AT BOTTOM -->
      <f7-list-item></f7-list-item>

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
      classes: [],
      venues: self.loadStore('venues'),
      potentialSpeakers: [],
      openSpeakerPopup: false,
      thisEvent: { type: 'TALK' }, // Change to UNKNOWN
      createNewSpeaker: false,
      myUnscheduledTalks : [],
      thisSpeaker: {
        id: '1',            // CHANGE TO -1
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
        speaker_id: '1'     // CHANGE TO -1
        , title: ''
        , description: ''
        , host: ''
        , coordinator: ''
      },
      thisBooking: {
        startDateTime: moment()
        , endTime: moment().add(1, 'hours')
      },
    };
  },
  actions: {
    bookingPopup: function(data) {
      console.log('popup');
    },
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

    // Get this user talks.
    self.postWithPromise('/me/talk/unscheduled')
      .then( function(json) {
        self.myUnscheduledTalks = JSON.parse(json).data;
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
    searchPeopleURI: function(q, what) {
      const self = this;
      return self.getAPIUrl() + '/search/'+what+'/'+encodeURIComponent(q);
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
    onSpeakerSelected: function(val) 
    {
      const self = this;
      self.thisSpeaker = val.selectedObject;
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
    registerTalk: function() 
    {
      const self = this;
      const app = self.$f7;
      console.log("Registering talk.", self.thisTalk);
      app.dialog.preloader();
      self.thisTalk.class = self.thisEvent.type;
      self.promiseWithAuth('me/talk/register', self.thisTalk)
        .then(function(json) {
          let res = JSON.parse(json).data;
          if('id' in res)
          {
            app.dialog.alert('Created talk with ID ' + res.id);
            // Refresh page.
            self.$f7router.refreshPage();
          }
          else
            navigator.notification.alert('I could not register your talk!', null);
          app.dialog.close();
        });
      setTimeout(()=> app.dialog.close(), 500);
    },
    isTalkValid: function()
    {
      const self = this;
      if(parseInt(self.thisTalk.speaker_id) < 1)
        return false;
      if(self.thisTalk.title.length < 4)
        return false;
      if(!(self.thisTalk.host && self.thisTalk.host.includes('@')))
        return false;
      return true;
    },
  },
}; 

</script>
