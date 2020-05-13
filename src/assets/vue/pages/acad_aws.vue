<template>
  <f7-page ptr ptr:refresh="refreshPage">
    <f7-navbar title="Upcoming AWS" back-link="Back">
    </f7-navbar>

    <!-- POPUP ASSIGN -->
    <f7-popup :opened="openAssignPopup" @popup:close="openAssignPopup=false">
      <f7-page>
        <f7-navbar title="Assign AWS">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block>
          <f7-list no-hairlines media-list>

            <f7-list-input :input="false" label="Date">
              <date-picker lang="en"
                slot="input"
                v-model="thisAWS.date"
                format="YYYY-MM-DD"
                type="date">
              </date-picker>
            </f7-list-input>

            <f7-list-input label="Speaker" type="text" :input="false">
              <input id="autocomplete_aws_speaker"  
                :value="thisAWS.speaker"
                @input="thisAWS.speaker = $event.target.value"
                slot="input" type="text" />
            </f7-list-input>
          </f7-list>
          <f7-row>
            <f7-col>
              <f7-button popup-close raised @click="assignThisAWS()"> 
                Assign
              </f7-button>
            </f7-col>
          </f7-row>
        </f7-block>
      </f7-page>
    </f7-popup>

    <!-- POPUP EDIT -->
    <f7-popup :opened="openEditPopup" @popup:close="openEditPopup = false">
      <f7-page>
        <f7-navbar title="Edit AWS">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block>
          <f7-list no-hairlines>

            <f7-list-input :value="thisAWS.date" label="Date" readonly>
            </f7-list-input>

            <f7-list-input :value="thisAWS.venue"  readonly label="Venue">
            </f7-list-input>

            <f7-list-input label="Speaker" readonly :value="thisAWS.speaker">
            </f7-list-input>

            <!-- FOLLOWING ITEMS APPEARS ONLY WHEN EDITING AWS -->
            <f7-list-input label="Title"
              resizable
              :value="thisAWS.title"
              @input="thisAWS.title=$event.target.value"
              type="text">
            </f7-list-input>

            <f7-list-item label="Description">
              <vue-editor ref="quillEditor" v-model="thisAWS.abstract">
              </vue-editor>
            </f7-list-item>
          </f7-list>

          <f7-button raised popup-close @click="editThisAWS()"> Update </f7-button>

        </f7-block>
      </f7-page>
    </f7-popup>

    <!-- Change AWS weekly info . -->
    <f7-popup :opened="popupWeeklyInfo" @popup:close="popupWeeklyInfo=false">
      <f7-page>
        <f7-navbar title="Change location and chair">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block>
          <f7-list no-hairlines>

            <f7-list-input :value="thisAWS.date" label="Date" readonly
              inline-label>
            </f7-list-input>

            <f7-list-input @change="thisAWS.venue=$event.target.value"
              :default="thisAWS.venue" type="select" label="Venue"
              inline-label>
              <option v-for="(venue, key) in venues" :selected="venue.id===thisAWS.venue">
                {{key}}
              </option>
            </f7-list-input>

            <f7-list-input :input="false" label="Chair" inline-label>
              <v-autocomplete  slot="input"
                input-class="form-control"
                ref="refAWSChair"
                :placeholder="thisAWS.chair?thisAWS.chair:'Search faculty'"
                :initial-value="thisAWS.chair"
                results-property="email"
                results-display="name"
                results-value="email"
                :request-headers="apiPostData()"
                method="post"
                @selected="chairSelected"
                :source="(q)=>searchPeopleURI(q, 'faculty')">
              </v-autocomplete>
            </f7-list-input>

            <f7-list-input label="Has chair confirmed?" inline-label
              :value="thisAWS.has_chair_confirmed" readonly>
            </f7-list-input>

            <f7-list-input type="url" 
              label="VC URL"  inline-label
              :value="thisAWS.vc_url"
              @change="thisAWS.vc_url=$event.target.value">
            </f7-list-input>
          </f7-list>

          <f7-row>
            <f7-col v-if="thisAWS.chair && thisAWS.has_chair_confirmed === 'NO'">
              Chair has not confirmed yet. You can also confirm on the chair
              behalf if they have told you so.
              <f7-button raised @click="confirmChair">
                Confirm Chair
              </f7-button>
            </f7-col>
            <f7-col>
              <f7-button small @click="removeChair()">Remove Chair</f7-button>
            </f7-col>
            <f7-col>
              <f7-button raised small fill @click="changeAWSData"> Submit </f7-button>
            </f7-col>
          </f7-row>

        </f7-block>
      </f7-page>
    </f7-popup>

    <f7-block-header>
      Click on an AWS item below to see and modify details.

      <f7-button small fill raised tooltip="Select a day and assign AWS"
        @click="openAssignPopup=true" style="float:right"> 
        Assign AWS
      </f7-button>
    </f7-block-header>

    <!-- LIST OF UPCOMING AWSes -->
    <f7-list accordion-list no-hairlines>
      <f7-list-item accordion-item v-for="(AWSes, date) in upcomingAWS" 
        :header="humanReadableDate(date) + ' | ' + AWSes[0].venue"
        :after="AWSes.length<3?'Some slots missing.':''"
        :key="date">

        <div slot="title">{{awsSummary(AWSes)}}</div>
        <div slot="footer">
          <i class="fa fa-chair"></i>
          {{AWSes[0].chair?AWSes[0].chair:'No chair assigned'}}
          <span tooltip="Chair has confirmed?" v-if="AWSes[0].chair">
            (confirmed: {{AWSes[0].has_chair_confirmed}})
          </span>
        </div>

        <f7-accordion-content style="background-color:ivory">
          <f7-block no-margin inset>
            <f7-row>
              <f7-col col-30>
                <f7-button small @click="openChangeWeekPopup(AWSes[0])">
                  Change Venue/Chair
                </f7-button>
              </f7-col>
              <f7-col col-30>
                <f7-button small icon="far fa-envelope" 
                  :href="'/email/upcoming_aws/'+AWSes[0].date">Send Email
                </f7-button>
              </f7-col>
              <f7-col v-if="AWSes.length < 3">
                <f7-button small fill @click="addAWSSchedule(date, AWSes[0])">
                  Fill missing slot
                </f7-button>
              </f7-col>
            </f7-row>

            <f7-card v-for="(aws, key) in AWSes" :key="key" outline no-shadow>
              <f7-card-header>
                <div v-html="aws.by" class="color-gray"></div>
                <div v-html="aws.title"></div>
              </f7-card-header>
              <f7-card-content>
                <f7-block-header> {{aws.title}} </f7-block-header>
                <div v-html="aws.abstract"></div>
                <div slot="media" v-if="aws.acknowledged==='NO'">
                  <f7-icon icon="fa fa-question fa-2x"></f7-icon>
                </div>
                <div slot="media" v-else>
                  <f7-icon icon="fa fa-check fa-fw"></f7-icon>
                </div>
                <f7-row>
                  <f7-col>{{aws.supervisor_1}}</f7-col>
                  <f7-col>{{aws.supervisor_2}}</f7-col>
                </f7-row>
                <f7-row>
                  <f7-col>
                    <f7-button small @click="removeAWS(aws)" color="red">
                      Remove
                    </f7-button>
                  </f7-col>
                  <f7-col>
                    <f7-button small @click="editAWSClick(aws)">
                      Edit
                    </f7-button>
                  </f7-col>
                </f7-row>
              </f7-card-content>
            </f7-card>
          </f7-block>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>

    <!-- Upcoming schedule -->
    <f7-block-title small>
      Click on login to assign AWS.
      <f7-button small color="gray" fill style="float:right"
        @click="computeSchedule()">
        Recompute Schedule
      </f7-button>
    </f7-block-title>

    <f7-block>
      <div v-for="(awses, date) in schedule"
           style="border-top:1px solid lightgray"
           :key="'xyz'+date">
        <f7-row>
          <f7-col width="25"> 
            {{humanReadableDate(awses[0].date)}}
            <f7-button small raised @click="acceptSchedule(awses)">Accept All</f7-button>
          </f7-col>
          <f7-col width="25" v-for="(aws, key) in awses" :key="'yy'+key" no-gap>
            <f7-link @click="acceptSchedule([aws])">
              {{aws.speaker}} <sup>{{aws.num_aws}}</sup>
            </f7-link>
            <br />
            <span style="font-size:xx-small">{{aws.specialization}}
              <br />
              Last AWS {{str2Moment(aws['date'], 'YYYY-MM-DD')
              .diff(str2Moment(aws.last_aws_date, 'YYYY-MM-DD'), 'days')}} ago
            </span>
          </f7-col>
          <f7-col v-for="i in 3-awses.length" width="25" :key="'xxx'+i">
          </f7-col>
        </f7-row>
      </div>
    </f7-block>

  </f7-page>
