<template>
  <f7-page>
    <f7-navbar title="Course Feedback" back-link="Back">
      {{thisYear}}/{{thisSemester}} 
      <span v-if="thisCid"> ({{thisCid}})</span>
      <span v-else> (all courses)</span>
    </f7-navbar>

    <!-- Responses -->
    <f7-toolbar tabber top>
      <f7-link tab-link="#tab-plots" tab-link-active>Show plots</f7-link>
      <f7-link tab-link="#tab-tables">Show tables</f7-link>
    </f7-toolbar>

    <f7-tabs>
      <!-- plots -->
      <f7-tab id="tab-plots" class="page-content" tab-active>
        <!-- Summary -->
        <f7-block-title>
          <f7-button icon="fas fa-print"
            @click="printFeedback">
            Print This Page
          </f7-button>
        </f7-block-title>
        <f7-block>
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

                <f7-col v-for="val, type in responses" :key="type">
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
    </f7-tab>
    <f7-tab id="tab-tables" class="page-content">
      <!-- Summary -->
      <f7-block-title>
        <f7-row>
          <f7-button icon="fas fa-download"
            @click="downloadFeedback()">
            Raw Data
          </f7-button>
          <f7-button icon="fas fa-download" @click="downloadExcel">
            Spreadsheet
          </f7-button>
        </f7-row>
      </f7-block-title>
      <f7-block>

        <div class="data-table">
          <table id="feedback-table" medium-only>
            <thead>
              <tr>
                <th>ID</th>
                <th>Question</th>
                <th>Intructor</th>
                <th colspan="10">Responses</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row, trkey in feedbackRows" :key="trkey">
                <td v-html="row.id"></td>
                <td v-html="row.question"></td>
                <td v-html="row.instructor"></td>
                <td v-for="res, key in row.responses" :key="key" v-html="res">
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </f7-block>
    </f7-tab>
  </f7-tabs>
</f7-page>
</template>

<script>
/* import XLXS from 'xlsx'; */
import TableExport from 'tableexport';
import { Printd } from 'printd';
import lodash from 'lodash';

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
      feedbackRows: [],
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
          self.generateFeedbackTable();
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
    generateFeedbackTable: function() {
      const self = this;
      let filename = self.getThisCourseId() + '.xls';

      let data = self.feedbacks.data;
      let questions = self.feedbacks.questions;

      data = lodash.groupBy(data, 'question_id');

      let finalData = [];

      lodash.forEach(data, function(values, qid) {
        let quesWithInstructors = lodash.groupBy(values, 'instructor_email');
        let question = questions[qid];
        lodash.forEach(quesWithInstructors, function(responses, instructor) {
          let response = {};
          question.choices.forEach( ch =>  response[ch] = 0);

          let row = { 'id' : qid, 'question': question.question, 'instructor': instructor, 'responses': [] };

          lodash.forEach(responses, function(resp) {
            response[resp.response] += 1;
          });

          /*
          let table = '<table><tr>';
          lodash.forEach(response, function(value, key) {
            table += "<th>"+key+"</th>";
          });
          table += "</tr><tr>";
          lodash.forEach(response, function(value, key) {
            table += "<td>"+value+"</td>";
          });
          table += "</tr></table>";
          row['responses'] = table;
           */

          let resHTML = [];
          lodash.forEach(response, function(value, key) {
          resHTML.push("<strong>"+value+"</strong> <small>("+key+")</small>");
          });
          row['responses'] = resHTML;
          finalData.push(row);
        });
      });
      self.feedbackRows = finalData;
    },
    downloadExcel: function() {
      const self = this;
      console.log("Downloading excel sheet");
      var table = TableExport(document.getElementById('feedback-table')
        , {
          headers: true,
          exportButton: true,
          position: "top",
          formats: ["xlsx", "csv", "txt"],
          filename: self.cid,
        });
      console.log(table);

      /*
      var wb = XLXS.utils.table_to_book(document.getElementById("feedback-table")
        , { sheet: self.cid });

      var wbout = XLXS.write(wb, {bookType:'xlsx', type:'binary'});
      let buf = new ArrayBuffer(wbout.length);

      let view = new Uint8Array(buf);
      for(var i=0; i < wbout.length; i++)
        view[i] = wbout.charCodeAt(i) & 0xFF;

      self.saveBlob(self.cid + '.xlsx', new Blob([buf], {type:'application/octet-stream'}));
       */
    },
  },
}
</script>
