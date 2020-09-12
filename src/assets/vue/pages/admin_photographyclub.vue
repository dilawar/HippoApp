<template>
<f7-page page-content>
  <f7-navbar title="Admin Photography Club" back-link="Back"></f7-navbar>

  <f7-popup :opened="popupEvent">
    <f7-page>
      <f7-navbar title="Add/Update event">
        <f7-nav-right>
          <f7-link @click="popupEvent=false">Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

      <f7-block-title> {{popupAction}} event </f7-block-title>
      <f7-block>
        <f7-list media-list>
          <f7-list-input label="Theme"
            required
            :value="thisEntry.theme"
            @change="thisEntry.theme = $event.target.value">
          </f7-list-input>

          <f7-list-input label="Description of the theme"
            type="texteditor"
            resizable
            :value="thisEntry.description"
            :textEditorParams="{mode: 'popover'}"
            @texteditor:change="value => thisEntry.description = value">
          </f7-list-input>

          <f7-list-input label="Competition start date"
            type="date"
            required
            :value="thisEntry.start_date"
            @change="thisEntry.start_date = $event.target.value">
          </f7-list-input>

          <f7-list-input label="Comptetition end date"
            type="date"
            required
            :value="thisEntry.end_date"
            @change="thisEntry.end_date = $event.target.value">
          </f7-list-input>

          <f7-list-input label="Voting start date"
            type="date"
            required
            :value="thisEntry.voting_start_date"
            @change="thisEntry.voting_start_date = $event.target.value">
          </f7-list-input>

          <f7-list-input label="Voting end date"
            type="date"
            required
            :value="thisEntry.voting_end_date"
            @change="thisEntry.voting_end_date = $event.target.value">
          </f7-list-input>

          <f7-list-input label="Any note for the participant"
            type="texteditor"
            resizable
            :value="thisEntry.comment"
            :textEditorParams="{mode: 'popover'}"
            @texteditor:change="value => thisEntry.comment = value">
          </f7-list-input>
        </f7-list>
        <f7-row>
          <f7-col>
            <f7-button fill color=red v-if="! thisEntry.is_new" 
              @click="deleteEvent(thisEntry.id)" >
              Delete
            </f7-button>
          </f7-col>
          <f7-col>
            <f7-button raised @click="submitCompetition()" >
              Submit
            </f7-button>
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-page>
  </f7-popup>

  <!-- List exisiting events. -->
  <f7-block>

    <f7-block-title>
    </f7-block-title>

    <f7-list media-list no-hairlines>

      <f7-list-item>
        <f7-button raised small @click="addNewEntry">Add new entry</f7-button>
      </f7-list-item>

      <f7-list-item v-for="entry, key in entries" :key="key"
        @click="updateEntry(entry)">
        <div slot="header">
          Event : {{entry.start_date | date}} to {{entry.end_date | date}}
          <br>
          Voting: {{entry.voting_start_date | date }} to {{entry.voting_end_date | date}}
        </div>
        <div slot="title">{{entry.theme}}</div>
        <div slot="footer">{{entry.note}}</div>
      </f7-list-item>
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
      popupEvent: false,
      popupAction: 'Add',
      entries: [],
      thisEntry: {
        theme: '',
        description: '',
        start_date: '',
        end_date: '',
        voting_start_date: '',
        voting_end_date: '',
        comment: '',
        is_new: true,
      },
      isvalid: { ok: false, msg:'No change detected.' }
    };
  },
  mounted: async function() {
    const self = this;
    self.fetchEvents();
  },
  methods: { 
    fetchEvents: function() {
      const self = this;
      const app = self.$f7;

      self.postWithPromise('/photographyclub/list').then( function(x) {
        self.entries = JSON.parse(x.data).data;
      });
    },
    isPBAdmin: function() {
      return true;
    },
    submitCompetition: function() {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      console.log('This entry', self.thisEntry);
      self.promiseWithAuth('/photographyclub/event/new', self.thisEntry)
        .then( function(x) {
          let res = JSON.parse(x.data);
          if(res.success) 
            self.notify("Success", "Added new entry");
          else
            self.notify("Failed", "Failed to add new entry: " + res.msg);
          app.preloader.hide();
          self.fetchEvents();
        });
      setTimeout(() => app.preloader.hide(), 10000);
    },
    updateEntry: function(entry) {
      const self = this;
      self.thisEntry = entry;
      self.thisEntry.is_new = false;
      self.popupEvent = true;
      self.popupAction = 'Update';
    },
    addNewEntry: function() {
      const self = this;
      self.thisEntry.is_new = true;
      self.popupEvent = true;
      self.popupAction = 'New';
    },
    deleteEvent: function(entryid) {
      const self = this;
      const app = self.$f7;
      app.dialog.confirm("Deleting an event!!", "Are you sure?"
        , function(x) {
          console.log('deleting');
          app.preloader.show();
          self.postWithPromise('/photographyclub/event/delete/'+entryid)
            .then(function(x) {
              let res = JSON.parse(x.data).data;
              if(res.status) 
                self.notify("Success", "Removed the event.");
              else
                self.notify("Failed", res.msg);
              app.preloader.hide();
              self.fetchEvents();
              self.popupEvent = false;
            });
          setTimeout(() => app.preloader.hide(), 10000);
        }, null);
    },
  },
  watch: {
    thisEntry: {
      handler: function(newval) {
        /* console.log("new val", newval); */
        const self = this;
        if(! newval.theme) 
          self.isvalid = {ok:false, msg:'Theme is not set:' + newval.theme};
        else if(! moment(newval.start_date)) 
          self.isvalid = {ok:false, msg:'Not a valid start date.'};
        else if(! moment(newval.end_date)) 
          self.isvalid = {ok:false, msg:'Not a valid end date.'};
      }, 
      deep: true
    },
  },
};
</script>
