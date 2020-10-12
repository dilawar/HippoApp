<template>
   <f7-page page-content ptr @ptr:refresh="refreshCourses">
      <f7-navbar title="Courses" back-link="Back">
      </f7-navbar>

      <!-- POPUP for giving feedback -->
      <f7-popup tablet-fullscreen :opened="feedbackPopup" @popup:closed="feedbackPopup=false">
        <f7-page>
          <f7-navbar :title="'Feedback: ' + thisCourse.name">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>

          <f7-block-header bg-color=yellow>
            <div v-if="feedback.unanswered==0">
              <f7-icon icon="fa fa-info-circle"></f7-icon>
              <strong>You have already completed the submission.</strong>
            </div>
            <div v-if="! feedback.editable[0]">
              <f7-icon icon="fa fa-info-circle"></f7-icon>
              Feedback submission is not allowed: 
              <strong>{{feedback.editable[1]}}</strong>
            </div>
          </f7-block-header>

          <f7-list media-list no-hairlines>
            <f7-list-group  v-for="(catQues, qcat, index) in questions" :key="qcat">

              <!-- Category of the question. Group title-->
              <f7-list-item :title="qcat" group-title>
              </f7-list-item>

              <!-- Questions start -->
              <f7-list-item v-for="(que, qid, index) in catQues" :key="qcat+qid">

                <!-- 
                Show question at the top and options at the bottom (stacked).
                Tried many other layout but this one works best both on mobile
                and browser and when there are many instrcutor.  NOTE TO FUTURE
                SELF: Don't play with it please, you will end up spending whole
                day and then revert back to this again.
                -->
                <div v-html="que.question"></div>

                <!-- Instructor specific -->
                <template v-if="que.type === 'INSTRUCTOR SPECIFIC'">
                    <f7-list-input v-for="(inst, key) in thisCourse.instructors" 
                      :key="'que'+qid+':'+key" 
                      :type="que.choices?'select':'textarea'" 
                      :disabled="! feedback.editable[0]"
                      resizable
                      @change="submitThisFeedback(que.id, $event.target.value, inst[0])"
                      :value="oldResponse(que.id, inst[0]).response">
                      <div slot="label">{{inst[1]}}
                        <span class="float-right">
                          {{oldResponse(que.id, inst[0]).last_modified_on}}
                        </span>
                      </div>
                      <!-- There are choices -->
                      <template v-if="que.choices">
                        <option v-for="(choice,index) in que.choices.split(',')" 
                          :selected="choice===oldResponse(que.id, inst[0]).response" 
                          :key="inst[0]+qid+choice" :value="choice">
                          {{choice}}
                        </option>
                      </template>
                    </f7-list-input>
                </template>
                <!-- Course specific -->
                <template v-else>
                  <f7-list-input 
                    :type="que.choices?'select':'textarea'" 
                    @change="submitThisFeedback(que.id, $event.target.value, '')"
                    :disabled="! feedback.editable[0]"
                    resizable 
                    :value="oldResponse(que.id, '').response">
                    <div slot="label">
                      <span class="float-right">
                        {{oldResponse(que.id, '').last_modified_on}}
                      </span>
                    </div>
                    <!-- There are choices -->
                    <template v-if="que.choices">
                      <option value="NA">Select one</option>
                      <option v-for="(choice,index) in que.choices.split(',')" 
                        :selected="choice===oldResponse(que.id, '').response" 
                        :key="qid+choice" :value="choice">
                        {{choice}}
                      </option>
                    </template>
                  </f7-list-input>
                </template>
              </f7-list-item>
            </f7-list-group>
            <f7-list-item>
              <f7-button small raised @click="feedbackPopup=false">Go Back</f7-button>
            </f7-list-item>
          </f7-list>
        </f7-page>
      </f7-popup>


     <!-- Running courses -->
     <f7-block-title medium>Running courses</f7-block-title>

     <f7-block-header>
       Click on the list item to <tt>AUDIT</tt>, <tt>CREDIT</tt> or to
       <tt>DROP</tt> a course.
     </f7-block-header>

     <f7-list media-list accordion-list no-hairlines>
        <f7-list-item accordion-item 
                      v-for="(course, key) in runningCourses" 
                      :key="key">
           <div slot="header">
              Credits {{getMetadata(course.course_id, 'credits')}},
              Slot {{course.slot}} @{{course.venue}}, <tt>{{course.course_id}}</tt>
           </div>
           <div slot="media" v-if="alreadyRegistered(course.id)">
                <f7-icon icon="fa fa-bookmark fa-2x"></f7-icon>
           </div>
           <div slot="title"> {{getMetadata(course.course_id, 'name')}} </div>
           <div slot="subtitle">
             {{course.start_date | date}} to {{course.end_date | date}} 
           </div>
           <div slot="footer"> {{course.note}} </div>

           <f7-accordion-content>
              <f7-block>
              <p style="font-size:small;margin-left:3%;text-align:justify" 
                 v-html="getMetadata(course.course_id, 'description')"></p>
              <div>
                 <p><strong>Instructor(s)</strong></p>
                 <p v-html="getMetadata(course.course_id, 'instructors', 'html')"></p>
              </div>
              <div v-if="course.is_audit_allowed==='NO'">
                <strong>No <tt>AUDIT</tt> allowed.</strong>
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

      <f7-block-title medium>My courses</f7-block-title>
      <f7-block-header>Click on the course for feedback.</f7-block-header>
      <f7-block>
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
              <span>Registered on {{course.registered_on}}</span>
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
import moment from 'moment';

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
      feedback: {responses:{}, unanswered:0, editable:[true, ""]},
    };
  },
  mounted: async function()
  {
    const self = this;
    const app = self.$f7;

    // Fetch metadata first.
    await self.fetchCoursesMetadata();
    self.fetchCourses();
    self.fetchRunningCourses();

  },
  methods: {
    fetchCoursesPromise: function() {
      const self = this;
      return self.postWithPromise('/me/course')
        .then( function(x) {
          self.courses = JSON.parse(x.data).data;
        });
    },
    getMetadata: function(cid, key1, key2='') {
      const self = this;
      if(cid in self.metadata) {
        let k1 = self.metadata[cid][key1];
        if(key2 && key2 in k1)
          return k1[key2];
        else
          return k1;
      }
      return '';
    },
    fetchCourses: function() {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.fetchCoursesPromise().then(function(x) {
        app.preloader.hide();
      });
      setTimeout(() => app.preloader.hide(), 5000);
    },
    fetchCoursesMetadata: async function() {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.postWithPromise('/courses/metadata/'+btoa('all'))
        .then( function(x) {
          self.metadata =  JSON.parse(x.data).data;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 3000);
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
          /* console.log('xxx', x.data); */
          const res = JSON.
            parse(x.data).data;
          if(res.success) 
          {
            self.fetchCoursesPromise().then(function(x) {
              // Subscribe to notification.
              if(regType!=='DROP')
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

      let res = Object.values(self.courses).filter(x => 
        cid == (x.course_id+"-"+x.semester+"-"+x.year)
      );

      // console.log(res, 'register', cid);
      if(res.length==1)
        return res[0].type;
      return "";
    },
    fetchFeedback: function(course) {
      const self = this;
      const app = self.$f7;
      let cid = course.course_id + '-' + course.semester + '-' + course.year;
      app.preloader.show();
      self.postWithPromise('/courses/feedback/get/'+btoa(cid))
        .then(function(x) {
          let data = JSON.parse(x.data).data;
          self.feedback = data;
          self.feedbackPopup = true;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 3000);
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
          self.fetchFeedback(course);
        });
      setTimeout(() => app.preloader.hide(), 3000);
    },
    oldResponse: function(qid, instructor){
      // If instructor is empty, its course feedback.
      const self = this;
      if(! (qid in self.feedback.responses))
        return {response:'', last_modified_on:''};
      if(! (instructor in self.feedback.responses[qid]))
        return {response:'', last_modified_on:''};
      return self.feedback.responses[qid][instructor];
    },
    getThisFeedback: function(qid, email) {
      const self = this;
      const app = self.$f7;
      let data = {question_id: qid, instructor_email: email,
        ...seld.thisCourse};
      self.promiseWithAuth('/courses/feedback/getthis', data)
        .then(function(x) {
          self.feedback.responses[qid][email] = JSON.parse(x.data).data;
        });
    },
    submitThisFeedback: function(qid, feedback, email='') {
      const self = this;
      const app = self.$f7;
      console.log("Submitting feedback", qid, feedback, email);
      let data = {question_id: qid, instructor_email: email, response: feedback, ...self.thisCourse};
      self.feedback.responses[qid][email] = {'response': feedback
        , 'last_modified_on': self.dbDateTime(self.today())};
      app.preloader.show();
      self.promiseWithAuth('/courses/feedback/submit', data)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 1000);
    },
  },
}
</script>
