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
      <f7-block-title>
        {{thisYear}}/{{thisSemester}}/{{thisCid}}: 
        <strong>Score {{feedbacks.score.toFixed(1)}}/10</strong>

        <f7-button raised small icon="fas fa-download"
          @click="downloadFeedback('data.csv')" class="float-right">
          Download Feedback
        </f7-button>

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
import Papa from 'papaparse';

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
      downloadFeedback: function(filename) {
        const self = this;

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

          console.log('file system open: ' + fs.name);
          fs.root.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {

            console.log("fileEntry is file?" + fileEntry.isFile.toString(), fileEntry);
            // fileEntry.name == 'someFile.txt'
            // fileEntry.fullPath == '/someFile.txt'
            let csv = Papa.unparse(self.feedbacks.data);
            self.writeCSVFile(fileEntry, csv);

          }, null);
        }, null);

        // window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (rootDirEntry) {
        //   rootDirEntry.getDirectory("", { create: true }, function (dirEntry) {
        //     var isAppend = false;
        //     dirEntry.getFile(filename, { create: true }, function (fileEntry) {
        //       let csv = Papa.unparse(self.feedbacks.data);
        //       self.writeCSVFile(fileEntry, csv, isAppend);
        //     });
        //   });
        // });
      },
    },
  }
</script>
