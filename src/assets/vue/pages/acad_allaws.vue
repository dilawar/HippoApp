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

              <f7-list-item label="Description">
                <vue-editor ref="quillEditor" v-model="thisAWS.abstract">
                </vue-editor>
              </f7-list-item>

              <f7-list-item>
                <f7-button  raised 
                            popup-close 
                            slot="after"
                            @click="editThisAWS()">
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
        <f7-col>
          <v-autocomplete ref="refAWS"
                           input-class="item-input"
                           placeholder="Search for an aws (speaker or date)..."
                           results-value="id"
                           results-display="html"
                           :request-headers="apiPostData()"
                           method="post"
                           @selected="onAWSSelected"
                           @results="foundAWSOnSearch"
                           @noResults="createNewSpeaker=true"
                           :source="(q)=> getAPIUrl()+'/acadadmin/aws/search/'+q">
          </v-autocomplete>
        </f7-col>
      </f7-row>
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
    onAWSSelected: function() {
    },
    refreshPage: function()
    {
      const self = this;
    },
    editAWSClick: function(aws) 
    {
      const self = this;
      self.thisAWS = aws;
      self.popupTitle = "Editing AWS";
      self.popupAction = 'Edit';
      self.openEditPopup = true;
    },
  },
}
</script>
