<template>
  <f7-page page-content ptr @ptr:refresh="refreshAWS">
    <f7-navbar title="My AWS" back-link="Back"></f7-navbar>

    <!-- Popup for adding new TCM members. -->
    <f7-popup :opened="popupSupervisor" @popup:closed="popupSupervisor=false">
      <f7-page>
        <f7-navbar title="Add new supervisors">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block>
          <f7-list media-list no-hairlines>
            <f7-list-input label="Email"
              :value="thisSupervisor.email" type="email" required validate
              @input="thisSupervisor.email = $event.target.value">
            </f7-list-input>
            <f7-list-input label="First name"
              required
              :value="thisSupervisor.first_name"
              @input="thisSupervisor.first_name = $event.target.value">
            </f7-list-input>
            <f7-list-input label="Middle name"
              :value="thisSupervisor.middle_name"
              @input="thisSupervisor.middle_name=$event.target.value">
            </f7-list-input>
            <f7-list-input label="Last name"
              :value="thisSupervisor.last_name"
              @input="thisSupervisor.last_name=$event.target.value">
            </f7-list-input>
            <f7-list-input label="Affiliation"
              :value="thisSupervisor.affiliation"
              @input="thisSupervisor.affiliation=$event.target.value">
            </f7-list-input>
            <f7-list-input label="URL" 
              :value="thisSupervisor.url"
              @input="thisSupervisor.url=$event.target.value">
            </f7-list-input>
            <f7-list-item>
              <f7-button @click="addNewSupervisor()"
                :disabled="!(thisSupervisor.email && thisSupervisor.first_name)">
                Add Supervisor
              </f7-button>
            </f7-list-item>
          </f7-list>
        </f7-block>

      </f7-page>
    </f7-popup>

    <!-- Upcoming AWS popup -->
    <f7-popup :opened="popupEditAWS" @popup:closed="popupEditAWS=false">
      <f7-page>
        <f7-navbar title="Edit AWS">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block>
          <f7-block-header>
            Edit AWS for {{thisAWS.speaker}} on {{thisAWS.date}}, {{thisAWS.time}} at
            {{thisAWS.venue}} chaired by {{thisAWS.chair}}. 
          </f7-block-header>

          <f7-list no-hairlines>

            <f7-list-input label="Title" :value="thisAWS.title"
              @input="thisAWS.title = $event.target.value">
            </f7-list-input>

            <f7-list-input :input="false" label="Abstract">
              <vue-editor slot="input" v-model="thisAWS.abstract">
              </vue-editor>
            </f7-list-input>

            <!-- Supervisors -->
            <f7-list-item group-title title="Supervisors"></f7-list-item>
            <f7-list-item v-for="pi, key in thisAWS.supervisors" :header="pi" :key="'super'+key">
              <f7-link slot="after" @click="removeSupervisor(pi)">remove</f7-link>
            </f7-list-item>
            <f7-list-input :input="false">
              <v-autocomplete  slot="input"
                   ref="refSupervisor"
                   input-class="form-control"
                   placeholder="Email of your supervisor (max 2)"
                   results-property="email"
                   results-display="name"
                   :request-headers="apiPostData()"
                   @selected="addSupervisor"
                   method="post"
                   :source="(q)=>searchPeopleURI(q, 'faculty')">
                </v-autocomplete>
            </f7-list-input>

            <!-- TCM members -->
            <f7-list-item group-title title="Thesis Committee Members">
            </f7-list-item>
            <f7-list-item v-for="pi, key in thisAWS.tcms" 
              :header="pi" :key="'tcm'+key">
              <f7-link slot="after" @click="removeTCM(pi)">remove</f7-link>
            </f7-list-item>
            <f7-list-input :input="false">
              <v-autocomplete  slot="input"
                   ref="refTCM"
                   input-class="form-control"
                   placeholder="TCM members (max 4)"
                   results-property="email"
                   results-display="name"
                   :showNoResults="false"
                   @noResults="(x) => add_new_tcm=true"
                   @results="(x)=>add_new_tcm=false"
                   :request-headers="apiPostData()"
                   @selected="addTCMMember"
                   method="post"
                   :source="(q)=>searchPeopleURI(q, 'supervisor')">
                </v-autocomplete>
            </f7-list-input>
            <f7-list-item v-if="add_new_tcm">
              <f7-button @click="popupSupervisor=true">Add new TCM</f7-button>
            </f7-list-item>
          </f7-list>

          <f7-row>
            <f7-col> </f7-col>
            <f7-col> 
              <f7-button small raised @click="updateUpcomingAWS()">Update AWS</f7-button>
            </f7-col>
          </f7-row>
        </f7-block>
      </f7-page>
    </f7-popup>

    <!-- Upcoming AWS -->
    <f7-block v-if="Object.keys(upcoming).length>0">
      <f7-block-title>Upcoming Annual Work Seminar</f7-block-title>
      <f7-card :key="key" v-for="(aws, key) in upcoming" no-shadow outline>
        <f7-card-header>
          {{aws.venue}} | {{humanReadableDate(aws.date)}} | 
          <f7-icon icon="fa fa-chir"> {{aws.chair}} </f7-icon>
          <f7-button raised small @click='editUpcomingAWS(aws)'>Edit</f7-button>
        </f7-card-header>

        <f7-card-content>
          <div> <strong>{{aws.title}}</strong> </div>
          <span inset style="font-size:small" v-html="aws.abstract"></span>

          <f7-row style="font-size:x-small">
            <f7-col>Supervisor(s)/Host</f7-col>
            <f7-col>TCM</f7-col>
          </f7-row>
          <f7-row style="font-size:x-small">
            <f7-col>
              <f7-link v-for="i in [1,2]" external target="_system"
                :href="aws['supervisor_'+i]" :key="'sup'+i"> 
                <u>{{aws['supervisor_'+i]}}</u>&nbsp;&nbsp;
              </f7-link>
            </f7-col>
            <f7-col>
              <f7-link v-for="i in [1,2,3,4]" external taregt="_system"
                :href="aws['tcm_member_'+i]" :key="'tcm'+i">
                <u>{{aws['tcm_member_'+i]}}</u>&nbsp;&nbsp;
              </f7-link> 
            </f7-col>
          </f7-row>

        </f7-card-content>

        <f7-card-footer>
          <div v-if="aws.acknowledged === 'NO'">
            <f7-button small fill @click="acknowledgeAWS(aws.id)"> Acknowledge </f7-button>
          </div>
          <div v-else>
            You have acknowledged your upcoming AWS. Good job and thank you!
          </div>
        </f7-card-footer>
      </f7-card>
    </f7-block>

    <!-- Past AWS -->
    <f7-block>
      <f7-block-title>Annual Work Seminar</f7-block-title>
      <f7-list accodion-list no-hairlines media-list>
        <f7-list-item accordion-item 
          v-for="(aws, key) in awses" 
          :key="key" 
          :text="aws.title"
          :header="aws.venue+' | '+humanReadableDateTime(aws.date, aws.time)">
          <f7-accordion-content style="background-color:Ivory">
            <div> <strong>{{aws.title}}</strong> </div>
            <span inset style="font-size:small" v-html="aws.abstract"></span>
            <f7-row style="font-size:x-small">
              <f7-col>Supervisor(s)/Host</f7-col>
              <f7-col>TCM</f7-col>
            </f7-row>
            <f7-row style="font-size:x-small">
              <f7-col>
                <f7-link v-for="i in [1,2]" external target="_system"
                  :href="aws['supervisor_'+i]" :key="'sup'+i"> 
                  <u>{{aws['supervisor_'+i]}}</u>&nbsp;&nbsp;
                </f7-link>
              </f7-col>
              <f7-col>
                <f7-link v-for="i in [1,2,3,4]" external taregt="_system"
                  :href="aws['tcm_member_'+i]" :key="'tcm'+i">
                  <u>{{aws['tcm_member_'+i]}}</u>&nbsp;&nbsp;
                </f7-link> 
              </f7-col>
            </f7-row>
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
      awses: {},
      upcoming: {},
      thisAWS: {title:'', abstract:'', supervisors:[], tcms:[]},
      add_new_tcm: false,
      popupEditAWS: false,
      popupSupervisor: false,
      thisSupervisor: {email:'', first_name:'', middle_name:'', last_name:'',
        affiliation:'', url:''},
    };
  },
  mounted()
  {
    const self = this;
    self.fetchAws();
  },
  methods: {
    fetchAws: function() {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.postWithPromise('/me/aws').then( function(x) {
        let awses = JSON.parse(x.data).data;
        self.awses = awses.filter( x => self.dbDate(x.date) <= self.today()); 
        self.upcoming = awses.filter(x => self.dbDate(x.date) > self.today()); 
        app.preloader.hide();
      });
      setTimeout(() => app.preloader.hide(), 3000);
    },
    refreshAWS: function(e, done) {
      const self = this;
      const app = self.$f7;
      setTimeout(() => self.fetchAws(), 3000);
      done();
    },
    acknowledgeAWS: function(awsid) {
      const self = this;
      self.postWithPromise('/me/acknowledge_aws/'+awsid).then( function(x) {
        let res = JSON.parse(x.data);
        self.fetchAws();
      });
    },
    editUpcomingAWS: function(aws) {
      const self = this;
      var i;
      self.thisAWS.supervisors = [];
      for(i=1; i <= 2; i++) {
        let k = 'supervisor_'+i;
        if(aws[k])
          self.thisAWS.supervisors.push(aws[k]);
      }

      self.thisAWS.tcms = [];
      for(i=1; i <= 4; i++) {
        let k = 'tcm_member_'+i;
        if(aws[k])
          self.thisAWS.tcms.push(aws[k]);
      }
      self.thisAWS = Object.assign(self.thisAWS, aws);
      self.popupEditAWS = true;
    },
    addSupervisor: function(x) {
      const self = this;
      if(self.thisAWS.supervisors.includes(x.selectedObject.email))
        return;
      self.thisAWS.supervisors.push(x.selectedObject.email);
      /* console.log('x', self.thisAWS.supervisors); */
    },
    removeSupervisor: function(pi) {
      const self = this;
      self.thisAWS.supervisors = self.thisAWS.supervisors.filter(e => e !== pi);
    },
    addTCMMember: function(x) {
      const self = this;
      if(self.thisAWS.tcms.includes(x.selectedObject.email))
        return;
      self.thisAWS.tcms.push(x.selectedObject.email);
    },
    removeTCM: function(pi) {
      const self = this;
      self.thisAWS.tcms = self.thisAWS.tcms.filter(e => e !== pi);
      //console.log("TCM", self.thisAWS.tcms);
    },
    addNewSupervisor: function()
    {
      const self = this;
      // console.log("addeding", self.thisSupervisor);
      self.promiseWithAuth('/me/supervisor/add', self.thisSupervisor)
        .then(function(x) {
          let r = JSON.parse(x.data).data;
          if(r.success) {
            self.notify("Success", "Successfully added new supervisor");
            self.popupSupervisor = false;
          }
          else
            self.notify("Failed", "Failed to add new supervisor");
        });
    },
    updateUpcomingAWS: function() 
    {
      const self = this;

      // reset the values.
      self.thisAWS.supervisor_1 = '';
      self.thisAWS.supervisor_2 = '';
      self.thisAWS.supervisors.forEach((val, index) => {
        self.thisAWS['supervisor_'+(1+index)] = val.trim();
      });

      for(let i = 1; i <= 4; i++)
        self.thisAWS['tcm_member_'+i] = '';
      self.thisAWS.tcms.forEach((val, index)=> {
        self.thisAWS['tcm_member_'+(1+index)] = val.trim();
      });
      
      self.promiseWithAuth('me/upcomingaws/update', self.thisAWS)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success){
            self.notify("Success", "Sucessfully updated AWS");
            self.fetchAws();
          }
          else
            self.notify("Failed", "Failed to updated AWS:" + res.msg);
        });
    },
  },
}
</script>
