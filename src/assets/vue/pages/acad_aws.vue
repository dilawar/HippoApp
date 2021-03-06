<template>
  <f7-page>
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
              <f7-button popup-close fill raised @click="assignThisAWS()"> 
                Assign
              </f7-button>
            </f7-col>
          </f7-row>
        </f7-block>
      </f7-page>
    </f7-popup>

    <!-- POPUP EDIT -->
    <f7-popup popup-tablet-fullscreen :opened="openEditPopup" @popup:close="openEditPopup = false">
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

            <f7-list-input label="First Supervisor" 
              type="email" validate
              :value="thisAWS.supervisor_1"
              @input="thisAWS.supervisor_1=$event.target.value">
            </f7-list-input>

            <f7-list-input label="Second Supervisor (optional)" 
              type="email" validate
              :value="thisAWS.supervisor_2"
              @input="thisAWS.supervisor_2=$event.target.value">
            </f7-list-input>

          </f7-list>

          <f7-button raised popup-close @click="editThisAWS()"> Update </f7-button>

        </f7-block>
      </f7-page>
    </f7-popup>

    <!-- Change AWS weekly info . -->
    <f7-popup :opened="popupWeeklyInfo" @popup:close="popupWeeklyInfo=false">
      <f7-page>
        <f7-navbar title="Change Venue/Chair">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block>
          <f7-list no-hairlines media-list>

            <f7-list-input :value="thisAWS.date" label="Date" readonly>
            </f7-list-input>

            <f7-list-input @change="thisAWS.venue=$event.target.value"
              :default="thisAWS.venue" type="select" label="Venue">
              <option v-for="(venue, key) in venues" :selected="venue.id===thisAWS.venue">
                {{key}}
              </option>
            </f7-list-input>

            <f7-list-input :input="false" label="Chair">
              <v-autocomplete  slot="input"
                input-class="form-control"
                ref="refAWSChair"
                :placeholder="thisAWS.chair?thisAWS.chair:'Search faculty'"
                results-property="email"
                results-display="name"
                results-value="email"
                :request-headers="apiPostData()"
                method="post"
                @selected="chairSelected"
                :source="(q)=>searchPeopleURI(q, 'faculty')">
              </v-autocomplete>
            </f7-list-input>

            <f7-list-input label="Has chair confirmed?"
              :value="thisAWS.has_chair_confirmed" readonly>
            </f7-list-input>

            <f7-list-input 
              type="url"
              validate
              label="VC URL" 
              :value="thisAWS.vc_url"
              @change="thisAWS.vc_url=$event.target.value">
            </f7-list-input>

            <f7-list-input 
              label="VC Extra (e.g. passcode)" 
              :value="thisAWS.vc_extra"
              @change="thisAWS.vc_extra=$event.target.value">
            </f7-list-input>

            <f7-list-item v-if="thisAWS.chair && thisAWS.has_chair_confirmed === 'NO'">
              <div slot="header">
                Chair has not confirmed yet. You can also confirm on the chair
                behalf.
              </div>
              <f7-button raised small @click="confirmChair" slot="header">
                Confirm Chair
              </f7-button>
            </f7-list-item>
          </f7-list>

          <f7-row>
            <f7-col>
              <f7-button fill color=red @click="removeChair()">Remove Chair</f7-button>
            </f7-col>
            <f7-col>
              <f7-button fill @click="changeAWSData()"> Submit </f7-button>
            </f7-col>
          </f7-row>

        </f7-block>
      </f7-page>
    </f7-popup>

    <!-- Content -->
    <f7-block-header>
      <f7-row>
        <f7-col width="70">
          Click on an AWS item below to see and modify details.
        </f7-col>
        <f7-col width="30">
          <f7-button small raised fill 
            tooltip="Select a day and assign AWS" @click="openAssignPopup=true"> 
            Assign AWS
          </f7-button>
        </f7-col>
      </f7-row>
    </f7-block-header>

    <!-- LIST OF UPCOMING AWSes -->
    <f7-list accordion-list media-list>
      <f7-list-item accordion-item v-for="(AWSes, date) in upcomingAWS" :key="date">
        <div slot="header">
          <span v-if="date in holidays" 
            class="bg-color-red" style="padding:2px">
            <strong> This is a holiday: {{holidays[date].description}}/ </strong> </span>
          {{humanReadableDate(date)}}, {{getAWSVenue(AWSes)}}, {{getAWSUrl(AWSes)}}
        </div>
        <div slot="after" v-if="AWSes.length<3">
          Some slots missing.
        </div>
        <div slot="title">{{awsSummary(AWSes)}}</div>
        <div slot="footer">
          <i class="fa fa-chair"></i>
          {{AWSes[0].chair?AWSes[0].chair:'No chair assigned'}}
          <span tooltip="Chair has confirmed?" v-if="AWSes[0].chair">
            (confirmed: {{AWSes[0].has_chair_confirmed}})
          </span>
        </div>

        <f7-accordion-content style="background-color:ivory">
          <f7-block no-margin>
            <f7-row>
              <f7-col col-30>
                <f7-button @click="openChangeWeekPopup(AWSes[0])">
                  Change Venue/Chair
                </f7-button>
              </f7-col>
              <f7-col col-30>
                <f7-button icon="far fa-envelope" 
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
                <div v-html="aws.by"></div>
                <div v-html="aws.title"></div>
                <div v-if="aws.acknowledged==='NO'">
                  <f7-icon icon="fa fa-question"></f7-icon>
                </div>
                <div v-else>
                  <f7-icon icon="fa fa-check"></f7-icon>
                </div>
              </f7-card-header>
              <f7-card-content>
                <f7-block-header> {{aws.title}} </f7-block-header>
                <div v-html="aws.abstract"></div>
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
    <f7-block-title medium>
      Computed Schedule
      <f7-button small color="gray" fill style="float:right"
        @click="computeSchedule()">
        Recompute Schedule
      </f7-button>
    </f7-block-title>

    <f7-block-header>
      Click on the login to add him/her to upcoming AWS list. Click on 
      <f7-button raised style="display:inline" disabled>Add All</f7-button> to add all logins
      on that given date.
    </f7-block-header>

    <f7-block>
      <div v-for="(awses, date) in schedule"
           style="border-top:1px solid lightgray"
           :key="'xyz'+date">
        <f7-row>
          <f7-col width="25"> 
            {{humanReadableDate(awses[0].date)}}
            <f7-button small raised @click="acceptSchedule(awses)">Add All</f7-button>
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

    <f7-block>
      <f7-block-title>Public Holidays on AWS days</f7-block-title>
      <f7-list>
        <f7-list-item v-for="holi, key in Object.keys(holidays).filter(x => whichDay(x) === 'Mon')" 
          :title="holi"
          :after="holidays[holi].description"
          :key="key">
        </f7-list-item>
        <f7-list-item></f7-list-item>
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
      thisAWS: {date:'', speaker:''
        , venue:'', title:'', abstract:''
        , chair:'', vc_url:"", vc_extra: '' 
      },
      venues: [],
      upcomingAWS: [],
      popupTitle: 'Review request',
      openAssignPopup: false,
      popupWeeklyInfo: false,
      openEditPopup: false,
      popupAction: '',
      resules: [],
      schedule: {},
      holidays: [],
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;

    self.fetchUpcomingAws();
    self.fetchSchedule();

    self.postWithPromise('/info/holiday/list').then(function(x) {
      self.holidays = JSON.parse(x.data).data;
    });


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
      if(self.thisAWS.date in self.holidays) {
        app.dialog.confirm("This is a public holiday. No AWS is allowed on '" +
          self.holidays[self.thisAWS.date].description + "'."
          , "Stop!", null, null);
        return;
      };
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

      // Now fetch venues possible for scheduling AWS.
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
        if('speaker' in aws) {
          let ack = aws.acknowledged === 'YES'?'':'(⛌)';
          title += aws.speaker + ack + ' / ';
        }
      });
      if(! title)
        title = "NO ONE HAS BEEN ASSIGNED.";
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
    getAWSUrl: function(awses) {
      let txt = "";
      if(awses[0].vc_url) {
        txt += awses[0].vc_url;
        if(awses[0].vc_extra) 
          txt += " (" + awses[0].vc_extra + ")"
      }
      return txt;
    },
    getAWSVenue: function(awses) {
      return awses[0] ? awses[0].venue : 'NA';
    },
  },
}
</script>
