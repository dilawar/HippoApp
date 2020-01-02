<template>
  <f7-page>
    <f7-navbar title="Manage Registration/Grade" back-link="Back">
    </f7-navbar>

    <!-- ASSIGN NEW STUDENT -->
    <f7-block strong>

      <f7-row >
        <f7-col width="40">
          <v-autocomplete  placeholder="Student login"
                           results-property="email"
                           results-display="name"
                           results-value="login"
                           @selected="(v)=>thisRegistration.student_id=v.selectedObject.login"
                           :request-headers="apiPostData()"
                           method="post"
                           :source="(q)=>searchPeopleURI(q, 'login')">
          </v-autocomplete>
        </f7-col>
        <f7-col width="25">
          <f7-input label="Type" 
                    type="select"
                    @input="thisRegistration.type=$event.target.value"
                    :value="thisRegistration.type">
            <option value="CREDIT" selected>CREDIT</option>
            <option value="AUDIT">AUDIT</option>
          </f7-input>
        </f7-col>
        <f7-col width="25">
          <f7-button @click="addRegistration()"
                :disabled="thisRegistration.student_id.length<2">
                Register
          </f7-button>
        </f7-col>
      </f7-row>

      <f7-block-title small> {{thisCourseId}}: 
        Total {{registrations.length}} registrations.
        <br />
        Click on the row to change registration or to assign grade.
      </f7-block-title>

      <f7-list media-list no-hairlines>
        <f7-list-item v-for="(st,key) in registrations"
                      :key="key"
                      :title="st.login | name"
                      :after="st.type"
                      @click="onRegSelect(st)"
                      :footer="'Registered on: '+dbDateTime(st.registered_on)">
          <div slot="media" v-if="st.grade">{{st.grade}}</div>
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

        <f7-block>
          <f7-block-title>
            {{thisRegistration.student_id}}, {{thisCourseId}}
          </f7-block-title>

          <f7-card>
            <f7-card-content>
              <f7-list media-list>
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
                      <f7-button color="red" fill @click="dropCourse()">Drop</f7-button>
                    </f7-col>
                    <f7-col>
                      <f7-button @click="changeRegistration()">Change</f7-button>
                    </f7-col>
                  </f7-row>
                </f7-list-item>
              </f7-list>
            </f7-card-content>
          </f7-card>

          <f7-card>
            <f7-card-content>
              <f7-list media-list>
                <f7-list-input label="Grade" 
                               type="select"
                               @change="thisRegistration.grade=$event.target.value"
                               :value="thisRegistration.grade">
                  <option v-for="(gr, kye) in availableGrades" :value="gr">
                  {{gr}}
                  </option>
                </f7-list-input>
                <f7-list-item>
                  <div slot="header">
                    To remove existing grade, select 'X'.
                  </div>
                  <f7-button slot="after"
                             :disabled="! thisRegistration.grade"
                             @click="assignGrade()"
                             >Assign</f7-button>
                </f7-list-item>
              </f7-list>
            </f7-card-content>
          </f7-card>

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
        thisCourseMetadata: {},
        registrations: {},
        thisRegistration: {student_id:'', type:'CREDIT', grade:''},
        thisData: {},
        openPopup: false,
        availableGrades: ['A+','A', 'B+', 'B', 'C+', 'C', 'F', 'X'],
      };
    },
    mounted()
    {
      const self = this;
      self.postWithPromise('courses/metadata/'+btoa(self.thisCourseId))
        .then( function(x) {
          self.thisCourseMetadata = JSON.parse(x.data).data[self.thisCourseId];
        });

      self.fetchRegistration();
          
    },
    methods : {
      onRegSelect: function(reg)
      {
        const self = this;
        self.thisRegistration = reg;
        self.openPopup = true;
      },
      fetchRegistration: function()
      {
        const self = this;
        const app = self.$f7;
        app.dialog.preloader('Fetching registrations...');
        self.postWithPromise('courses/registration/'+btoa(self.thisCourseId))
          .then( function(x) {
            self.registrations = JSON.parse(x.data).data;
            app.dialog.close();
          });
        setTimeout(() => app.dialog.close(), 5000);
      },
      dropCourse: function()
      {
        const self = this;
        const app = self.$f7;
        app.dialog.confirm("Really?", "Dropping course"
          , function(x) {
            self.promiseWithAuth('acadadmin/course/registration/drop', self.thisRegistration)
              .then( function(x) {
                self.fetchRegistration();
              });
          }, null);
        self.openPopup = false;
      },
      changeRegistration: function()
      {
        const self = this;
        const app = self.$f7;
        self.promiseWithAuth('acadadmin/course/registration/'+self.thisRegistration.type
          , self.thisRegistration).then(function(x) {
            var res = JSON.parse(x.data).data;
            if(res.success) {
              app.notification.create({title:"Success", subtitle:res.msg
                , closeOnClick: true, closeTimeout: 3000}).open();
              self.fetchRegistration();
            }
            else
              app.notification.create({title:"Failed", subtitle:res.msg
                , closeOnClick: true, closeTimeout: 10000}).open();
          });
        self.openPopup = false;
      },
      addRegistration: function()
      {
        const self = this;
        const app = self.$f7;
        let course = self.thisCourseId.split('-');
        self.thisRegistration.course_id = course[0];
        self.thisRegistration.year = course[2];
        self.thisRegistration.semester = course[1];
        self.changeRegistration();
      },
      assignGrade: function()
      {
        const self = this;
        const app = this.$f7;
        console.log('Grading: ', self.thisRegistration);
        self.promiseWithAuth('acadadmin/course/grade', self.thisRegistration)
          .then(function(x) {
            let res = JSON.parse(x.data).data;
            if(res.success) {
              app.notification.create({title:"Success", subtitle:res.msg
                , closeOnClick: true, closeTimeout: 3000}).open();
              self.fetchRegistration();
            }
            else
              app.notification.create({title:"Failed", subtitle:res.msg
                , closeOnClick: true, closeTimeout: 10000}).open();
          });
        self.openPopup = false;
      },
    }
  }
</script>



