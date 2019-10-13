<template>
  <f7-page>
    <f7-navbar title="AWS Roster" back-link="Back">
      <f7-subnavbar :inner="false">
        <f7-searchbar
          search-container=".aws-roster"
          search-in=".item-title, .item-subtitle, .item-header, .item-footer"
          > 
        </f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <!-- POPUP SPEAKER -->



    <f7-block>
      <f7-block-title small>Total {{speakers.length}} speakers.</f7-block-title>

      <f7-list media-list
               no-hairlines
               class="aws-roster"
               >
        <f7-list-item v-for="(speaker, key) in speakers"
                      @click="openSpeakerPopup(speaker)"
                      >
          <div slot="header">{{speaker.login}}
            <span style="font-variant:small-caps">
              {{speaker.specialization}}
            </span>
            ({{speaker.total}})
          </div>
          <div slot="subtitle">{{speaker | name}}</div>
          <div slot="footer">{{speaker.pi_or_host}}</div>
        </f7-list-item>
      </f7-list>

    </f7-block>

  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    return {
      speakers: [],
      thisSpeaker: null,
      popupSpeaker: false,
      popupSpekaerTitle: 'AWS Speaker',
    };
  },
  mounted()
  {
    const self = this;
    self.fetchAWSSpeakers();
  },
  methods : {
    refreshData: function( ) 
    {
      const self = this;
    },
    fetchAWSSpeakers: function() 
    {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader();
      self.promiseWithAuth('acadadmin/aws/roster')
        .then( function(json) {
          self.speakers = JSON.parse(json).data;
          app.dialog.close();
        });
    },
    openSpeakerPopup: function(speaker)
    {
      const self = this;
      self.thisSpeaker = speaker;
      self.openSpeakerPopup = true;
    },
  }
}
</script>

