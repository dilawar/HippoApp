<template>
  <f7-page>
    <f7-navbar title="People" back-link="Back">
    </f7-navbar>
      

    <f7-block>
      <f7-block-header>
        To modify a Hippo profile, search for them using the following
        interface.
      </f7-block-header>
      <f7-list media-list no-hairlines>
        <f7-list-input :input="false">
          <v-autocomplete  
            slot="input"
            placeholder="Search for a login"
            results-property="email"
            results-display="name"
            results-value="login"
            :request-headers="apiPostData()"
            method="post"
            @selected="(x)=>$f7router.navigate('/profile/'+x.value)"
            @clear="thisLogin={}"
            :source="(q)=>searchPeopleURI(q, 'login')">
          </v-autocomplete>
        </f7-list-input>
      </f7-list>
    </f7-block>

    <!-- FACULTY -->
    <!-- faculty popup -->
    <f7-popup :opened="popupFaculty" @popup:close="popupFaculty = false">
      <f7-page>
        <f7-navbar title="Update Faculty">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block-title medium v-if="thisFaculty.email">
          Updating {{thisFaculty.email}}
        </f7-block-title>
        <f7-block-title medium v-else>
          Adding new faculty
        </f7-block-title>

        <f7-block-header>
          Do not make any mistake or typo in <tt>SPECIALIZATION</tt> of the
          faculy please.
        </f7-block-header>

        <f7-list media-list no-hairlines>
          <f7-list-input v-for="val, k in thisFaculty" :key="k" 
            v-if="k in facultySchema && facultySchema[k][0] === 'select'"
            @change="thisFaculty[k]= $event.target.value"
            :value="val" type="select" :label="formatKey(k)" inline-label>
            <option v-for="opt in facultySchema[k][1]" :value="opt" :key="opt">
              {{opt}}
            </option>
          </f7-list-input>
          <f7-list-input v-else :label="formatKey(k)" :value="val" 
            :type="k in facultySchema?facultySchema[k][0]:'text'"
            @input="thisFaculty[k] = $event.target.value"
            inline-label>
          </f7-list-input>
          <f7-list-item v-if="popupTask === 'Updating'">
            <f7-row>
              <f7-col>
                <f7-button fill color=red @click="deleteFaculty">Delete</f7-button>
              </f7-col>
              <f7-col>
                <f7-button raised @click="updateFaculty()">Update</f7-button>
              </f7-col>
            </f7-row>
          </f7-list-item>
          <f7-list-item v-else>
            <f7-row>
              <f7-col>
              </f7-col>
              <f7-col>
                <f7-button raised @click="addFaculty()">Add</f7-button>
              </f7-col>
            </f7-row>
          </f7-list-item>
        </f7-list>

      </f7-page>
    </f7-popup>

    <!-- Faculty block -->
    <f7-block-header>
      Total {{faculty.length}} faculty found. <br />
      Expand the list of faculty below and click on the faculty to update.
    </f7-block-header>
    <f7-list accordion-list inset>
      <f7-list-item>
        <f7-button slot="after" small raised @click="addNewFacultyPopup()">Add a new faculty.</f7-button>
      </f7-list-item>
      <f7-list-item accordion-item title="List of faculty" 
        footer="Click to expand">
        <f7-accordion-content>
          <f7-list-item v-for="fac, key in faculty" :key="key"
            v-if="fac.status === 'ACTIVE'"
            :title="arrayToName(fac) + ' <' + fac.email + '>'"
            :header="fac.specialization"
            :footer="fac.affiliation + ' | ' + fac.institute"
            @click="updateFacultyPopup(fac)">
          </f7-list-item>
          <f7-list-item v-else
            :title="arrayToName(fac) + ' <' + fac.email + '>'"
            :after="fac.status"
            :header="fac.specialization"
            :footer="fac.affiliation + ' | ' + fac.institute"
            @click="updateFacultyPopup(fac)">
          </f7-list-item>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>


  </f7-page>
</template>

<script>

import moment from 'moment';

export default {
  data() {
    const self = this;
    return {
      logins: [],
      thisLogin: {},
      loginType: "ACTIVE",
      popupLogin: false,
      popupFaculty: false,
      popupTask: 'Updating',
      editables:[],
      faculty: [],
      facultySchema: {},
      thisFaculty: {affiliation:'', email:'xxx'},
    };
  },
  mounted: function()
  {
    const self = this;
    const app = self.$f7;
    app.preloader.show();
    self.fetchFaculty();
    self.postWithPromise('admin/table/fieldinfo/faculty').then(function(x) {
      self.facultySchema = JSON.parse(x.data).data;
      console.log("Schema", self.facultySchema);
      app.preloader.hide();
    });
    setTimeout(()=> app.preloader.hide(), 2000);
  },
  methods : {
    fetchFaculty: function() {
      const self = this;
      self.postWithPromise('people/faculty/list')
        .then(function(x) {
          self.faculty = JSON.parse(x.data).data;
          self.thisFaculty = self.faculty[0];
          /* console.log('xx', self.thisFaculty); */
        });
    },
    arrayToName: function(login) {
      const self = this;
      let name = login.first_name;
      if(('middle_name' in login) && login.middle_name.length > 0)
        name +=  ' ' + login.middle_name;
      name += ' ' + login.last_name;
      if('honorofic' in login && login.honorofic.length > 0)
        name = login.honorofic + ' ' + name;
      return name;
    },
    updateFacultyPopup: function(fac) {
      const self = this;
      self.thisFaculty = fac;
      self.thisFaculty.modified_on = self.dbDateTime(moment());
      self.popupTask = 'Updating';
      self.popupFaculty = true;
    },
    addNewFacultyPopup: function() {
      const self = this;
      self.resetSimple(self.thisFaculty);
      self.popupTask = 'Adding';
      self.popupFaculty = true;
    },
    actionFaculty: function(action) {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('people/faculty/'+action, self.thisFaculty)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", action + " faculty");
            self.fetchFaculty();
            self.popupFaculty = false;
          }
          else
            self.notify("Failed", res.msg);
        });
    },
    deleteFaculty: function()
    {
      const self = this;
      self.actionFaculty('delete');
    },
    addFaculty: function() 
    {
      const self = this;
      self.actionFaculty('add');
    },
    updateFaculty: function()
    {
      const self = this;
      self.actionFaculty('update');
    },
  },
}
</script>
