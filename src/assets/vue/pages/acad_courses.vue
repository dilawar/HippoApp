<template>
  <f7-page>
    <f7-navbar title="Courses" back-link="Back">
    </f7-navbar>

    <f7-list inset>
      <f7-list-item>
        <f7-row>
          <f7-col>
            <f7-list-input 
             @change="fetchCourse()" 
             @input="thisYear=$event.target.value"
             label="Select Year" type="number" :value="thisYear">
            </f7-list-input>
          </f7-col>
          <f7-col>
            <f7-list-input @change="fetchCourse()" 
                                 @input="thisSemester=$event.target.value"
                                 label="Select Semester" 
                                 type="select" 
                                 :value="thisSemester">
              <option value="Autumn">Autumn</option>
              <option value="Spring">Spring</option>
            </f7-list-input>
          </f7-col>
        </f7-row>
      </f7-list-item>
    </f7-list>

    <f7-block>
      <f7-block-title small>
        Running courses for {{thisYear}}, {{thisSemester}}
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item v-for="(course,key) in runningCourses" 
                      :key="key"
                      :link="'/updatecourse/'+course.id+'/'">
          <div slot="header">{{course.course_id}}, {{course.venue}}</div>
          <div slot="title">{{course.name}}</div>
          <div slot="footer">{{course.note}}</div>
        </f7-list-item>
        <f7-list-item></f7-list-item>
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
      thisData: [],
      courses: [],
      runningCourses: [],
      thisYear: moment().format('YYYY'),
      thisSemester: moment().month() <= 6?'Spring':'Autumn',
      openCoursePopup: false,
      thisCourse: [],
      thisCourseMetadata: [],
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
    self.postWithPromise('courses/running/'+self.thisYear+'/'+self.thisSemester)
      .then(function(x) {
        self.runningCourses = JSON.parse(x.data).data;
      });
    console.log('This year', self.thisYear);
  },
  methods : {
    fetchCourse: function() 
    {
      const self = this;
      self.postWithPromise('courses/running/'+self.thisYear+'/'+self.thisSemester)
        .then(function(x) {
          self.runningCourses = JSON.parse(x.data).data;
        });
    },
  },
}
</script>

