<template>
   <f7-page page-content ptr @ptr:refresh="refreshCourses">
      <f7-navbar title="Courses" back-link="Back">
      </f7-navbar>

     <f7-block-title medium>Running Courses.</f7-block-title>
     <f7-block-header>
       Click on the list item to <tt>AUDIT</tt>, <tt>CREDIT</tt> or to
       <tt>DROP</tt> a course.
     </f7-block-header>

     <f7-list media-list accordion-list no-hairlines>
        <f7-list-item accordion-item 
                      v-for="(course, key) in runningCourses" 
                      :key="key">
           <div slot="header">
              Credits {{metadata[course.course_id].credits}},
              Slot {{course.slot}} @{{course.venue}}, <tt>{{course.course_id}}</tt>
           </div>
           <div slot="media" v-if="alreadyRegistered(course.id)">
                <f7-icon icon="fa fa-bookmark fa-2x"></f7-icon>
           </div>
           <div slot="title"> {{metadata[course.course_id].name}} </div>
           <div slot="subtitle">
             {{course.start_date | date}} to {{course.end_date | date}} 
           </div>
           <div slot="footer"> {{course.note}} </div>

           <f7-accordion-content>
              <f7-block>
              <p style="font-size:small;margin-left:3%;text-align:justify" 
                 v-html="metadata[course.course_id].description"></p>
              <div>
                 <p><strong>Instructor(s)</strong></p>
                 <p v-html="metadata[course.course_id].instructors.html"></p>
              </div>

              <f7-row>
                 <f7-col> 
                   <f7-button small raised fill color="red"
                              v-if="(today()<=dbDate(course.allow_deregistraction_until)) && alreadyRegistered(course.id)"
                              @click="registerCourse(course, 'DROP')"
                              >Drop</f7-button>
                 </f7-col>
                 <f7-col>
                    <f7-button small raised fill 
                       @click="registerCourse(course, 'AUDIT')"
                       v-if="(course.is_audit_allowed=='YES') && 
                             (alreadyRegistered(course.id)!='AUDIT')">
                      Audit
                    </f7-button>
                 </f7-col>
                 <f7-col> 
                    <f7-button small raised fill
                       v-if="alreadyRegistered(course.id) != 'CREDIT'"
                       @click="registerCourse(course, 'CREDIT')"
                    >Credit</f7-button> 
                 </f7-col>
              </f7-row>
              </f7-block>
           </f7-accordion-content>
        </f7-list-item>
     </f7-list>

      <!-- POPUP for giving feedback -->
      <f7-popup tablet-fullscreen :opened="feedbackPopup" @popup:closed="feedbackPopup=false">
        <f7-page>
          <f7-navbar title="Feedback">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>

          <template v-for="(catQues, qcat) in questions" >
            <div v-for="(que, qid) in catQues" :key="'que'+qcat+qid">
              <f7-card>
                <f7-card-content>
                  <div style="font-size:small">{{catQues[0].category}}</div>
                  <div v-html="que.question"></div>

                  <!-- instructor spesific questions has multiple answers. -->
                  <f7-list v-for="(inst, key) in thisCourse.instructors"
                    :key="'que'+qid+':'+key" style="list-style-type:none">
                    <f7-list-item :title="inst[1]" v-if="que.choices" 
                        smart-select 
                        :smart-select-params="{openIn:'popover',closeOnSelect:true, routableModals:false}">
                      <select name="feedback">
                        <option v-for="(choice,index) in que.choices.split(',')"
                          :selected="choice===oldResponse(que.id, false)"
                          :key="inst[0]+qid+choice" 
                          :value="choice">{{choice}}</option>
                      </select>
                    </f7-list-item>
                    <f7-list-item v-else>
                      No choices.
                    </f7-list-item>
                  </f7-list>
                </f7-card-content>
              </f7-card>
            </div>
          </template>

          <div style="padding:10px">
            <f7-button raised fill @click="submitFeedback">Submit</f7-button>
          </div>

        </f7-page>
      </f7-popup>

      <f7-block>
         <f7-block-title medium>My courses</f7-block-title>
         <f7-list media-list no-hairlines>
            <f7-list-item v-for="(course, key) in courses" :key="'course'+key"
                          :title="course.name"
                          @click="handleFeedback(course)">
               <div slot="header">
                  {{course.year}}, {{course.semester}},
                  <span v-if="course.grade" style="color:blue;font-weight:500">
                     ({{course.grade}})
                  </span>
               </div>
               <div slot="after">
                  <span style="float:right"><strong>{{course.type}}</strong></span>
               </div>
               <div slot="footer">
                  <span>
                     Registered on {{course.registered_on}}
                  </span>
                  <br />
                  <span v-if="course.grade">
                     Grade assigned on: {{course.grade_is_given_on}}
                  </span>
               </div>
            </f7-list-item>
            <f7-list-item>
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
      courses: {},
      runningCourses: {},
      metadata: {},
      thisCourse: {},
      feedbackPopup: false,
      questions: {},
      feedback: {},
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;

    // Fetch metadata first.
    self.fetchCoursesMetadata();
    setTimeout( function() {
      self.fetchCourses();
      self.fetchRunningCourses();
    }, 2000);

  },
  methods: {
    fetchCoursesPromise: function() {
      const self = this;
      const app = self.$f7;
      return self.postWithPromise('/me/course')
        .then( function(x) {
          self.courses = JSON.parse(x.data).data;
        });
    },
    fetchCourses: function() {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader('Fetching your courses...');
      self.fetchCoursesPromise().then(function(x) {
        app.dialog.close();
      });
      setTimeout(() => app.dialog.close(), 5000);
    },
    fetchCoursesMetadata: function() {
      const self = this;
      self.postWithPromise('/courses/metadata/'+btoa('all'))
        .then( function(x) {
          self.metadata =  JSON.parse(x.data).data;
        });
    },
    fetchRunningCourses: function() {
      const self = this;
      self.postWithPromise('/courses/running')
        .then( function(x) {
          self.runningCourses = JSON.parse(x.data).data;
        });
    },
    refreshCourses: function(e, done) {
      const self = this;
      //setTimeout( () => self.fetchCoursesMetadata(), 1000);
      setTimeout(() => self.fetchCourses(), 1000);
      setTimeout(() => self.fetchRunningCourses(), 1000);
      done();
    },
    registerCourse: function(course, regType='CREDIT') {
      const self = this;
      const app = self.$f7;

      /* console.log( regType + "ing course " + course.id ); */
      // NOTE:course.id can have characters which are not allowed in URL at
      // server.
      app.preloader.show();
      self.postWithPromise("/courses/register/"+btoa(course.id)+"/"+regType)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) 
          {
            self.fetchCoursesPromise().then(function(x) {
              // Subscribe to notification.
              if(regType==='DROP')
                self.subscribeFCM(course.id);
              else
                self.unsubscribeFCM(course.id);
            });
            app.preloader.hide();
            self.notify("Success", res.msg);
          }
          else
          {
            app.preloader.hide();
            self.notify("Failed", "Failed to update course. " + res.msg);
          }
        });
      setTimeout(() => app.preloader.hide(), 5000);
    },
    alreadyRegistered: function(cid) {
      const self = this;
      if(! self.courses)
        return;
      let res = self.courses.filter(x => 
        cid == (x.course_id+"-"+x.semester+"-"+x.year)
      );
      /* console.log(res, 'register', cid); */
      if(res.length==1)
        return res[0].type;
      return "";
    },
    handleFeedback: function(course)
    {
      const self = this;
      const app = self.$f7;
      self.thisCourse = course;

      app.preloader.show();
      self.postWithPromise('/courses/feedback/questions')
        .then( function(x) {
          self.questions = JSON.parse(x.data).data;

          // Populate feedback so we can bind values. This is bit
          // contrived.
          Object.keys(self.questions).map(
            function(k, i) {
              Object.keys(self.questions[k]).map(
                function(i, e) {
                  const qid = self.questions[k][i].id;
                  self.feedback[qid] = {"response": ""};
                });
            })
        });
      let cid = course.course_id + '-' + course.semester + '-' + course.year;
      self.postWithPromise('/courses/feedback/get/'+btoa(cid))
        .then(function(x) {
          let data = JSON.parse(x.data).data;
          self.feedback = data;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 3000);
      self.feedbackPopup = true;
    },
    oldResponse: function(qid, _default=null){
      const self = this;
      if(! self.feedback)
        return _default;
      else if(self.feedback.length == 0)
        return _default;
      else if( null == self.feedback)
        return _default;

      if(qid in self.feedback)
        return self.feedback[qid]['response'];
      return _default;
    },
    submitFeedback: function( ) {
      const self = this;
      console.log( "data is ", self.feedback);
      let cid = self.thisCourse.id;
      self.postWithPromise('/courses/feedback/submit/'+btoa(cid))
        .then( function(x) {
          console.log("Submitting  feedback for ",cid);
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 3000);
    }
  },
}
</script>
