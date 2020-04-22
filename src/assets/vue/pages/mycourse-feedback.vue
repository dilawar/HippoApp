<template>
  <f7-page>
    <f7-navbar title="Feedback on courses" back-link="Back">
    </f7-navbar>

    <template v-for="(catQues, key) in questions">
      <div v-for="(que, index) in catQues" :key="index">
        <f7-card>
          <f7-card-content>
            <div style="font-size:small">{{catQues[0].category}}</div>
            <div v-html="que.question"></div>

            <!-- instructor spesific questions has multiple answers. -->
            <f7-list v-for="inst, key in thisCourse.instructors" style="list-style-type:none">
              <f7-list-item :title="inst[1]" v-if="que.choices"
                smart-select :smart-select-params="{routableModals:false}">
                <select name="feedback">
                  <option v-for="(choice,chid) in que.choices.split(',')"
                    :key="chid" :value="choice">
                    {{choice}}
                  </option>
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
</template>

<script>
export default {
  data() {
    const self = this;
    return {
      metadata: {},
      thisCourse: {},
      questions: {},
      feedback: {},
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
    //self.handleFeedback();
    console.log("getting router parameters");
    console.log(self.$f7route.params);
  },
  methods: {
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
        .then( function(x) {
          console.log("Getting old feedback for ",cid);
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
