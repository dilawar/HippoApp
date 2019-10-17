<template>
  <f7-page> <f7-navbar title="Booking Events" back-link="Back"></f7-navbar>

  <f7-block strong>
    <f7-list small-inset no-hairlines
             style="margin:0;padding:0;font-size:small"
             >
      <!-- Ask user for what purpose they are booking -->
      <f7-list-item title="Select the TYPE of event..."
                    smart-select
                    :smart-select-params="{openIn:'popover', closeOnSelect:true}"
                    >
        <select v-model="eventType">
          <option v-for="(cls, key) in eventTypes.all" :key="key" :value="cls">
            {{cls}}
          </option>
        </select>
      </f7-list-item>

      <f7-list-item checkbox 
                    :checked="sendEmailToAcademic"
                    title="Send email(s) to Academic community">
      </f7-list-item>

      <f7-list-item checkbox 
                    :checked="addToGoogleCalendar"
                    title="Add to NCBS's public calendar">
      </f7-list-item>
    </f7-list>

    <f7-button v-if="sendEmailToAcademic"
               :disabled="! isValidSelection()" 
               :href="'/register-event-with-speaker/'+eventType"
               >
      Continue
    </f7-button>
    <f7-button v-else
               :disabled="! isValidSelection()">
      Continue
    </f7-button>

  </f7-block>

  <f7-block inset>
    <!-- If there is any unscheduled talks, show them here for booking. -->
    <div v-if="isTalkOrSeminar() && myUnscheduledTalks.length > 0">

      <f7-icon fa="bell-o fa-fw"></f7-icon> 
      You already have some unscheduled events. Just a reminder...
      <f7-list>
        <f7-list-item v-for="(talk, key) in myUnscheduledTalks"
                      :key="key"
                      >
          <div slot="header">
            {{talk.class}} by {{talk.speaker}} | {{talk.title}}
          </div>
          <div slot="footer">
            Created on: {{talk.created_on | date}}
          </div>
          <div slot="after">
            <f7-button small @click="scheduleThisEvent(talk)">
              Book
            </f7-button>
          </div>
        </f7-list-item>
      </f7-list>
    </div>
  </f7-block>


  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
  data() {
    return {
      eventTypes: [],
      eventType: 'UNKNOWN',
      sendEmailToAcademic: false,
      addToGoogleCalendar: false,
    };
  },
  mounted: function() {
    // Fetch the available eventTypes of booking. 
    const self = this;
    const app = this.$f7;

    self.eventType = 'UNKNOWN';
    self.sendEmailToAcademic = false;
    self.addToGoogleCalendar = false;

    // Currently only NOPUBLIC type of bookings are allowed.
    app.dialog.preloader();
    self.postWithPromise('info/bmv/bookingclasses')
      .then( function(x) {
        self.eventTypes = JSON.parse(x.data).data;
        app.dialog.close();
      });

    // Get this user talks.
    self.postWithPromise('/me/talk/unscheduled')
      .then( function(x) {
        self.myUnscheduledTalks = JSON.parse(x.data).data;
      });
  },
  watch: {
    eventType: function(old, newval) {
      const self = this;
      self.isTalkOrSeminar();
    },
  },
  methods: { 
    isValidSelection: function()
    {
      const self = this;
      if(! self.eventType)
        return false;

      if(self.eventType === 'UNKNOWN')
        return false;

      if(! ('all' in self.eventTypes))
        return false;
      if(Object.values(self.eventTypes.all).includes(self.eventType))
        if(self.eventType !== 'UNKNOWN')
          return true
      return false;
    },
    isTalkOrSeminar: function() {
      const self = this;
      var ans = false;
      if(self.eventType.includes("TALK"))
        ans = true;
      else if(self.eventType.includes("SEMINAR"))
        ans = true;
      if(ans)
      {
        self.sendEmailToAcademic = true;
        self.addToGoogleCalendar = true;
      }
      return ans;
    },
  },
}; 
</script>
