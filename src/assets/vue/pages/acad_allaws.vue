<template>
  <f7-page ptr ptr:refresh="refreshPage">

    <f7-navbar title="Annual Work Seminars" back-link="Back">
    </f7-navbar>

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
                           :value="thisAWS.title"
                           @input="thisAWS.title=$event.target.value"
                           type="text"
                           >
            </f7-list-input>

            <f7-list-input label="Abstract" :input="false">
              <vue-editor slot="input" ref="quillEditor" v-model="thisAWS.abstract">
              </vue-editor>
            </f7-list-input>

            <f7-list-input label="Is Presynopsis Seminar?" 
                           type="select" 
                           @change="thisAWS.is_presynopsis_seminar=$event.target.value"
                           :value="thisAWS.is_presynopsis_seminar">
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </f7-list-input>

            <f7-list-input label="Status" 
                           type="select" 
                           @change="thisAWS.status=$event.target.value"
                           :value="thisAWS.status">
              <option value="VALID" checked>Valid</option>
              <option value="INVALID" checked>Invalid</option>
              <option value="CANCELLED" checked>Cancelled</option>
              <option value="NOT_PRESENTED" checked>Not Presented</option>
              <option value="DELETED" checked>Deleted</option>
            </f7-list-input>

            <f7-list-item>
              <f7-button  raised popup-close slot="after" @click="updateAWS()">
                Update
              </f7-button>
            </f7-list-item>

          </f7-list>
        </f7-block>
      </f7-page>
    </f7-popup>

    <!-- Main page -->
    <f7-block strong inset>
      <f7-row>
        <v-autocomplete ref="refAWS"
                        input-class="item-input searchbar-inner-wrap"
                        placeholder="Search AWS speaker, title or date (2019-01-12 etc.)"
                        results-value="id"
                        results-display="summary"
                        :request-headers="apiPostData()"
                        method="post"
                        @selected="onAWSSelected"
                        @results="foundAWSOnSearch"
                        @noResults="createNewSpeaker=true"
                        :source="(q)=>getAPIUrl()+'/acadadmin/aws/search/'+q">
        </v-autocomplete>
      </f7-row>

      <div v-if="parseInt(thisAWS.id) > 0">
        <f7-row class="bg-color-yellow margin-vertical">
          <f7-col col-100 v-html="thisAWS.html"></f7-col>
        </f7-row>
        <f7-row>
          <f7-col col-50 medium-50>
            <f7-button raised fill color=red 
                       v-if="thisAWS.status!=='DELETED'" 
                       @click="deleteThisAWS(thisAWS.id)">
              Delete
            </f7-button>
            <f7-button raised fill color=red v-else
                       @click="deleteThisAWS(thisAWS.id)">
              Delete
            </f7-button>
          </f7-col>
          <f7-col col-50 medium-50>
            <f7-button raised @click="openUpdatePopup(thisAWS.id)">Update</f7-button>
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
      thisAWS: {id:'', date:'', speaker:'', title:'', html:''},
      allaws: {},
      popupTitle: 'Review request',
      openAssignPopup: false,
      openEditPopup: false,
      popupAction: '',
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
  },
  methods : {
    refreshData: function()
    {
      const self = this;
    },
    foundAWSOnSearch: function() {
    },
    onAWSSelected: function(result) {
      const self = this;
      const app = self.$f7;
      self.thisAWS = result.selectedObject;
      console.log("Selected. ", result);
    },
    refreshPage: function()
    {
      const self = this;
    },
    updateAWS: function() 
    {
      const self = this;
      self.promiseWithAuth('acadadmin/aws/update', self.thisAWS)
        .then( function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            console.log("Updated AWS successfully.");
            self.notify("Success.", "Successfully updated AWS.");
            setTimeout(() => self.openEditPopup = false, 2000);
          }
          else
            self.notify("Failed.", "Could not update AWS.");
        });
    },
    openUpdatePopup: function(awsid) 
    {
      const self = this;
      self.postWithPromise('acadadmin/aws/get/'+awsid)
        .then( function(x) {
          self.thisAWS = JSON.parse(x.data).data;
          self.openEditPopup = true;
        });
    },
    deleteThisAWS: function(awsid) {
      const self = this;
      const app = self.$f7;
      // Do not delete the AWS, mark its status DELETED
      app.dialog.confirm("Are you sure?", "Deleting a permanent record"
        , function() {
          console.log("deleted.");
          self.postWithPromise('acadadmin/aws/delete/'+awsid).then(
            function(x) {
              const res = JSON.parse(x.data).data;
              if(res.success)
                self.notify("Success.", res.msg);
              else
                self.notify("Failed to delete.", res.msg);
            });
        }, null);
    },
  },
}
</script>
