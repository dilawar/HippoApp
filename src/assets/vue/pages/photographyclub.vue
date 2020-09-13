<template>
<f7-page page-content>
  <f7-navbar title="NCBS Photography Club" back-link="Back">
    <f7-nav-right>
      <f7-link href="/admin_photographyclub">admin</f7-link>
    </f7-nav-right>
  </f7-navbar>

  <f7-popup :opened="popupOpened" @popup:closed="popupOpened = false">
    <f7-page>
      <f7-navbar title="Submit entry">
        <f7-nav-right>
          <f7-link popup-close>Cancel</f7-link>
         </f7-nav-right>
      </f7-navbar>
  
      <f7-block>
        <!-- upload your picture -->
        <f7-list media-list no-hairlines>
          <f7-list-item>
            <div slot="footer"> 
              Last date {{thisEvent.start_date | date }}, 
              Voting phase: {{thisEvent.voting_start_date | date }} 
              to {{thisEvent.voting_end_date | date}}
            </div>
            <vue-dropzone 
              id="photographyclub" 
              ref="photographyDZ"
              v-on:vdropzone-sending="(img, xhr, formdata) =>
              onImageSending(img, xhr, formdata, thisEvent.id)"
              v-on:vdropzone-success="onUploadSuccess"
              :options="dropzoneOptions">
            </vue-dropzone>
          </f7-list-item>
          <f7-list-input label="Caption"
            :value="caption"
            @change="caption=$event.target.value">
          </f7-list-input>
          <f7-list-item>
            <f7-button raised 
              :disabled="caption===''"
              @click="submitMyEntry()">Upload</f7-button>
          </f7-list-item>
        </f7-list>
      </f7-block>
    </f7-page>
  </f7-popup>

  <!-- This completition -->
  <template v-if="activeEvents.length >  0">

      <!-- see all entries -->
    <f7-photo-browser :photos="photos" ref="photobrowser">
    </f7-photo-browser>

    <f7-block v-for="activeEvent, key in activeEvents" :key="key" inset>
      <f7-block-title medium>
        {{activeEvent.theme}}
      </f7-block-title>

      <f7-block-header>
        <div v-html="activeEvent.description"></div>
      </f7-block-header>

      <f7-button raised @click="showEntries(activeEvent)">Show entries</f7-button>

      <f7-block-footer>
        <f7-button icon="fa fa-plus" @click="uploadMyEntry(activeEvent)">
          Upload my entry
        </f7-button>
      </f7-block-footer>


    </f7-block>
  </template>
  <template v-else>
    <f7-block-title>
      There are no active competitions.
    </f7-block-title>
  </template>

  <f7-block>
  </f7-block>

  <!-- Upcoming -->
  <f7-block-title small>
    Upcoming competitions
  </f7-block-title>
  <f7-block>
    <f7-list media-list>
      <f7-list-item v-for="event, key in upcomingEvents" :key="key"
        :title="event.theme">
        <div slot="header">
          {{event.start_date | date}} to {{event.end_date | date}},
          <strong> Voting Phase: </strong>
          {{event.voting_start_date | date}} to {{event.voting_end_date | date}}
        </div>
        <div slot="text" v-html="event.description"></div>
      </f7-list-item>
    </f7-list>
  </f7-block>

  <f7-block-title small>
    Finished competitions
  </f7-block-title>
  <f7-block>
    <f7-list media-list>
      <f7-list-item v-for="event, key in completedEvents" :key="key"
        :title="event.theme">
        <div slot="header">
          {{event.start_date | date}} to {{event.end_date | date}},
          <strong> Voting Phase: </strong>
          {{event.voting_start_date | date}} to {{event.voting_end_date | date}}
        </div>
        <div slot="text" v-html="event.description"></div>
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
      thisEvent: {},
      popupOpened: false,
      entries: {},
      photos: [],
      activeEvents: [],
      upcomingEvents: [],
      completedEvents: [],
      caption: '',
      dropzoneOptions: {
        url: self.$store.state.api + '/upload/image/photographyclub',
        thumbnailWidth: 300,
        maxFilesize: 10,  // MB
        acceptedFiles: "image/*",
        addRemoveLinks: true,
        autoProcessQueue: false, // do not upload automatically.
        headers: self.apiPostData(),
      },
    };
  },
  mounted: async function() {
    const self = this;
    const app = self.$f7;

    self.postWithPromise('/photographyclub/event/active').then(function(x) {
      self.activeEvents = JSON.parse(x.data).data;
    });

    self.postWithPromise('/photographyclub/event/upcoming').then(function(x) {
      self.upcomingEvents = JSON.parse(x.data).data;
    });

    self.postWithPromise('/photographyclub/event/completed').then(function(x) {
      self.completedEvents = JSON.parse(x.data).data;
    });

  },
  methods: { 
    isPBAdmin: function() {
      return true;
    },
    showEntries: function(ev) {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.photos = [];
      self.postWithPromise('/photographyclub/entry/getall/' + ev.id)
        .then(function(x) {
          self.entries = JSON.parse(x.data).data;
          for(let key in self.entries) {
            let entry = self.entries[key];
            self.photos.push({url: entry.url, caption: entry.caption});
          }
          console.log('photos', self.photos);
          app.preloader.hide();
          self.$refs.photobrowser.open();
        });
      setTimeout(() => app.preloader.hide());
    },
    onImageSending: function(img, xhr, formData, eventid) {
      const self = this;
      console.log("Event id", eventid);
      // Add external id to formData.
      formData.append("event_id", eventid);
      formData.append("caption", self.caption);
    },
    uploadMyEntry: function(myevent) {
      const self = this;
      self.thisEvent = myevent;
      self.popupOpened = true;
    },
    onUploadSuccess: function(file, response) {
      const self = this;
      let res = response.data;
      if(! res.success)
        self.notify("Failed", res.msg)
      else {
        self.notify("Success", "Successfully uploaded.")
        self.popupOpened = false;
      }
    },
    submitMyEntry: function() {
      const self = this;
      self.$refs.photographyDZ.processQueue();
    },
  },

};
</script>
