<template>
<f7-page page-content>
  <f7-navbar :title="activeEvent ? activeEvent.theme : 'Photography Club'" 
    back-link="Back">
    <f7-nav-right v-if="isPBAdmin()">
      <f7-link  href="/admin_photographyclub">admin</f7-link>
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
              <strong>Upload one file at a time. Max 3 uploads per user.</strong>
              <em>
                Last date {{thisEvent.start_date | date }}, 
                Voting phase: {{thisEvent.voting_start_date | date }} 
                to {{thisEvent.voting_end_date | date}}. 
              </em>
            </div>
            <vue-dropzone 
              id="photographyclub" 
              ref="photographyDZ"
              v-on:vdropzone-sending="(img, xhr, formdata) =>
              onImageSending(img, xhr, formdata, thisEvent.id)"
              v-on:vdropzone-success="onUploadSuccess"
              v-on:vdropzone-error="onUploadError"
              :options="dropzoneOptions">
            </vue-dropzone>
          </f7-list-item>
          <f7-list-input 
            label="Caption"
            required
            type="textarea"
            :value="thisEntry.caption"
            @change="thisEntry.caption=$event.target.value">
          </f7-list-input>
          <f7-list-input label="Any other comment (not displayed)"
            resizable
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

  <!-- for readonly photo only -->
  <f7-photo-browser type="page" ref="photobrStandalone" :photos="photosReadonly">
  </f7-photo-browser>

  <!-- This completition -->
  <f7-block-header v-html="activeEvent?activeEvent.description:''">
  </f7-block-header>

  <!-- Extended FAB Center Bottom (Red) -->
  <f7-fab position="right-top" slot="fixed" 
    tooltip="Upload your entry"
    @click="uploadMyEntry(activeEvent)">
    <f7-icon icon="fa fa-upload"></f7-icon>
  </f7-fab>

  <f7-block v-if="activeEvent">

    <f7-swiper navigation pagination :params="{keyboard:true}">
      <f7-swiper-slide v-for="entry, key in entries" :key="key">
        <f7-card no-shadow>
          <f7-card-footer v-if="isVotingPhase(activeEvent)">
            <span v-if="entry.id in thisEventRatings">
              Avg rating 
              <strong> {{lodash.mean(thisEventRatings[entry.id])}} </strong>
              ({{thisEventRatings[entry.id].length}} votes) 
            </span>
            <span v-else></span>
            <div>
              <v-star-rating 
                v-if="entry.login !== whoAmI()"
                :increment="0.5" 
                :fixed-points="1"
                :star-size="30"
                :rating="(whoAmI() in thisEventRatings)? thisEventRatings[whoAmI()][entry.id]:0"
                @rating-selected="(rating) => setRating(rating, entry, activeEvent)">
              </v-star-rating>
              <v-star-rating v-else :star-size="30" read-only>
              </v-star-rating>
            </div>
          </f7-card-footer>
          <f7-card-footer v-else> 
            Voting is not allowed yet. 
          </f7-card-footer>
          <f7-card-content :padding="false">
            <div>
              <em style="font-size:large" v-html="entry.caption"></em>
              
              <small v-if="today()>dbDate(activeEvent.voting_end_date)"> 
                u/{{entry.login}}
                {{toNow(entry.last_modified_on)}} ago.
              </small>

              <img v-img:gallary :src="entry.url" 
                style="display:flex;justify-content:center;align-items:center;margin:auto;width:auto;height:auto;max-width:100%;max-height:600px;"/>
            </div>
            <f7-row>
              <f7-col v-if="isPBAdmin() || entry.login === whoAmI()">
                <f7-button  
                  color=red @click="removeEntry(entry, activeEvent)"
                  :disabled="isVotingPhase(activeEvent) && (! isPBAdmin())">
                  Remove 
                </f7-button>
              </f7-col>
              <f7-col v-if="entry.login === whoAmI()">
                <f7-button  
                  @click="updateMetadata(entry, activeEvent)" 
                  :disabled="isVotingPhase(activeEvent)">
                  Change Caption
                </f7-button>
              </f7-col>
            </f7-row>
          </f7-card-content>
        </f7-card>
      </f7-swiper-slide>
    </f7-swiper>


    <f7-block-footer>
      <strong>Upload phase:</strong>
      {{activeEvent.start_date | date}} to {{activeEvent.end_date | date}}
      <br>
      <strong>Voting Phase:</strong> {{activeEvent.voting_start_date | date}} to
      {{activeEvent.voting_end_date | date}}
    </f7-block-footer>

  </f7-block>
  <f7-block v-else>
    <f7-block-title medium>
    </f7-block-title>
  </f7-block>

  <!-- Upcoming -->
  <f7-block>
    <f7-block-title>
      Upcoming competitions
    </f7-block-title>

    <f7-list media-list no-hairlines>
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

  <f7-block>

    <f7-block-title>
      Finished competitions
    </f7-block-title>

    <f7-list no-hairlines media-list>
      <f7-list-item v-for="event, key in completedEvents" :key="key"
        @click="showReadonlyPics(event)"
        :title="event.theme">
        <div slot="header">
          {{event.start_date | date}} to {{event.end_date | date}},
          <strong> Voting Phase: </strong>
          {{event.voting_start_date | date3}} to {{event.voting_end_date | date3}}
        </div>
        <div slot="text" v-html="event.description"></div>
      </f7-list-item>
      <f7-list-item></f7-list-item>
    </f7-list>

  </f7-block>

