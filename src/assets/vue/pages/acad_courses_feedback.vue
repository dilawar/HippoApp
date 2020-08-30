<template>
  <f7-page>
    <f7-navbar title="Course Feedback" back-link="Back">
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
    <f7-block id="course-feedback">

        <!-- Summary -->
        <f7-block-title>
            {{thisYear}}/{{thisSemester}} 
            <span v-if="thisCid"> ({{thisCid}})</span>
            <span v-else> (all courses)</span>
            <f7-row>
                <f7-button small icon="fas fa-print"
                    @click="printFeedback">
                    Print This Page
                </f7-button>
                <f7-button small icon="fas fa-download"
                    @click="downloadFeedback()">
                    Data
                </f7-button>
            </f7-row>
        </f7-block-title>

        <div>
            <f7-card title="Summary plot of selected courses (max score possible=10)">
                <column-chart :data="feedbacks.score" slot="content" :max="10" :download="true">
            </column-chart>
        </f7-card>

        <f7-card v-for="vals, key1 in feedbacks.responses" :key="key1" outline no-shadow>
            <f7-card-header v-html="getQuestion(key1).question">
            </f7-card-header>
            <f7-card-content>
                <f7-row v-for="responses, who in vals" :key="who">
                    {{who}} 

                    <f7-col v-for="val, type in responses">
                        <div v-if="type==='text'">
                            <li v-for="res, k in val" v-html="res" :key="k">
                            </li>
                        </div>
                        <div v-else>
                            <pie-chart :data="val"></pie-chart>
                        </div>
                    </f7-col>
                </f7-row>
            </f7-card-content>
        </f7-card>
    </div>
</f7-block>
  </f7-page>
</template>

<script>

import { Printd } from 'printd';
export default {
    data() {
        const self = this;
        return {
            thisYear: self.$f7route.params.year,
            thisSemester: self.$f7route.params.semester,
            thisCid: self.$f7route.params.cid,
            thisCourseMetadata: {},
            feedbacks: {score:0, responses:[], data:[],},
            thisFeedbcak: {},
            openPopup: false,
            output: null,
            cssPdf: "",
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
        printFeedback: function() {
            const self = this;
            const d = new Printd();
            d.print(document.getElementById('course-feedback'), [self.cssPdf]);
        },
        getThisCourseId: function() {
            const self = this;
            if(! self.thisCid)
                self.thisCid = '';
            let cid = self.thisCid + '-' + self.thisSemester + '-' + self.thisYear;
            return cid;
        },
        fetchFeedback: function()
        {
            const self = this;
            const app = self.$f7;
            let cid = self.getThisCourseId();
            console.log("Fetching feedback for " + cid);
            app.dialog.preloader('Fetching feedback...');
            self.postWithPromise('acadadmin/course/feedback2/'+btoa(cid))
                .then(function(x) {
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
        downloadFeedback: function() {
            const self = this;
            let filename = self.getThisCourseId() + '.csv';
            self.writeCSVFile(filename, self.feedbacks.data);
        },
    },
}
</script>
