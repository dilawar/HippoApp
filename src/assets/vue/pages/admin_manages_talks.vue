<template>
  <f7-page>
    <f7-navbar title="Talks/Seminars" back-link="Back">
      <f7-subnavbar :inner="false">
        <f7-searchbar
          search-container=".event-list"
          search-in=".item-header, .item-title, .item-subtitle, .item-text, .item-footer">
        </f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <f7-list media-list class="event-list">
      <f7-list-item v-for="(talk, key) in talks" @click="updateTalkPopup(talk)" :key="key">
        <div slot="title">{{talk.class}} by {{talk.speaker}}</div>
        <div slot="subtitle">{{talk.title}} </div>
        <div slot="footer"> Created: {{talk.created_on}}, by {{talk.created_by}}</div>
        <f7-icon slot="media" :icon="talkIcon(talk)">
        </f7-icon>
        <!--
          <f7-accordion-content>
          <f7-block strong inset style="background-color:wheat">
          <f7-block-title small>{{talk.title}}</f7-block-title>
          <div v-html="talk.description"></div>
          </f7-block>
          </f7-accordion-content>
        -->
      </f7-list-item>
    </f7-list>

    <!-- POPUP  -->
    <f7-popup :opened="popupTalkEdit" @popup:close="popupTalkEdit = false">
      <f7-page>
        <f7-navbar title="Update Talk">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block>
          <f7-block-header>
            <div> {{thisTalk.speaker}} </div>

            <f7-card :padding="false" v-if="thisTalk.hasOwnProperty('event')">
              <f7-card-header>
                <strong>CONFIRMED</strong> booking. 
                <f7-button raised color=red small class="float-right">
                  Delete Booking
                </f7-button>
              </f7-card-header>
              <f7-card-content>
                <strong>{{thisTalk.event.venue}}</strong>,
                <strong>{{thisTalk.event.date | date}}</strong>,
                <strong>{{thisTalk.event.start_time | clockTime}}</strong>
              </f7-card-content>
            </f7-card>

            <div v-if="thisTalk.hasOwnProperty('request')">
              <strong>{{thisTalk.request.venue}}</strong>,
              <strong>{{thisTalk.request.date | date}}</strong>,
              <strong>{{thisTalk.request.start_time | clockTime}} </strong>
              (PENDING APPROVAL)
            </div>
          </f7-block-header>

          <f7-list no-hairlines>

            <f7-list-input label="Title"
                 :value="thisTalk.title" type="text"
                 @change="thisTalk.title=$event.target.value">
            </f7-list-input>

            <f7-list-input label="Description (optional)" resizable
                           :textEditorParams="{mode: 'toolbar'}"
                           :value="thisTalk.description"
                           @texteditor:change="(v)=>thisTalk.description=v"
                           type="texteditor">
            </f7-list-input>
            <!--
            <f7-list-input :input="false" label="Description">
              <vue-editor id="talk-desc" slot="input" v-model="thisTalk.description">
              </vue-editor>
            </f7-list-input>
            -->


          </f7-list>
          <f7-row>
            <f7-col>
              <f7-button raised fill @click="updateThisTalk()">
                Update This Talk
              </f7-button>
            </f7-col>
          </f7-row>
          <f7-block-footer>
          </f7-block-footer>
        </f7-block>
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
      thisTalk: {},
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
        icon = 'fa fa-question-circle-o';
      return 'fa ' + icon + ' fa-2x';
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
  },
}
</script>
