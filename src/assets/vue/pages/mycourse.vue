<template>
   <f7-page page-content ptr @ptr:refresh="refreshCourses">
      <f7-navbar title="My Courses" back-link="Back"></f7-navbar>

      <f7-block>
         <f7-block-title>Currently Running Courses</f7-block-title>

         <f7-list accordion-list>

            <f7-list-item accordion-item 
                          v-for="(course, key) in runningCourses" 
                          :key="key"
                          >

               <div slot="header">
                  Credits {{metadata[course.course_id].credits}},
                  Slot {{course.slot}} @{{course.venue}}, <tt>{{course.course_id}}</tt>
               </div>
               <div slot="after" v-if="alreadyRegistered(course.id)">
                  <f7-icon> {{alreadyRegistered(course.id)}}</f7-icon>
               </div>
               <div slot="footer">
                  Timeline: {{course.start_date}}  to {{course.end_date}}
               </div>
               <div slot="title">
                  {{metadata[course.course_id].name}}
               </div>
               <div slot="footer">
                  {{course.note}}
               </div>

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
                        <f7-button small raised fill
                           v-if="alreadyRegistered(course.id) != 'CREDIT'"
                           @click="registerCourse(course, 'CREDIT')"
                        >Credit</f7-button> 
                     </f7-col>
                     <f7-col>
                        <f7-button small raised fill 
                           @click="registerCourse(course, 'AUDIT')"
                           v-if="(course.is_audit_allowed=='YES') && (alreadyRegistered(course.id)!='AUDIT')"
                           >Audit</f7-button>
                     </f7-col>
                     <f7-col> 
                        <f7-button small raised fill
                                   v-if="today() <= dbDate(course.allow_deregistraction_until)"
                                   @click="registerCourse(course, 'DROP')"
                                   >Drop</f7-button>
                        <f7-button small v-else disable>Drop
                        </f7-button> 
                        </f7-col>
                  </f7-row>

                  </f7-block>

               </f7-accordion-content>

            </f7-list-item>

         </f7-list>

      </f7-block>

      <f7-block>
         <f7-block-title>My Courses</f7-block-title>
         <f7-list accodion-list no-hairlines>
            <f7-list-item accordion-item 
                          v-for="(course, key) in courses" :key="key"
                          :title="course.name"
                          >
                  <div slot="header">
                     {{course.year}}, {{course.semester}},
                     <span v-if="course.grade" style="color:blue;font-weight:500">
                        ({{course.grade}})
                     </span>
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
         fetchCourses: function() {
            const self = this;
            console.log("Fetching courses..");
            self.postWithPromise('/me/course').then( function(json) {
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
            /* console.log( regType + "ing course " + course.id ); */
            // NOTE:course.id can have characters which are not allowed in URL at
            // server.
            self.postWithPromise( "/courses/register/"+btoa(course.id)+"/"+regType).then( function(json) {
               let res = JSON.parse(json);
               if( res.status == 'ok')
               {
                  /* console.log( "Successfully registered "); */
                  // Refresh my couses.
                  self.fetchCourses();
               }
               else
               {
                  // Notify user.
                  console.log( "Failed to register");
               }
            });
         },
         alreadyRegistered: function(cid) {
            const self = this;
            /* console.log("Checking if " + cid + " is in my list."); */
            let res = self.courses.filter(x => cid == x.course_id+"-"+x.semester+"-"+x.year);
            /* console.log(res, 'register', cid); */
            if(res.length==1)
               return res[0].type;
            return "";
         },
      },
   }
</script>