</f7-page>
</template>

<script>
import moment from 'moment';
import Vue from 'vue'
import StarRating from 'vue-star-rating'
Vue.component('v-star-rating', StarRating)

import VueImg from 'v-img';
Vue.use(VueImg);

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
      photosReadonly: [],
      activeEvent: null,
      upcomingEvents: [],
      completedEvents: [],
      thisEntry : {comment:'', caption:'', note:''},
      dropzoneOptions: {
        url: self.$store.state.api + '/upload/image/photographyclub',
        maxFilesize: 10,  // MB
        maxFiles: 1,
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
    app.preloader.show();

    self.postWithPromise('/photographyclub/event/active').then(function(x) {
      self.activeEvent = JSON.parse(x.data).data;
      self.fetchComptEntries(self.activeEvent);
      self.fetchRatings(self.activeEvent);
      app.preloader.hide();
    });

    app.preloader.show();
    self.postWithPromise('/photographyclub/event/upcoming').then(function(x) {
      self.upcomingEvents = JSON.parse(x.data).data;
      app.preloader.hide();
    });

    app.preloader.show();
    self.postWithPromise('/photographyclub/event/completed').then(function(x) {
      self.completedEvents = JSON.parse(x.data).data;
      app.preloader.hide();
    });

    setTimeout(() => app.preloader.hide(), 20000);
  },
  methods: { 
    isPBAdmin: function() {
      const self = this;
      return self.hasRole('PHOTOGRAPHY_CLUB_ADMIN');
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
            self.photos.push({url: entry.url, src: entry.url,
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
      const app = self.$f7;

      if(! myevent) {
        app.dialog.alert("No competition found!");
        return false;
      }

      const now = moment();
      const sdate = moment(myevent.start_date);
      const edate = moment(myevent.end_date);

      if(now.date() < sdate.date()) {
        app.dialog.alert("Upload phase will start on " + myevent.start_date,
          "Sorry!");
        return false;
      }

      if(now.date() > edate.date() ) {
        app.dialog.alert("Upload phase is over. Please come back to vote!",
          "Sorry!");
        return false;
      }

      self.thisEvent = myevent;
      self.popupOpened = true;
    },
    onUploadSuccess: function(file, res, xhr) {
      const self = this;
      console.log('success', res);
      if(! res.data.success) {
        self.notify("Failed", res.data.msg)
        self.$refs.photographyDZ.removeAllFiles();
      } else {
        self.notify("Success", "Successfully uploaded.")
        self.fetchComptEntries(self.thisEvent);
        self.$refs.photographyDZ.removeAllFiles();
        self.popupOpened = false;
      }
    },
    onUploadError: function(file, res, xhr) {
      const self = this;
      const app = self.$f7;
      /* console.log('failed', res); */
      app.dialog.alert(res.data.msg, "Failure");
      self.$refs.photographyDZ.removeAllFiles();
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
      // console.log('voting period', ev.voting_start_date, ev.voting_end_date);
      let res = false;
      if( self.today() >= self.dbDate(ev.voting_start_date) && 
        self.today() <= self.dbDate(ev.voting_end_date))
        res = true;
      // console.log('res', res);
      return res;
    },
    showReadonlyPics: function(ev) {
      const self = this;
      const app = self.$f7;

      self.photosReadonly = [];

      app.preloader.show();
      self.postWithPromise('/photographyclub/entry/getall/' + ev.id)
        .then(function(x) {
          const entries = JSON.parse(x.data).data;
          for(let key in entries) {
            let entry = entries[key];
            self.photosReadonly.push({url: entry.url, src: entry.url,
              caption: entry.caption + " (by " + entry.login + ")"});
          }

          app.preloader.hide();

          // open the photobrowser
          self.$refs.photobrStandalone.open();
        });
      setTimeout(() => app.preloader.hide());
    },
  },
};
</script>
