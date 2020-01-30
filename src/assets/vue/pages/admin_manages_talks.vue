<template>
  <f7-page>
    <f7-navbar title="Talks/Seminars" back-link="Back">
      <f7-subnavbar :inner="false">
        <f7-searchbar search-container=".event-list"
                      search-in=".item-header, .item-title, .item-subtitle, .item-text, .item-footer">
        </f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <v-autocomplete  ref="refEventSpeaker"
                     input-class="item-input"
                     placeholder="Search old talk..."
                     results-property="email"
                     results-display="name"
                     :request-headers="apiPostData()"
                     method="post">
    </v-autocomplete>

    <f7-list media-list class="event-list">
      <f7-row style="list-style-type:none">
        <f7-list-item v-for="(talk, key) in talks" 
                      class="col-100 medium-50"
                      @click="updateTalkPopup(talk)" 
                      :key="key">
          <div slot="title" style="font-size:small">
            <f7-icon :icon="talkIcon(talk)"></f7-icon>
            {{talk.class}} by {{talk.speaker}}
          </div>
          <div slot="subtitle"> {{talk.title}} </div>
          <div slot="footer"> Created: {{talk.created_on}}, by {{talk.created_by}}
             ({{toNow(talk.created_on)}} ago)
          </div>
          <!-- <div slot="after" v-if="talk.hasOwnProperty('event')">Approved</div> -->
          <!-- <div slot="after" v-if="talk.hasOwnProperty('request')">Pending</div> -->
          <!-- <f7-icon slot="media" :icon="talkIcon(talk)"> -->
          </f7-icon>
        </f7-list-item>
      </f7-row>
    </f7-list>

    <!-- POPUP  -->
    <f7-popup :opened="popupTalkEdit" 
                 class="popup-tablet-fullscreen"
                 @popup:close="popupTalkEdit = false">
      <f7-page>
        <f7-navbar title="Update Talk">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>


        <f7-block-header> 
          <span style="text-transform:capitalize">
            {{thisTalk.class.toLowerCase()}} by 
          </span>
          <f7-link popup-close :href="'/admin/speaker/update/'+thisTalk.speaker_id"> 
            {{thisTalk.speaker}} 
          </f7-link>
        </f7-block-header>

        <!-- Card showing event/request. -->
        <!-- Conformed event -->
        <f7-card :padding="false" v-if="thisTalk.hasOwnProperty('event')">
          <f7-card-header>
            <strong>CONFIRMED</strong> 
            <f7-button raised color=red small 
                       @click="deleteEventOfThisTalk(thisTalk.event)">
              Delete Booking
            </f7-button>
            <f7-link  popup-close :href="'/email/talk/'+thisTalk.id">Send Email</f7-link>
          </f7-card-header>
          <f7-card-content>
            {{thisTalk.event.venue}},
            {{thisTalk.event.date | date}},
            {{thisTalk.event.start_time | clockTime}}
          </f7-card-content>
        </f7-card>

        <f7-card :padding="false" v-if="thisTalk.hasOwnProperty('request')">
          <f7-card-header>
            <strong>PENDING</strong>
            <f7-button raised color=red small 
                       @click="deleteRequestOfThisTalk(thisTalk.request)"
                       class="float-right">
              Delete Request
            </f7-button>
            <f7-button raised small 
                       @click="approveRequest(thisTalk.request)"
                       class="float-right">
              Approve Request
            </f7-button>
          </f7-card-header>
          <f7-card-content>
            <strong>{{thisTalk.request.venue}}</strong>,
            <strong>{{thisTalk.request.date | date}}</strong>,
            <strong>{{thisTalk.request.start_time | clockTime}}</strong>
          </f7-card-content>
        </f7-card>

        <!-- Book it -->
        <f7-card v-if="! (thisTalk.hasOwnProperty('request') || thisTalk.hasOwnProperty('event'))">
          <f7-card-content>
            <f7-row>
              <f7-col> No booking found.  </f7-col>
              <f7-col>
                <f7-link popup-close 
                         :href="'/bookevent/talks.'+thisTalk.id+'/'+thisTalk.class">
                  Create Booking
                </f7-link>
              </f7-col>
            </f7-row>
          </f7-card-content>
        </f7-card>

        <f7-list no-hairlines>

          <f7-list-input label="Title"
                         type="textarea"
                         resizable
                         :value="thisTalk.title" 
                         @change="thisTalk.title=$event.target.value">
          </f7-list-input>

          <f7-list-input label="Description (optional)" resizable
                         :textEditorParams="{mode: 'toolbar'}"
                         :value="thisTalk.description"
                         @texteditor:change="(v)=>thisTalk.description=v"
                         type="texteditor">
          </f7-list-input>

        </f7-list>
        <f7-row>
          <f7-col>
            <f7-button popup-close raised color=red>Back</f7-button>
          </f7-col>
          <f7-col>
            <f7-button raised fill @click="updateThisTalk()">
              Update This Talk
            </f7-button>
          </f7-col>
        </f7-row>
        <f7-block-footer>
        </f7-block-footer>
      </f7-page>
    </f7-popup>

  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    return {
      events: {},
      talks: {},
      thisTalk: {class:'UNKNOWN'},
      thisEvent: {},
      popupTalkEdit: false,
    };
  },
  mounted()
  {
    const self = this;
    self.fetchTalks();
  },
  methods : {
    talkIcon: function(talk) {
      const self = this;
      var icon = '';
      if(talk.hasOwnProperty('event'))
        icon = 'fa-check-square-o'
      else if(talk.hasOwnProperty('request'))
        icon = 'fa-clock-o';
      else
        icon = ' ';
      return 'fa ' + icon + ' fa-fw';
    },
    fetchTalks: function() {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.promiseWithAuth('admin/talk/list/50').then(function(x) {
        self.talks = JSON.parse(x.data).data;
        app.preloader.hide();
      });
    },
    updateTalkPopup: function(talk) {
      const self = this;
      self.thisTalk = talk;
      self.popupTalkEdit = true;
    },
    updateThisTalk: function() {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('admin/talk/update', self.thisTalk)
        .then(function(x) {
          var res = JSON.parse(x.data).data;
          self.notify(res.status?"Failed":"Success", res.msg, 3000);
          self.fetchTalks();
          self.popupTalkEdit = false;
        });
    },
    deleteEventOfThisTalk: function(ev) {
      const self = this;
      const app = self.$f7;
      app.dialog.confirm("Deleting confirmed event associated with a talk."
        , "Are you sure?"
        , function(x) {
          ev['status'] = 'CANCELLED';
          self.promiseWithAuth('admin/event/delete', ev).then(function(x) {
            self.promiseWithAuth('admin/talk/get/'+self.thisTalk.id)
              .then(function(x) {
                self.thisTalk = JSON.parse(x.data).data;
              });
          });
        }, null);
    },
    deleteRequestOfThisTalk: function(req) {
      const self = this;
      const app = self.$f7;
      app.dialog.confirm("Deleting pending request associated with a talk."
        , "Are you sure?"
        , function(x) {
          req['status'] = 'CANCELLED';
          self.promiseWithAuth('admin/request/delete', req).then(function(x) {
            self.promiseWithAuth('admin/talk/get/'+self.thisTalk.id)
              .then(function(x) {
                self.thisTalk = JSON.parse(x.data).data;
              });
          });
        }, null);
    },
    approveRequest: function(req) {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('admin/request/approve', req).then(function(x) {
        self.promiseWithAuth('admin/talk/get/'+self.thisTalk.id)
          .then(function(x) {
            self.thisTalk = JSON.parse(x.data).data;
            self.fetchTalks();
          });
      });
    },
  },
}
</script>
