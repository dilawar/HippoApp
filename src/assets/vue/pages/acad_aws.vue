<template>
   <f7-page ptr ptr:refresh="refreshPage">
      <f7-navbar title="Annual Work Seminar" back-link="Back">
      </f7-navbar>

      <!-- POPUP -->
      <f7-popup :opened="openPopup" @popup:close="openPopup = false">
        <f7-page>
          <f7-navbar :title="popupTitle">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>

          <f7-block>
            <f7-list no-hairlines>

              <f7-list-input :value="thisAWS.date" label="Date">
              </f7-list-input>

              <f7-list-input :value="thisAWS.venue" label="Venue">
              </f7-list-input>

              <f7-list-input label="Speaker"
                             type="text"
                             :input="false" 
                             >
                             <input id="autocomplete_aws_speaker"  
                                    :value="thisAWS.speaker"
                                    @input="thisAWS.speaker = $event.target.value"
                                    slot="input" type="text" />
              </f7-list-input>
            </f7-list>
            <f7-row>
              <f7-col>
                <f7-button popup-close raised outline
                           @click="assignThisAWS()"
                           >
                           Assign
                </f7-button>
              </f7-col>
            </f7-row>

          </f7-block>
        </f7-page>
      </f7-popup>


      <f7-block-title small>Upcoming Annual Work Seminars</f7-block-title>
      <f7-block>

        <f7-list media-list accordion-list
                 v-for="(AWSes, date) in upcomingAWS"
                 :key="'aws'+date"
                 >

          <f7-block-title>{{date | date }}, {{venueInfo(AWSes[0].venue)}} </f7-block-title>
          <f7-list-item v-if="AWSes.length < 3">
            <f7-button style="float:right" 
                       @click="addAWSSchedule(date, AWSes[0])"
                       small outline raised>
              Add AWS
            </f7-button>
          </f7-list-item>

          <f7-list-item v-for="(aws, key) in AWSes"
                        :key="key"
                        accordion-item
                        >
            <div slot="title" v-html="aws.by"></div>
            <div slot="text" v-html="aws.title"></div>
            <div slot="footer">{{aws.supervisor_1}}</div>
            <div slot="footer">{{aws.supervisor_2}}</div>
            <f7-accordion-content>
              <div v-html="aws.title"></div>
              <div v-html="aws.description"></div>
              <f7-row>
                <f7-col>
                  <f7-button small 
                             fill 
                             @click="cancelAWS(aws)"
                             color="red">
                    Cancel
                  </f7-button>
                </f7-col>
                <f7-col></f7-col>
                <f7-col>
                  <f7-button small fill>Edit</f7-button>
                </f7-col>
              </f7-row>
            </f7-accordion-content>
            <div slot="media" v-if="aws.acknowledged==='NO'">
              <f7-icon fa="thumbs-down fa-fw"></f7-icon>
            </div>
            <div slot="media" v-else>
              <f7-icon fa="check fa-fw"></f7-icon>
            </div>
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
        thisAWS: [],
        upcomingAWS: [],
        popupTitle: 'Review request',
        openPopup: false,
        resules: [],
      };
    },
    mounted()
    {
      const self = this;
      const app = self.$f7;

      self.fetchUpcomingAws();

      // Autocomplete.
      app.autocomplete.create({
        inputEl : '#autocomplete_aws_speaker',
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

          self.promiseWithAuth('search/awsspeaker/'+q)
            .then( (json) => {
              var res = JSON.parse(json).data;
              results = res.map(x=> x.login);
              autocomplete.preloaderHide();
              render(results);
            });
        },
        on: {
          change: function(val) {
            self.thisAWS.speaker = val[0];
          },
        },
      });

    },
    methods : {
      refreshData: function()
      {
        const self = this;
      },
      refreshPage: function()
      {
        const self = this;
      },
      fetchUpcomingAws: function() 
      {
        const self = this;
        const app = self.$f7;
        app.dialog.preloader();
        self.promiseWithAuth('/acadadmin/aws/upcoming')
          .then( function(json) {
            self.upcomingAWS = JSON.parse(json).data;
            app.dialog.close();
          });
      },
      addAWSSchedule: function(date, aws) 
      {
        const self = this;
        self.thisDate = date;
        if(! aws)
          self.thisAWS = {date:'', speaker:'', venue:''};
        else
          self.thisAWS = aws;
        self.thisAWS.date = date;
        self.thisAWS.speaker = '';
        self.popupTitle = "Added AWS Schedule";
        self.openPopup = true;
      },
      assignThisAWS: function()
      {
        const self = this;
        const app = self.$f7;
        console.log('thisAWS', self.thisAWS);
        app.dialog.preloader();
        self.promiseWithAuth('/acadadmin/aws/assign', self.thisAWS)
          .then( function(json) {
            console.log('json', json);
            app.dialog.close();
          });
      },
      cancelAWS: function(aws) 
      {
        const self = this;
        const app = self.$f7;
        app.dialog.confirm("Are you sure?"
          , "Cancelling AWS ..."
          , function(ev) {
            console.log('OK');
            self.promiseWithAuth('acadadmin/aws/cancel', self.thisAWS)
              .then( function(json) {
                console.log('cancelled');
              });
          }, function(ev) {
            console.log( 'NAH');
          });
      },
    },
  }
</script>
