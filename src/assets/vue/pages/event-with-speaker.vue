<template>
  <f7-page> 
    <f7-navbar :title="'Booking a ' + thisEvent.type" back-link="Back">
    </f7-navbar>

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

      </f7-page>
    </f7-popup>

  <!-- SPEAKER POPUP -->
  <!-- POPUP  -->
  <f7-popup :opened="openSpeakerPopup" @popup:close="openSpeakerPopup = false">
    <f7-page>
      <f7-navbar :title="createNewSpeaker?'Add new speaker':'Update speaker'">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

    <!-- Once the CLASS is known, expand the speaker card. -->
    <f7-block-title small v-if="createNewSpeaker">
      Your search was futile.  Add a new speaker...
    </f7-block-title>

    <f7-block>

    <f7-list no-hairlines>
      <f7-list-input :input="false" label="Email">
        <input :value="thisSpeaker.email" 
             slot="input"
             type="email" required
             @change="thisSpeaker.email=$event.target.value"
             />
      </f7-list-input>

      <f7-list-input :value="thisSpeaker.name" 
              @change="thisSpeaker.name = $event.target.value"
              required
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
                   v-if="createNewSpeaker"
                   @click="submitNewSpeaker(thisSpeaker)">
          Add Speaker
        </f7-button>
        <f7-button panel-close raised 
                   v-else
                   @click="submitUpdateSpeaker(thisSpeaker)">
          Update Speaker
        </f7-button>
      </f7-col>
    </f7-row>
    </f7-block>
    </f7-page>
  </f7-popup>

  <f7-block>
    <!-- SPEAKER -->
    <f7-list no-hairlines media-list>
      <f7-list-group>
        <f7-list-input :input="false" label="Speaker (required)">
          <v-autocomplete  slot="input"
            ref="refEventSpeaker"
            input-class="form-control"
            placeholder="Email (you can add a new speaker if none found)"
            results-property="email"
            results-display="name"
            :request-headers="apiPostData()"
            :showNoResults="false"
            method="post"
            @selected="onSpeakerSelected"
            @results="foundSpeakersOnSearch"
            @noResults="createNewSpeaker=true"
            :source="(q)=>searchPeopleURI(q, 'speaker')">
          </v-autocomplete>
        </f7-list-input>
      <f7-list-item v-if="parseInt(thisSpeaker.id) > 0"
                    style="background-color:lightyellow">
        <img slot="media" width="70px" :src="'data:image/jpeg;base64, '+thisSpeaker.photo">
        </img>
        <div slot="header" v-html="thisSpeaker.html"></div>
        <f7-button slot="footer" :href="'/admin/speaker/edit/'+thisSpeaker.id">
          Update
        </f7-button>
      </f7-list-item>

      <f7-list-item v-if="createNewSpeaker">
        <f7-button slot="title" href="/admin/speaker/add/-1">
          Add new Speaker
        </f7-button>
        <div slot="after">No one is found...</div>
      </f7-list-item>

    </f7-list-group>

    <!-- WHEN SPEAKER IS SET, SHOW THE TALK SECTION -->
    <f7-list-group v-if="parseInt(thisEvent.speaker_id)>0">
      <f7-list-input v-if="parseInt(thisEvent.speaker_id) > 0"
                     @input="thisEvent.title = $event.target.value"
                     label="Title"
                     type="textarea" resizable required 
                     :value="thisEvent.title">
      </f7-list-input>

      <f7-list-input :input="false" label="Description">
        <vue-editor ref="description" 
                    slot="input"
                    placeholder="Description of this talk"
                    v-model="thisEvent.description">
        </vue-editor>
      </f7-list-input>
      <!-- Following does not support inserting image from the computer -->
      <!--
      <f7-list-input type="texteditor"
                     label="Description"
                     :value="thisEvent.description"
                     :textEditorParams="{mode:'keyboard-toolbar'}"
                     @texteditor:change="(v)=>thisEvent.description=v">
      </f7-list-input>
      -->
      <f7-list-input :input="false" required>
        <v-autocomplete  slot="input"
                         input-class="item-input form-control"
                         results-property="email"
                         results-display="name"
                         results-value="email"
                         placeholder="Host/PI"
                         :request-headers="apiPostData()"
                         method="post"
                         @selected="(v)=>thisEvent.host=v.selectedObject.email"
                         :source="(q)=>searchPeopleURI(q, 'host')">
        </v-autocomplete>
      </f7-list-input>

      <f7-list-input :input="false">
        <v-autocomplete slot="input"
            input-class="item-input form-control"
            results-property="email"
            results-display="name"
            results-value="email"
            placeholder="Coordination email"
            :request-headers="apiPostData()"
            method="post"
            @selected="(v)=>thisEvent.coordinator=v.selectedObject.email"
            :source="(q)=>searchPeopleURI(q, 'login')">
        </v-autocomplete>
      </f7-list-input>

      <!-- Register talk and book venue for it. -->
      <f7-list-item v-if="! thisEvent.isRegistered">
        <f7-button small raised 
                   :disabled="! isEventValid.status" 
                   @click="registerTalk()"
                   slot="after">
          {{isEventValid.msg}}
        </f7-button>
      </f7-list-item>
      <f7-list-item v-else>
        <f7-button small raised 
                   :disabled="! thisEvent.isRegistered" 
                   :href="'/bookevent/talks.'+thisEvent.id+'/'+thisEvent.type"
                   slot="after">
          Book a venue
        </f7-button>
      </f7-list-item>
    </f7-list-group>

    <!-- PROVIDE SOME SPACE AT BOTTOM -->
    <f7-list-item></f7-list-item>
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
      potentialSpeakers: [],
      openSpeakerPopup: false,
      popupVenueSelect: false,
      createNewSpeaker: false,
      myUnscheduledTalks : [],
      thisSpeaker: {
        id: '-1',                     // CHANGE TO -1
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
      thisEvent: {
        speaker_id: '-1'             // CHANGE TO -1
        , id : '-1'
        , type: self.$f7route.params.eventType
        , title: ''
        , description: ''
        , host: ''
        , coordinator: ''
        , is_public_event: true
        , isRegistered: false
      },
      thisBooking: {
        startDateTime: moment().add(1, 'minutes')
        , endTime: moment().add(1, 'hours')
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
    // Fetch the available eventTypes of booking. 
    const self = this;
    const app = this.$f7;
  },
  computed: {
    isEventValid: function()
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

      return {status:true, msg:'Save before booking'};
    },
    isBookingValid: function()
    {
      const self = this;
      if(moment(self.thisBooking.startDateTime) <= moment())
        return {status: false, msg: 'Start time is in the past!'};
      if(! self.thisBooking.venue)
        return {status: false, msg: 'No venue selected.'};
      return {status: true, msg: 'Register & BOOK'};
    },
  },
  methods: { 
    isTalkOrSeminar: function() {
      return true;
    },
    onSpeakerSelected: function(val) 
    {
      const self = this;
      self.promiseWithAuth('people/speaker/fetch/'+val.value)
        .then(function(x) {
          self.thisSpeaker = JSON.parse(x.data).data;
          self.thisEvent.speaker_id = self.thisSpeaker.id;
        });
    },
    foundSpeakersOnSearch: function(res) {
      const self = this;
      self.potentialSpeakers = res.results;
      self.createNewSpeaker = false;
    },
    submitNewSpeaker: function(speaker) {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.promiseWithAuth('people/speaker/add', speaker)
        .then( function(x) {
          var data = JSON.parse(x.data).data;
          self.thisSpeaker = data.data;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 1000);
    },
    submitUpdateSpeaker: function(speaker) {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.promiseWithAuth('people/speaker/update', speaker)
        .then(function(x) {
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 1000);
    },
    updateSpeaker: function() {
      const self = this;
      self.createNewSpeaker = false;
      self.openSpeakerPopup = true;
    },
    registerTalk: function() {
      const self = this;
      const app = self.$f7;

      // Assign the class to talk.
      app.dialog.preloader();
      self.thisEvent.class = self.thisEvent.type;
      self.promiseWithAuth('me/talk/register', self.thisEvent)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if('id' in res)
          {
            self.thisEvent.isRegistered = true;
            self.thisEvent.id = res.id;
          }
          else
            navigator.notification.alert('I could not register your talk!', null);
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 500);
    },
  },
}; 

</script>
