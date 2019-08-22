<template>
   <f7-page page-content ptr @ptr:refresh="refreshCourses">
      <f7-navbar title="Courses" back-link="Back"></f7-navbar>

      <f7-block>
         <f7-block-title>Running Courses</f7-block-title>

         <f7-list accordion-list no-hairlines>
            <f7-list-item accordion-item 
                          v-for="(course, key) in runningCourses" 
                          :key="key"
                          >
               <div slot="header">
                  Credits {{metadata[course.course_id].credits}},
                  Slot {{course.slot}} @{{course.venue}}, <tt>{{course.course_id}}</tt>
               </div>
               <div slot="media" v-if="alreadyRegistered(course.id)" >
                    <f7-icon icon="fa fa-bookmark fa-2x"></f7-icon>
               </div>
               <div slot="footer"> Timeline: {{course.start_date}}  to {{course.end_date}} </div>
               <div slot="title"> {{metadata[course.course_id].name}} </div>
               <div slot="footer"> {{course.note}} </div>

               <f7-accordion-content>
                  <f7-block>
                  <p style="font-size:small;margin-left:3%;text-align:justify" 
                     v-html="metadata[course.course_id].description"></p>
                  <div>
                     <p><strong>Instructor(s)</strong></p>
                     <p v-html="
                                metadata[course.course_id].instructors"></p>
                  </div>

                  <f7-row>
                     <f7-col> 
                        <f7-button small raised fill color="red"
                                   v-if="(today()<=dbDate(course.allow_deregistraction_until))
                                         && alreadyRegistered(course.id)"
                                          @click="registerCourse(course, 'DROP')"
                                   >Drop</f7-button>
                     </f7-col>
                     <f7-col>
                        <f7-button small raised fill 
                           @click="registerCourse(course, 'AUDIT')"
                           v-if="(course.is_audit_allowed=='YES') && (alreadyRegistered(course.id)!='AUDIT')"
                           >Audit</f7-button>
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
      </f7-block>

      <!-- POPUP for giving feedback -->
      <f7-popup :opened="feedbackPopup" @popup:closed="feedbackPopup=false">
         <f7-page>
            <f7-navbar title="Feedback">
               <f7-nav-right>
                  <f7-link popup-close>Close</f7-link>
               </f7-nav-right>
            </f7-navbar>

            <f7-block>
               <f7-block-title small>{{thisCourse.name}}</f7-block-title>

               <f7-block v-for="(catQues, key) in questions" :key="key">
                  <f7-block-title>{{key}}</f7-block-title>
                  <f7-list>
                     <f7-list-item v-for="(que,id) in catQues">
                          <div style="font-size:small"
                               slot="root-start"
                               v-html="que.question"
                               >
                          </div>

                             <f7-row>
                                <f7-col v-for="(choice,chid) in que.choices.split(',')"
                                        :key="chid">
                                   <f7-radio :name="que.id" :value="choice"></f7-radio>
                                   <span style="font-size:xx-small">{{choice}}</span>
                                </f7-col>
                             </f7-row>
                     </f7-list-item>
                  </f7-list>

               </f7-block>

            </f7-block>
         </f7-page>
      </f7-popup>

      <f7-block>
         <f7-block-title>My courses</f7-block-title>
         <f7-list media-list no-hairlines>
            <f7-list-item v-for="(course, key) in courses" :key="key"
                          :title="course.name"
                          @click="giveFeedback(course)"
                          >
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
         </f7-list>
      </f7-block>

   </f7-page>

</template>

