<template>
  <f7-page>

    <f7-navbar title="AWS Roster" back-link="Back">
      <f7-subnavbar :inner="false">
        <f7-searchbar search-container=".aws-roster"
          search-in=".item-title, .item-subtitle, .item-header, .item-footer, .item-text"> 
        </f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <!-- POPUP ASSIGN AWS. -->
    <f7-popup :opened="popupAssignAWS" @popup:close="popupAssignAWS = false">
      <f7-page>
        <f7-navbar title="Assign AWS">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
    
        <f7-block>
          <f7-list no-hairlines>
            <f7-list-input label="Speaker" readonly :value="thisSpeaker | name" >
            </f7-list-input>
            <f7-list-input label="PI/HOST Email"
                           :value="thisSpeaker.pi_or_host"
                           @input="thisSpeaker.pi_or_host=$event.target.value"
                           >
            </f7-list-input> 
          </f7-list>
        </f7-block>

        <f7-block>
          <f7-block-title>Available dates</f7-block-title>
          <f7-list no-hairlines media-list>
            <!-- Following dates are available. -->
            <f7-list-item :key="key"
                   v-for="(date, key) in availableAWSDates" 
                   :title="date">
              <div slot="header"> In {{toNow(date, '')}} </div>
              <f7-button slot="after"> Assign </f7-button>
            </f7-list-item>
          </f7-list>
        </f7-block>
      </f7-page>
    </f7-popup>

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
      <f7-block-title small> 
        Total {{speakers.length}} speakers.
      </f7-block-title>
      <f7-list media-list accordion-list no-hairlines class="aws-roster">
        <f7-list-input :input="false" label="Type login to add to roster">
          <input id="autocomplete_hippo_login" 
                 slot="input"
                 placeholder="Type login to add to roster"/>
        </f7-list-input>
        <f7-list-item v-for="(speaker, key) in speakers"
                      :key="key"
                      accordion-item>
          <div slot="title">{{speaker|name}} ({{speaker.login}})</div>
          <div slot="text">{{speaker.pi_or_host}} | {{speaker.specialization}} </div>
          <div slot="after">{{speaker.num_aws}} </div>
          <div slot="header">Last AWS {{speaker.days_since_last_aws}} days ago</div>
          <f7-icon slot="media" 
               v-if="speaker.days_since_last_aws >= 730" 
               icon="fa fa-bolt fa-2x">
          </f7-icon>

          <!-- accordion content -->
          <f7-accordion-content>
            <f7-block>
              <f7-row>
                <f7-col>
                  <f7-button @click="removeFromAwsRoster(speaker.login)">
                    Remove
                  </f7-button>
                </f7-col>
                <f7-col v-if="speaker.days_since_last_aws >= 730">
                  <f7-button @click="assignAWS(speaker)">Assign a slot</f7-button>
                </f7-col>
              </f7-row>
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
      popupAssignAWS: false,
      availableAWSDates: [],
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
      valueProperty: 'login',
      textProperty: 'nameWithPIOrHost',

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
          .then( function(x)  {
            var res = JSON.parse(x.data);
            res.map(function(e) {
              e.nameWithPIOrHost = e.name + ' (PI/HOST: ' + e.pi_or_host + ')';
            });
            autocomplete.preloaderHide();
            render(res);
          });
      },
      on: {
        change: function(val) {
          self.thisSpeaker.login = val[0].login;
          app.dialog.confirm("Add to AWS roster?", self.thisSpeaker.login
            , function(v) {
              console.log('Adding ' + val[0] + ' to roster');
              self.addToAWSRoster();
            }, null);
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
      app.dialog.preloader('Fetching AWS roster...');
      self.promiseWithAuth('acadadmin/awsroster/fetch')
        .then( function(x) {
          self.speakers = JSON.parse(x.data).data;
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 5000);
    },
    addToAWSRoster: function(speaker) 
    {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader('Adding to AWS roster');
      self.promiseWithAuth('acadadmin/awsroster/add/'+self.thisSpeaker.login)
        .then( function(x) {
          var res = JSON.parse(x.data).data;
          app.dialog.close();
          if(! res.success)
            self.notify('Failed', res.msg);
          else
          {
            self.notify('Success', res.msg);
            thisSpeaker.login = '';
          }
        });
      setTimeout(()=> app.dialog.close(), 5000);
    },
    openSpeakerPopup: function(speaker)
    {
      const self = this;
      self.thisSpeaker = speaker;
      self.popupSpeaker = true;
    },
    assignAWS: function(speaker) {
      const self = this;
      const app = self.$f7;
      self.thisSpeaker = speaker;
      console.log("Try to assign a slot for " + speaker.login);
      self.promiseWithAuth('acadadmin/awsroster/available_dates/10')
        .then( function(x) {
          self.availableAWSDates = JSON.parse(x.data).data;
          console.log('date: ', self.availableAWSDates);
          self.popupAssignAWS = true;
        });
    },
    removeFromAwsRoster: function(login)
    {
      const self = this;
      const app = self.$f7;
      app.dialog.prompt("Reason?", "Removing from AWS"
        , function(value) {
            console.log("Removing user " + login);
            self.promiseWithAuth('acadadmin/awsroster/remove/'+login,{reason:value})
              .then( function(x) {
                let res = JSON.parse(x.data).data;
                if(res.success)
                {
                  self.speakers = self.speakers.filter(a => a.login !== login);
                  self.notify('Success', res.msg);
                }
                else
                  self.notify('Failed', res.msg);
              });
        });
    },
  }
}
</script>

