<template>
  <f7-page>
    <f7-navbar title="Journal Clubs" back-link="Back">
    </f7-navbar>

    <!-- POPUP EDIT -->
    <f7-popup :opened="popupJCEdit" @popup:close="popupJCEdit = false">
      <f7-page>
        <f7-navbar title="Edit JC">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block inset>
          <f7-block-title> Admins </f7-block-title>
          <f7-list>
            <f7-list-input label="Add New admin" :input="false">
              <v-autocomplete  slot="input"
                ref="refJCAdmin"
                input-class="form-control"
                placeholder="Search login to add a new admin"
                results-property="login"
                results-display="name"
                :request-headers="apiPostData()"
                method="post"
                @selected="addNewJCAdmin"
                :source="(q)=>searchPeopleURI(q, 'login')">
              </v-autocomplete>
            </f7-list-input>

            <f7-list-item v-for="admin, key in thisJC.admins" 
              :title="admin.login"
              :key="key">
              <f7-button raised small slot="after" @click="removeAdmin(admin.login)">
                Remove Admin
              </f7-button>
            </f7-list-item>
          </f7-list>
        </f7-block>

        <f7-block>
          <f7-list media-list no-hairlines>
            <f7-list-input label="ID" readonly :value="thisJC.id">
            </f7-list-input>

            <f7-list-input label="Title" 
              :value="thisJC.title"
              @input="thisJC.title = $event.target.value">
            </f7-list-input>

            <f7-list-input label="Description" 
              :value="thisJC.description"
              @texteditor:input="thisJC.description = $event.target.value"
              type="texteditor">
            </f7-list-input>

            <f7-list-input type="select" label="Day" 
              :value="thisJC.day" @change="thisJC.day = $event.target.value">
              <option v-for="day in ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']" 
                :value="day">
                {{day}}
              </option>
            </f7-list-input>

            <f7-list-input label="Time"  :value="thisJC.time" 
              @input="thisJC.time = $event.target.value">
            </f7-list-input>

            <f7-list-input label="Venue"
              :value="thisJC.venue" 
              type="select"
              @input="thisJC.venue = $event.target.value">
              <option v-for="venue, key in venues" :value="venue.id">
                {{venue.id}}
              </option>
            </f7-list-input>

            <f7-list-input label="Scheduling method" type="select"
              :value="thisJC.scheduling_method"
              @change="thisJC.scheduling_method = $event.target.value">
              <option v-for="option in ['DONT SCHEDULE', 'RANDOM', 'ALPHABETICAL']" :value="option">
                {{option}}
              </option>
            </f7-list-input>

            <f7-list-input label="Status" type="select"
              :value="thisJC.status"
              @change="thisJC.status = $event.target.value">
              <option v-for="option in ['ACTIVE', 'INACTIVE', 'INVALID']" :value="option">
                {{option}}
              </option>
            </f7-list-input>

            <f7-list-item>
              <f7-button raised small @click="updateJC()">Update</f7-button>
            </f7-list-item>
          </f7-list>
        </f7-block>

      </f7-page>
    </f7-popup>

    <!-- JC -->
    <f7-block>
      <f7-list media-list accordion-list>
        <f7-list-item v-for="jc, key in jcs" 
          :after="jc.status"
          :title="jc.title"
          :header="jc.day + ' | ' + jc.time + ' | ' + jc.venue"
          :footer="jc.admins.map(x => x.login).join(', ')"
          @click="jcEditPopup(jc)"
          :key="key">
        </f7-list-item>
      </f7-list>
    </f7-block>

  </f7-page>
</template>

<script>

import moment from 'moment';
import Vue from 'vue';

export default {
  data() {
    const self = this;
    return {
      jcs: [],
      thisJC: {},
      thisJCAdmins: [],
      popupJCEdit: false,
      venues: {},
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
    self.fetchJCS();
    self.postWithPromise('venue/list/jc').then( function(x) {
      self.venues = JSON.parse(x.data).data;
    });
  },
  methods : {
    fetchJCS: function() {
      const self = this;
      const app = self.$f7;
      self.postWithPromise('jc/info/all').then( function(x) {
        self.jcs = JSON.parse(x.data).data;
      });
    },
    jcEditPopup: function(jc) {
      const self = this;
      self.thisJC = jc;
      self.popupJCEdit = true;
    },
    updateJC: function() {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('acadadmin/jc/update', self.thisJC)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Successfully updated JC");
            self.popupJCEdit = false;
          }
          else
            self.notify("Failed", "Failed to update JC.");
        });
    },
    removeAdmin: function(login) {
      const self = this;
      const app = self.$f7;
      let data = {'jc_id':self.thisJC.id, 'login': login};
      app.dialog.confirm("Remove admin", "Really?", function(x) {
        self.promiseWithAuth('acadadmin/jc/removeadmin', data)
          .then( function(x) {
            let res = JSON.parse(x.data).data;
            if(res.success)
              self.notify("Success", "Admin is removed successfully");
            self.promiseWithAuth('jc/info/'+self.thisJC.id).then(function(x) {
              self.thisJC = JSON.parse(x.data).data;
            });
          });
      }, null);
    },
    addNewJCAdmin: function(x) {
      const self = this;
      let data = {'jc_id':self.thisJC.id, 'login': x.selectedObject.login};
      self.promiseWithAuth('acadadmin/jc/addadmin', data)
        .then( function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success)
            self.notify("Success", "Assigned admin successfully");
          self.promiseWithAuth('jc/info/'+self.thisJC.id).then(function(x) {
            self.thisJC = JSON.parse(x.data).data;
          });
        });
    },
  },
}
</script>

