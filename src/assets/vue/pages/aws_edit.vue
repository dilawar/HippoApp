<!-- THIS PAGE CAN BE DELETED -->
<template>
  <f7-page>
    <f7-navbar title="Edit Annual Work Seminars" back-link="Back">
    </f7-navbar>

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
            placeholder="Email of TCM member ..."
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
          <div slot="header">
            Submit email of your supervisor. If not found, I'll ask you to
            create an entry.
          </div>
        </f7-list-input>
        <f7-list-item v-if="add_new_tcm"
          header="No one  is found. Add...">
          <f7-button @click="popupSupervisor=true">Add new TCM</f7-button>
        </f7-list-item>
        <f7-list-item>
          <f7-col>
            <f7-button raised back>Close</f7-button>
          </f7-col>
          <f7-col>
            <f7-button raised popup-close fill @click="updateAWS()">
              Update
            </f7-button>
          </f7-col>
        </f7-list-item>
        <f7-list-item>
        </f7-list-item>
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
      thisAWS: {date:'', speaker:'', venue:'', title:'', abstract:''
        , tcms:[], supervisors:[]},
      awsid: self.$f7route.params.awsid,
      isupcoming: self.$f7route.params.isupcoming,
      add_new_tcm: false,
      popupSupervisor: false,
      thisSupervisor: {email:'', first_name:'', middle_name:'', last_name:'',
        affiliation:'', url:''},
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
    self.fetchAWS(self.awsid);
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
    fetchAWS: function(awsid) 
    {
      const self = this;
      const app = self.$f7;

      console.log(self.isupcoming, self.awsid);

      // AWS or the upcoming aws.
      let endpoint = 'aws/id/'+awsid;
      if(self.isupcoming === 'YES')
        endpoint = 'aws/upcomingid/' + awsid;

      self.promiseWithAuth(endpoint).then( function(x) {
          let aws = JSON.parse(x.data).data;
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
        });
    },
    cancelUpcomingAWS: function(aws) 
    {
      const self = this;
      const app = self.$f7;
      app.dialog.prompt("Please give some reason..."
        , "Cancelling AWS ..."
        , function(value) {
          if( value.length <= 8)
          {
            app.dialog.alert("At least 8 char..."
              , "Reason is too short.", null);
            return;
          }
          aws['reason'] = value;
          console.log('aws', aws);
          self.promiseWithAuth('acadadmin/aws/cancel', aws)
            .then( function(x) {
              self.fetchUpcomingAws();
            });
        }, function(ev) {
          console.log( 'NAH');
        });
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
    updateAWS: function() 
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

      self.thisAWS.speaker = self.thisAWS.speaker.toLowerCase();
      let endpoint = 'acadadmin/aws/update';
      console.log(111, self.whoAmI(), self.isupcoming, self.thisAWS.speaker);
      if(self.isupcoming === 'YES') {
        endpoint = 'acadadmin/upcomingaws/update';
        if(self.whoAmI() === self.thisAWS.speaker)
            endpoint = 'me/upcomingaws/update';
      }
      
      self.promiseWithAuth(endpoint, self.thisAWS)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Sucessfully updated AWS");
            self.fetchAWS(self.thisAWS.id);
          }
          else
            self.notify("Failed", "Failed to update AWS:" + res.msg);
        });
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
  },
}
</script>
