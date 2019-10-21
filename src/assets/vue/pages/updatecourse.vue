<template>
   <f7-page>
      <f7-navbar title="Manage Registration/Grade" back-link="Back">
      </f7-navbar>

      <f7-block>
        <f7-block-title>{{thisCourseId}}. Total {{registrations.length}}
          registrations.
        </f7-block-title>

        <f7-list media-list>
          <f7-list-item v-for="(st,key) in registrations"
                        :title="st.student_id"
                        :after="st.type"
                        @click="onRegSelect(st)"
                        :footer="'Registered on: '+st.registered_on">
          </f7-list-item>

        </f7-list>
      </f7-block>

      <!-- POPUP  -->
      <f7-popup :opened="openPopup" @popup:close="openPopup = false">
        <f7-page>
          <f7-navbar title="Manage registration">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>
      
          <f7-block inset>

            <f7-block-title>Student ID: {{thisRegistration.student_id}} </f7-block-title>

              <f7-list>
                <f7-list-group no-hairlines media-list>
                  <f7-list-input label="Registration type" 
                                 type="select"
                                 @change="thisRegistration.type=$event.target.value"
                                 :value="thisRegistration.type">
                    <option value="CREDIT">CREDIT</option>
                    <option value="AUDIT">AUDIT</option>
                    <f7-button slot="after">Change</f7-button>
                  </f7-list-input>

                  <f7-list-item>
                    <f7-row>
                    <f7-col>
                      <f7-button color="red" @click="dropCourse()">Drop</f7-button>
                    </f7-col>
                    <f7-col>
                      <f7-button @click="changeRegistration()">Change</f7-button>
                    </f7-col>
                    </f7-row>
                  </f7-list-item>
                </f7-list-group>

                <f7-list-group>
                  <f7-list-input label="Grade" 
                                 type="select"
                                 @change="thisRegistration.grade=$event.target.value"
                                 :value="thisRegistration.grade">
                    <option v-for="g in availableGrades" :value="g">{{g}}</option>
                  </f7-list-input>
                </f7-list-group>
              </f7-list>

          </f7-block>
        </f7-page>
      </f7-popup>

   </f7-page>

</template>

<script>
  export default {
    data() {
      const self = this;
      return {
        thisCourseId: self.$f7route.params.courseid,
        thisCourseMetadata: [],
        registrations: [],
        thisRegistration: [],
        thisData: [],
        openPopup: false,
        availableGrades: ['A +','A', 'B+', 'B', 'C+', 'C', 'F', 'X'],
      };
    },
    mounted()
    {
      const self = this;
      self.postWithPromise('courses/metadata/'+btoa(self.thisCourseId))
        .then( function(x) {
          self.thisCourseMetadata = JSON.parse(x.data).data[self.thisCourseId];
        });

      self.postWithPromise('courses/registration/'+btoa(self.thisCourseId))
        .then( function(x) {
          self.registrations = JSON.parse(x.data).data;
        });
          
    },
    methods : {
      onRegSelect: function(reg)
      {
        const self = this;
        self.thisRegistration = reg;
        self.openPopup = true;
      },
      dropCourse: function()
      {
        const self = this;
        const app = self.$f7;
        app.dialog.confirm("Really?", "Dropping course"
          , function(x) {
            self.promiseWithAuth('acadadmin/course/registration/drop', self.thisRegistration)
              .then( function(x) {
                self.openPopup = false;
              });
          }, null);

      },
      changeRegistration: function()
      {
        const self = this;
        const app = self.$f7;

        self.promiseWithAuth('acadadmin/registration/update', self.thisRegistration)
          .then( function(x) {
          });
      },
    }
  }
</script>



