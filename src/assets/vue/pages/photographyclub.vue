<template>
<f7-page page-content>
  <f7-navbar title="NCBS Photography Club" back-link="Back">
    <f7-nav-right>
      <f7-link href="/admin_photographyclub">admin</f7-link>
    </f7-nav-right>
  </f7-navbar>

  <f7-popup :opened="popupOpened" @popup:closed="popupOpened = false">
    <f7-page>
      <f7-navbar :title="popupAction + ' entry'">
        <f7-nav-right>
          <f7-link popup-close>Cancel</f7-link>
         </f7-nav-right>
      </f7-navbar>
  
      <f7-block>
        <!-- upload your picture -->
        <f7-list media-list no-hairlines>
          <f7-list-item v-if="popupAction==='Submit'">
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
          <f7-list-input 
            label="Caption"
            type="textarea"
            :value="thisEntry.caption"
            @change="thisEntry.caption=$event.target.value">
          </f7-list-input>
          <f7-list-input label="Any other comment (not displayed)"
            type="textarea"
            :value="thisEntry.comment"
            @change="thisEntry.comment=$event.target.value">
          </f7-list-input>
          <f7-list-item>
            <f7-button raised @click="executePopupAction()">
              {{popupAction}}
            </f7-button>
          </f7-list-item>
        </f7-list>
      </f7-block>
    </f7-page>
  </f7-popup>

  <!-- This completition -->
  <f7-block inset>
    <f7-block-title medium>
      {{activeEvent.theme}}
      <f7-button small class="float-right"
        :disabled="today() > dbDate(activeEvent.end_date)"
        icon="fa fa-upload" @click="uploadMyEntry(activeEvent)">
        Upload entry
      </f7-button>
    </f7-block-title>

    <f7-block-header strong>
      <div v-html="activeEvent.description"></div>
    </f7-block-header>

    <f7-swiper navigation>
      <f7-swiper-slide v-for="entry, key in entries" :key="key">
        <f7-card no-shadow style="background-color:ivory">
          <f7-card-header>
            <div>
              <em style="font-size:large" v-html="entry.caption"></em>
              <small style="color:gray"> u/{{entry.login}}
                {{toNow(entry.last_modified_on)}} ago.</small>
            </div>
          </f7-card-header>
          <f7-card-content :padding="false">
            <template v-if="isVotingPhase(activeEvent)">
              <span v-if="entry.id in thisEventRatings">
                Avg rating 
                <strong> {{lodash.mean(thisEventRatings[entry.id])}} </strong>
                ({{thisEventRatings[entry.id].length}} votes) 
              </span>

              <v-star-rating 
                v-if="entry.login !== whoAmI()"
                style="padding-right:10px"
                class="float-right"
                :increment="0.5" 
                :star-size="25"
                :rating="(whoAmI() in thisEventRatings)? thisEventRatings[whoAmI()][entry.id]:0"
                @rating-selected="(rating) => setRating(rating, entry, activeEvent)">
              </v-star-rating>
            </template>
            <template v-else>
              <div>
                Voting phase {{activeEvent.voting_start_date}} to {{activeEvent.voting_end_date}}.
              </div>
            </template>

            <img :src="entry.url" width="100%" style="padding-top:5px"/>
            <f7-row>
              <f7-col v-if="isPBAdmin() || entry.login === whoAmI()" 
                :disabled="isVotingPhase(activeEvent)">
                <f7-button color=red @click="removeEntry(entry, activeEvent)">
                  Remove 
                </f7-button>
              </f7-col>
              <f7-col v-if="entry.login === whoAmI()">
                <f7-button @click="updateMetadata(entry, activeEvent)" 
                  :disabled="isVotingPhase(activeEvent)">
                  Change Caption
                </f7-button>
              </f7-col>
            </f7-row>
          </f7-card-content>
        </f7-card>
      </f7-swiper-slide>
    </f7-swiper>
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
import Vue from 'vue'
import StarRating from 'vue-star-rating'
Vue.component('v-star-rating', StarRating)