</template>

<script>
import moment from 'moment';
export default {
  data() {
    const self = this;
    return {
      thisAWS: {date:'', speaker:'', venue:'', title:'', abstract:'', chair:'', vc_url:""},
      venues: [],
      upcomingAWS: [],
      popupTitle: 'Review request',
      openAssignPopup: false,
      popupWeeklyInfo: false,
      openEditPopup: false,
      popupAction: '',
      resules: [],
      schedule: {},
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;

    self.fetchUpcomingAws();
    self.fetchSchedule();

    // Autocomplete.
    app.autocomplete.create({
      inputEl : '#autocomplete_aws_speaker',
      openIn: 'dropdown',
      //expandInput: true,

      source: function(q, render)
      {
        const autocomplete = this;
        var results = [];

        if(1 >= q.length)
        {
          render(results);
          return;
        }

        autocomplete.preloaderShow();

        self.promiseWithAuth('search/awsspeaker/'+q)
          .then( function(x) {
            let res = JSON.parse(x.data);
            results = res.map(a=> a.login);
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
      app.preloader.show();
      self.promiseWithAuth('/acadadmin/upcomingaws/upcoming')
        .then( function(x) {
          self.upcomingAWS = JSON.parse(x.data).data;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 10000);
    },
    fetchSchedule: function()
    {
      const self = this;
      self.promiseWithAuth('/info/aws_schedule')
        .then( function(x) {
          self.schedule = JSON.parse(x.data).data;
        });
    },
    acceptSchedule: async function(awses)
    {
      const self = this;
      const app = self.$f7;

      app.dialog.preloader('Assigning AWSes: ' + Object.keys(awses).join(', '));
      for(let key in awses)
      {
        //console.log(key, self.thisAWS);
        self.thisAWS = awses[key];
        await self.assignThisAWS();
      }
      self.computeSchedule();
      app.dialog.close();
    },
    addAWSSchedule: async function(date, aws) 
    {
      const self = this;
      self.thisDate = date;
      if(! aws)
        self.thisAWS = {date:'', speaker:'', venue:''};
      else
        self.thisAWS = aws;
      self.thisAWS.date = date;
      self.thisAWS.speaker = '';
      self.popupTitle = "Add to AWS Schedule";
      self.popupAction = 'Assign';
      self.openAssignPopup = true;
    },
    editAWSClick: function(aws) 
    {
      const self = this;
      self.thisAWS = aws;
      self.popupTitle = "Editing AWS";
      self.popupAction = 'Edit';
      self.openEditPopup = true;
    },
    editThisAWS: function()
    {
      const self = this;
      self.sendRequest('acadadmin/upcomingaws/update', self.thisAWS).then( function(x){
        self.fetchUpcomingAws();
      });
    },
    assignThisAWS: async function()
    {
      const self = this;
      const app = self.$f7;
      self.thisAWS.date = self.dbDate(self.thisAWS.date);
      self.thisAWS.status = 'VALID'
      //app.dialog.preloader('Assigning AWS of ' + self.thisAWS.speaker);
      app.preloader.show();
      return self.promiseWithAuth('/acadadmin/upcomingaws/assign', self.thisAWS)
        .then( function(x) {
          var res = JSON.parse(x.data).data;
          if(! res.success)
            self.notify('Failed', res.msg);
          else
            self.notify('Success', res.msg);
          self.fetchUpcomingAws();
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 2000);
    },
    computeSchedule: function()
    {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.promiseWithAuth('acadadmin/reschedule')
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          self.fetchSchedule();
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 10000);
    },
    openChangeWeekPopup: function(aws) {
      const self = this;
      self.thisAWS = aws;
      self.postWithPromise('aws/vc_url/get').then(function(x) {
        self.thisAWS.vc_url = JSON.parse(x.data).data.AWS_VC_URL;
      });
      self.postWithPromise('venue/list/aws').then(function(x) {
        self.venues = JSON.parse(x.data).data;
        self.popupWeeklyInfo = true;
      });
    },
    removeChair: function() {
      const self = this;
      self.postWithPromise('acadadmin/upcomingaws/weekinfo/removechair/'+self.thisAWS.date)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Removed chair." + res.msg);
            self.thisAWS.chair = '';
          }
          else
            self.notify("Failed", res.msg);
          self.fetchUpcomingAws();
        });
    },
    changeAWSData: function() 
    {
      const self = this;
      self.promiseWithAuth('acadadmin/upcomingaws/weekinfo/change', self.thisAWS).then(function(x) {
        let res = JSON.parse(x.data).data;
        if(res.success)
          self.notify("Success", "Updated successfully." + res.msg);
        else
          self.notify("Failed", res.msg);
        self.fetchUpcomingAws();
        self.popupWeeklyInfo = false;
      });
      setTimeout(() => self.popupWeeklyInfo = false, 3000);
    },
    awsSummary: function(awses) {
      let title = '';
      awses.forEach(aws => {
        title += aws.speaker + ', ';
      });
      return title;
    },
    removeAWS: function(aws) 
    {
      const self = this;
      const app = self.$f7;
      app.dialog.prompt("Please give a reason..."
        , "Removing scheduled AWS ..."
        , function(value) {
          if( value.length <= 8)
          {
            app.dialog.alert("At least 8 char..."
              , "Reason is too short.", null);
            return;
          }
          aws['reason'] = value;
          self.promiseWithAuth('acadadmin/upcomingaws/cancel', aws)
            .then( function(x) {
              self.fetchUpcomingAws();
              self.notify("Success", "AWS is removed.");
            });
        }, function(ev) {
          console.log( 'NAH');
        });
    },
    chairSelected: function(x) {
      const self = this;
      self.thisAWS.chair = x.selectedObject.email;
    },
    confirmChair: function() {
      const self = this;
      self.promiseWithAuth('acadadmin/upcomingaws/confirmchair/'+self.thisAWS.date)
        .then( function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Successfully confirmed the chair");
            self.fetchUpcomingAws();
            self.popupWeeklyInfo = false;
          }
          else
            self.notify("Failed", res.msg);
        });
    },
  },
}
</script>
