<!-- THIS PAGE CAN BE DELETED -->
<template>
  <f7-page>
    <f7-navbar title="Edit Annual Work Seminars" back-link="Back">
    </f7-navbar>

    <!-- POPUP EDIT -->
    <f7-navbar title="Edit AWS">
      <f7-nav-right>
        <f7-link popup-close>Close</f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block>

      <f7-list no-hairlines media-list>

        <f7-list-input :value="thisAWS.date" 
               label="Date" inline-label readonly>
        </f7-list-input>

        <f7-list-input :value="thisAWS.venue"  
               readonly label="Venue" inline-label>
        </f7-list-input>

        <f7-list-input label="Speaker" inline-label 
                       readonly :value="thisAWS.speaker">
        </f7-list-input>

        <!-- FOLLOWING ITEMS APPEARS ONLY WHEN EDITING AWS -->
        <f7-list-input label="Title" :value="thisAWS.title"
                       @input="thisAWS.title=$event.target.value" 
                       :resizable="true" type="textarea">
        </f7-list-input>

        <f7-list-input label="Abstract" :input="false">
          <vue-editor slot="input" v-model="thisAWS.abstract">
          </vue-editor>
        </f7-list-input>


        <f7-list-input :input="false" required>
          <v-autocomplete  slot="input"
                           input-class="item-input"
                           results-property="email"
                           results-display="name"
                           results-value="email"
                           placeholder="Supervisor(s)"
                           :request-headers="apiPostData()"
                           method="post"
                           @selected="(v)=>thisAWS.supervisors=v.selectedObject.email"
                           :source="(q)=>searchPeopleURI(q, 'host')">
          </v-autocomplete>
        </f7-list-input>

      <f7-list-input :input="false">
        <v-autocomplete slot="input"
            input-class="item-input"
            results-property="email"
            results-display="name"
            results-value="email"
            placeholder="Thesis Committee Members"
            :request-headers="apiPostData()"
            method="post"
            @selected="(v)=>thisAWS.tcm=v.selectedObject.email"
            :source="(q)=>searchPeopleURI(q, 'login')">
        </v-autocomplete>
      </f7-list-input>


        <f7-list-item>
          <f7-button raised popup-close slot="after" @click="editThisAWS()">
            Update
          </f7-button>
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
      thisAWS: {date:'', speaker:'', venue:'', title:'', abstract:''},
      awsid: self.$f7route.params.awsid,
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
      self.promiseWithAuth('/acadadmin/aws/get/'+awsid)
        .then( function(x) {
          self.thisAWS = JSON.parse(x.data).data;
          console.log("Found AWS: ", self.thisAWS);
        });
    },
    cancelAWS: function(aws) 
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
    editThisAWS: function() 
    {
    },
  },
}
</script>
