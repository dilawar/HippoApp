<template>
  <f7-page page-content ptr @ptr:refresh="fetchData">
    <f7-navbar :title="title" back-link="Back">
    </f7-navbar>

    <!-- Talks -->
    <f7-block v-if="what === 'talks'">
      <f7-block-title medium> Upcoming Talks</f7-block-title>
      <f7-list accordion-list media-list no-hairlines>
        <f7-list-item v-for="talk, key in talks" 
          :header="talk.date +' | ' + talk.start_time + ' | ' + talk.venue"
          :title="talk.speaker"
          :text="talk.title" 
          :key="key" 
          accordion-item>
        <f7-accordion-content>
          <div v-html="talk.vc_url"></div>
          <f7-block style="padding:20px;background-color:ivory" inset>
            <div v-html="talk.title" style="font-weight:bold"></div>
            <f7-link v-if="talk.vc_url" external target="_system" href="talk.vc_url">
              {{talk.vc_url}}
            </f7-link>
            <div v-html="talk.description"></div>
          </f7-block>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>
  </f7-block>

  <!-- AWS -->
  <f7-block v-if="what === 'upcomingawses'">
    <f7-list v-for="awss, date in awses" :key="date" accordion-list media-list>
      <f7-list-item group-title :title="humanReadableDateTime(date,awss[0].time) + ' | ' + awss[0].venue">
      </f7-list-item>
      <f7-list-item v-if="awss[0].vc_url">
        <f7-link slot="after" external target="_system" :href="awss[0].vc_url">
          {{awss[0].vc_url}}
        </f7-link>
      </f7-list-item>
      <f7-list-item v-for="aws, key in awss" :key="key" 
        :text='aws.title'
        :header="aws.supervisor_1"
        :footer="aws.is_presynopsis_seminar==='YES'?'Presynopsis':''"
        :after="aws.acknowledged === 'YES'?'':'Not acknowledged'"
        accordion-item 
        :title="aws.by">
        <f7-accordion-content>
          <div v-html="aws.abstract"></div>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>
  </f7-block>

  <!-- JCS -->
  <f7-block v-if="what === 'jcs'">
    <f7-block-title>Journal Clubs</f7-block-title>

    <f7-list accordion-list media-list no-hairlines>
      <f7-list-item v-for="jc, key in jcs" :key="key" 
        :header="jc.jc_id + ' | ' + humanReadableDateTime(jc.date, jc.time) + ' | ' + jc.venue" 
        accordion-item>
        <div slot="text"> {{jc.by}} <{{jc.presenter}}> </div>
        <div slot="title" v-html="jc.title"></div>
        <f7-accordion-content>
          <f7-block style="padding:10px; background-color:ivory">
            <div v-html="jc.description"></div>
          </f7-block>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>
  </f7-block>

  <!-- Courses -->
  <f7-block v-if="what === 'courses'">
    <f7-list accordion-list media-list no-hairlines>
      <f7-list-item v-for="course, key in courses" 
        :title="course.name"
        :header="'Slot ' + course.slot + ' | ' + course.start_date + ' to ' + course.end_date + ' | ' + course.venue"
        @accordion:open="fetchStudents(course.id)"
        :key="key" accordion-item>
        <div slot="footer" class="text-color-blue">
          {{course.note}}
        </div>
        <f7-accordion-content>

          <f7-block inset>
            <f7-row v-for="inst, key in course.instructors" :key="key">
              <f7-link class="float-right" :href="'mailto:'+inst[0]">
                {{inst[1]}}
              </f7-link>
            </f7-row>

            <f7-list media-list>
              <f7-list-item group-title title="Registrations">
              </f7-list-item>
              <f7-list-item v-for="reg, key in registrations" 
                :title="reg.name"
                :after="reg.type"
                :footer="reg.registered_on"
                :key="key">
              </f7-list-item>
              <f7-list-item>
                <f7-link external target="_system" slot="after" 
                  :href="'mailto:'+emails.join(',')">
                  Send Email To All Students
                </f7-link>
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>
  </f7-block>

</f7-page>
</template>

<script>
export default {
  data()
  {
    const self = this;
    return {
      jcs: {},
      talks: {},
      awses: {},
      courses: {},
      slots: {},
      what: self.$f7route.params.what,
      title: '',
      registrations: [],
      emails: [],
    };
  },
  mounted()
  {
    const self = this;
    if(self.what === 'talks') {
      self.title = 'Talks';
      self.postWithPromise('/info/talks/10').then(function(x) {
        self.talks = JSON.parse(x.data).data;
      });
    }
    else if(self.what === 'upcomingawses') {
      self.title = 'Upcoming AWS';
      self.postWithPromise('/info/upcomingaws').then(function(x) {
        self.awses = JSON.parse(x.data).data;
        console.log('awses', self.awses);
      });
    } 
    else if(self.what == 'jcs') {
      self.title = 'Journal Clubs';
      self.postWithPromise('/info/jcs').then(function(x) {
        self.jcs = JSON.parse(x.data).data;
      });
    }
    else if(self.what === 'courses') {
      self.title = 'Courses';
      self.postWithPromise('info/courses').then(function(x) {
        self.courses = JSON.parse(x.data).data;
      });
      self.postWithPromise('info/slot/all').then(function(x) {
        self.slots = JSON.parse(x.data).data;
      });
    }
    else if(self.what === 'statistics') {
      self.title = 'Statistics';
    }
    else
      self.title = 'Unknown';
    self.fetchData(true);
  },
  methods: {
    fetchData: function() {
      const self = this;
      const app = self.$f7;
    },
    fetchStudents: function(cid) {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      console.log("Fetching students ", cid);
      self.registrations = [];
      self.emails = [];
      self.postWithPromise('courses/registration/'+btoa(cid))
        .then( function(x) {
          self.registrations = JSON.parse(x.data).data;
          Object.keys(self.registrations).forEach(x=> {
            self.emails.push(self.registrations[x].email);
          });
          /* console.log("emails", self.emails); */
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 2000);
    },
  },
}
</script>
