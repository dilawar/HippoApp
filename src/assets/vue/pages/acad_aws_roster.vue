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

    <!-- POPUP SPEAKER. CURRENTLY DOES NOTHING. -->
    <f7-popup :opened="popupSpeaker" @popup:close="popupSpeaker = false">
      <f7-page>
        <f7-navbar title="Updating AWS Speaker">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
    
        <f7-block>

          <f7-list no-hairlines>
            <f7-list-input label="Speaker" readonly
                           :value="thisSpeaker | name"
                           >
            </f7-list-input>
            <f7-list-input label="PI/HOST Email"
                           :value="thisSpeaker.pi_or_host"
                           @input="thisSpeaker.pi_or_host=$event.target.value"
                           >
            </f7-list-input> 
            <f7-list-item title="Eligible for AWS"
                          :checked="thisSpeaker.eligible_for_aws==='YES'"
                          checkbox
                          >
            </f7-list-item>
          </f7-list>
          <f7-col>
            <f7-button popup-close raised outline>Update</f7-button>
          </f7-col>

        </f7-block>

      </f7-page>
    </f7-popup>
    <f7-block>
      <f7-row>
        <f7-col>
          <input id="autocomplete_hippo_login" 
                    type="input" 
                    placeholder="Hippo login"
            />
        </f7-col>
        <f7-col>
          <f7-button @click="addToAWSRoster(thisSpeaker)">
            Add To Roster
          </f7-button>
        </f7-col>
      </f7-row>

      <f7-block-title small> 
        Total {{speakers.length}} speakers.
      </f7-block-title>
      <f7-list media-list
               accordion-list
               no-hairlines
               class="aws-roster"
               >
        <f7-list-item v-for="(speaker, key) in speakers"
                      :key="key"
                      accordion-item
                      >
          <div slot="subtitle">{{speaker|name}} ({{speaker.login}})</div>
          <div slot="footer">{{speaker.pi_or_host}}</div>

          <!-- accordion content -->
          <f7-accordion-content>
            <f7-block>
              <f7-col>
                <f7-button color="red" 
                  @click="removeFromAwsRoster(speaker.login)">
                  Remove
                </f7-button>
              </f7-col>
            </f7-block>
          </f7-accordion-content>

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
      thisSpeaker: {},
      popupSpeaker: false,
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;

    self.fetchAWSSpeakers();

    // Autocomplete.
    app.autocomplete.create({
      inputEl : '#autocomplete_hippo_login',
      openIn: 'dropdown',
      //expandInput: true,

      source: function(q, render)
      {
        const autocomplete = this;
        var results = [];

        if(2 >= q.length)
        {
          render(results);
          return;
        }

        autocomplete.preloaderShow();

        self.promiseWithAuth('search/login/'+q)
          .then( (json) => {
            var res = JSON.parse(json).data;
            results = res.map(x=> x.login);
            autocomplete.preloaderHide();
            render(results);
          });
      },
      on: {
        change: function(val) {
          self.thisSpeaker.login = val[0];
        },
      },
    });

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
      self.promiseWithAuth('acadadmin/awsroster/fetch')
        .then( function(json) {
          self.speakers = JSON.parse(json).data;
          app.dialog.close();
        });
    },
    addToAWSRoster: function(speaker) 
    {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader();
      self.promiseWithAuth('acadadmin/awsroster/add/'+self.thisSpeaker.login)
        .then( function(json) {
          var ret = JSON.parse(json).data;
          app.dialog.close();
          if(! res.success)
            navigator.notifications.alert(res.msg, null, "Failed");
          else
            thisSpeaker.login = '';
        });
      setTimeout(()=> app.dialog.close(), 1000);
    },
    openSpeakerPopup: function(speaker)
    {
      const self = this;
      self.thisSpeaker = speaker;
      self.popupSpeaker = true;
    },
    removeFromAwsRoster: function(login)
    {
      const self = this;
      const app = self.$f7;
      app.dialog.prompt("Reason?", "Removing from AWS"
        , function(value) {
            console.log("Removing user " + login);
            self.promiseWithAuth('acadadmin/awsroster/remove/'+login,{reason:value})
              .then( function(json) {
                //self.fetchAWSSpeakers();
                self.speakers = self.speakers.filter(x => x.login !== login);
              });
        });
    },
  }
}
</script>

