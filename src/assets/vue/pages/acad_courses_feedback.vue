<template>
  <f7-page>
    <f7-navbar title="Manage Feedback" back-link="Back">
    </f7-navbar>

    <!-- POPUP  -->
    <f7-popup :opened="openPopup" @popup:close="openPopup = false">
      <f7-page>
        <f7-navbar title="Manage registration">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
      </f7-page>
    </f7-popup>

    <!-- Responses -->
    <f7-block>

      <!-- Summary -->
      <f7-block-title medium>
        {{thisYear}}/{{thisSemester}}/{{thisCid}}: <strong>Score {{feedbacks.score.toFixed(1)}}/10</strong>

      </f7-block-title>

      <f7-card v-for="vals, key1 in feedbacks.responses" :key="key1" outline no-shadow>
        <f7-card-header v-html="getQuestion(key1).question">
        </f7-card-header>

        <f7-card-content>
          <div v-for="val, type in vals" :key="type">
            <div v-if="type==='text'">
              <f7-row v-for="res, k in val" v-html="res" :key="k">
              </f7-row>
            </div>
            <div v-else>
              <!-- <column-chart :data="val" height="230px"></column-chart> -->
              <pie-chart :library="{cutoutPercentage:30,
                legend:{position:'right'}}" :data="val" height="230px"></pie-chart>
            </div>
          </div>
        </f7-card-content>
      </f7-card>

    </f7-block>

  </f7-page>
</template>

<script>

import Vue from 'vue'
import excel from 'vue-excel-export'
Vue.use(excel)

  export default {
    data() {
      const self = this;
      return {
        thisYear: self.$f7route.params.year,
        thisSemester: self.$f7route.params.semester,
        thisCid: self.$f7route.params.cid,
        thisCourseMetadata: {},
        feedbacks: {},
        thisFeedbcak: {},
        openPopup: false,
      };
    },
    mounted()
    {
      const self = this;
      self.postWithPromise('courses/metadata/'+btoa(self.getThisCourseId()))
        .then( function(x) {
          self.thisCourseMetadata = JSON.parse(x.data).data[self.getThisCourseId()];
        });

      self.fetchFeedback();
          
    },
    methods : {
      getThisCourseId: function() {
        const self = this;
        let cid = self.thisCid + '-' + self.thisSemester + '-' + self.thisYear;
        return cid;
      },
      fetchFeedback: function()
      {
        const self = this;
        const app = self.$f7;
        app.dialog.preloader('Fetching feedback...');
        self.postWithPromise('acadadmin/course/feedback/'+btoa(self.getThisCourseId()))
          .then( function(x) {
            self.feedbacks = JSON.parse(x.data).data;
            app.dialog.close();
          });
        setTimeout(() => app.dialog.close(), 5000);
      },
      getQuestion: function(qid) {
        const self = this;
        qid = parseInt(qid);
        if(qid in self.feedbacks.questions)
          return self.feedbacks.questions[qid];
        return {question:'', choices:''};
      },
      getFeedbackSummary: function(val, qid) {
        const self = this;
        let q = self.getQuestion(qid);

        let responses = {};
        let html = '<table><tr>';
        q.choices.forEach(x => {
          responses[x] = 0;
          html += "<th>" + x + "</th>";
        });
        html += "</tr><tr>";
        val.forEach(x => {
          responses[x.response] += 1;
        });

        Object.entries(responses).forEach((v, x) => {
          html += '<td>'+v[1]+'</td>';
        });
        html += "</tr></table>";

        return html;
      },
    },
  }
</script>