export default {

  data() {
    const self = this;
    return {
      thisEvent: {},
      thisEventRatings: {},
      popupOpened: false,
      popupAction: 'Submit',
      entries: [],
      myentries: [],
      photos: [],
      activeEvent: [],
      upcomingEvents: [],
      completedEvents: [],
      thisEntry : {comment:'', caption:'', note:''},
      dropzoneOptions: {
        url: self.$store.state.api + '/upload/image/photographyclub',
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
      self.activeEvent = JSON.parse(x.data).data;
      self.fetchComptEntries(self.activeEvent);
      self.fetchRatings(self.activeEvent);
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
      const self = this;
      return (self.whoAmI() === 'photography') || ('ADMIN' in self.getRoles());
    },
    fetchComptEntries: function(ev) {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.photos = [];
      self.myentries = [];
      self.postWithPromise('/photographyclub/entry/getall/' + ev.id)
        .then(function(x) {
          self.entries = JSON.parse(x.data).data;
          for(let key in self.entries) {
            let entry = self.entries[key];
            if(entry.login == self.whoAmI())
              self.myentries.push(entry);
            self.photos.push({url: entry.url,
              caption: entry.caption + " (" + entry.login + ")"});
          }
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide());
    },
    onImageSending: function(img, xhr, formData, eventid) {
      const self = this;
      console.log("Event id", eventid);
      // Add external id to formData.
      formData.append("event_id", eventid);
      formData.append("caption", self.thisEntry.caption);
      formData.append("comment", self.thisEntry.comment);
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
    executePopupAction: function() {
      const self = this;
      if(self.popupAction === 'Submit') {
        self.submitMyEntry();
        return;
      }
      if(self.popupAction === 'Update') {
        // Update caption.
        self.promiseWithAuth('/photographyclub/entry/update', self.thisEntry)
          .then(function(x) {
            const res = JSON.parse(x.data).data;
            if(res.success) {
              self.notify('Success', "Successfully updated caption to: " +
                self.thisEntry.caption);
              self.popupOpened = false;
            } else {
              self.notify("Error", "Could not update caption:"+res.msg);
            }
          });
      }
    },
    submitMyEntry: function() {
      const self = this;
      if(! self.thisEntry.caption) 
      {
        self.notify("Error", "Caption is empty");
        return;
      }
      self.$refs.photographyDZ.processQueue();
    },
    updateMetadata: function(entry, ev) {
      console.log("warning not fully implemented.");
      const self = this;
      self.thisEntry = ev;
      self.thisEntry = entry;
      self.popupAction = 'Update';
      self.popupOpened = true;
    },
    removeEntry: function(entry, ev) {
      const self = this;
      const app = self.$f7;
      app.dialog.prompt("Why are you removing this entry?"
        ,  "Destructive operation!"
        , function(note) {
          if(note.length < 8) {
            self.notify("Failed", "Reason can't less than 8 chars: " + note);
            return;
          }
          let data = {note: note, id: entry.id};
          self.promiseWithAuth('/photographyclub/entry/remove', data)
            .then(function(x) {
              let res = JSON.parse(x.data).data;
              if(res.success) {
                self.notify("Success", "Successfully removed image");
                self.fetchComptEntries(ev);
              }
              else {
                self.notify("Failure", "Failed to remove image." + res.msg);
              }
            });
        }, null);
    },
    fetchRatings: function(ev) {
      const self = this;
      const app = self.$f7;
      self.postWithPromise('/photographyclub/rating/getall/'+ev.id)
        .then(function(x) {
          self.thisEventRatings = JSON.parse(x.data).data;
        });
    },
    setRating: function(rating, entry, ev) {
      const self = this;
      const app = self.$f7;
      const data = {id:entry.id, competition_id:ev.id, star: rating, note: entry.note};

      self.promiseWithAuth('/photographyclub/rating/add', data).then(function(x) {
        const res = JSON.parse(x.data).data;
        if(res.success) {
          self.notify("Success", "Added rating.");
          self.fetchRatings(ev);
        }
        else
          self.notify("Failed", "Failed to add rating: " + res.msg); 
      });
    },
    isVotingPhase: function(ev) {
      const self = this;
      console.log('voting period', ev.voting_start_date, ev.voting_end_date);
      if( self.today() >= self.dbDate(ev.voting_start_date) && 
        self.today() <= self.dbDate(ev.voting_end_date))
        return true;
      return false;
    },
  },
};
</script>