<script>
   export default {
      data() {
         const self = this;
         return {
            courses: [],
            runningCourses: [],
            metadata: [],
            thisCourse: {},
            feedbackPopup: false,
            questions: [],
            feedback: null, 
         };
      },
      mounted()
      {
         const self = this;
         self.courses = self.loadStore('me.course');
         if(self.courses.length == 0)
            setTimeout( () => self.fetchCourses(), 1000);

         self.runningCourses = self.loadStore('courses.running');
         if(self.runningCourses.length == 0)
            setTimeout( () => self.fetchRunningCourses(), 1000);

         self.metadata = self.loadStore('courses.metadata');
         if(self.metadata.length == 0)
            setTimeout( () => self.fetchCoursesMetadata(), 1000);

      },
      methods: {
         fetchCoursesPromise: function() {
            const self = this;
            const app = self.$f7;
            return self.postWithPromise('/me/course').then( function(json) {
               let res = JSON.parse(json);
               if(res.status == 'ok')
               {
                  self.saveStore('me.course', res.data);
                  self.courses = res.data;
               }
               else
               {
                  console.log( 'Failed to fetch data');
                  self.courses = self.loadStore('me.course');
               }
            });
         },
         fetchCourses: function() {
            const self = this;
            const app = self.$f7;
            console.log("Fetching courses..");
            app.preloader.show();
            self.fetchCoursesPromise().then( function(x) {
               app.preloader.hide();
            });
            setTimeout(() => app.preloader.hide(), 5000);
         },
         fetchCoursesMetadata: function() {
            const self = this;
            console.log("Fetching courses metadata ...");
            self.postWithPromise('/courses/metadata/all').then( function(json) {
               let res = JSON.parse(json);
               if(res.status == 'ok')
                  self.saveStore('courses.metadata', res.data);
               else
                  console.log( 'Failed to fetch data');
               self.metadata = self.loadStore('courses.metadata');
            });
         },
         fetchRunningCourses: function() {
            const self = this;
            console.log("Fetching running courses..");
            self.postWithPromise('/courses/running').then( function(json) {
               let res = JSON.parse(json);
               if(res.status == 'ok')
                  self.saveStore('courses.running', res.data);
               else
                  console.log( 'Failed to fetch data');
               self.runningCourses = self.loadStore('courses.running');
            });
         },
         refreshCourses: function(e, done) {
            const self = this;
            setTimeout( () => self.fetchCourses(), 1000);
            setTimeout( () => self.fetchRunningCourses(), 1000);
            setTimeout( () => self.fetchCoursesMetadata(), 1000);
            done();
         },
         registerCourse: function(course, regType='CREDIT') {
            const self = this;
            const app = self.$f7;

            /* console.log( regType + "ing course " + course.id ); */
            // NOTE:course.id can have characters which are not allowed in URL at
            // server.
            app.preloader.show();
            self.postWithPromise( "/courses/register/"+btoa(course.id)+"/"+regType)
               .then(function(json) {
                  let res = JSON.parse(json);
                  if( res.status == 'ok')
                     self.fetchCoursesPromise().then(function(x) {
                        app.preloader.hide();
                     });
                  else
                     navigator.notification.alert("Failed to update course", null , "Course", "OK");
            });
            setTimeout( () => app.preloader.hide(), 5000);
         },
         alreadyRegistered: function(cid) {
            const self = this;
            let res = self.courses.filter(x => cid == x.course_id+"-"+x.semester+"-"+x.year);
            /* console.log(res, 'register', cid); */
            if(res.length==1)
               return res[0].type;
            return "";
         },
         giveFeedback: function(course)
         {
            const self = this;
            const app = self.$f7;

            console.log( "Giving feedback for ", course);
            self.thisCourse = course;

            app.preloader.show();
            self.postWithPromise('/courses/feedback/questions')
               .then( function(json) {
                  self.questions = JSON.parse(json).data;
               });

            console.log(course);
            let cid = course.course_id + '-' + course.semester + '-' + course.year;
            self.postWithPromise('/courses/getfeedback/'+btoa(cid))
               .then( function(json) {
                  console.log("Getting old feedback for ",cid);
                  let data = JSON.parse(json).data;
                  self.feedback = data;
                  app.preloader.hide();
               });
            setTimeout(() => app.preloader.hide(), 3000);
            self.feedbackPopup = true;
         },
      },
   }
</script>
