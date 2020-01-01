<template>
  <f7-page>

    <f7-navbar title="Courses" back-link="Back">
    </f7-navbar>

    <f7-list>
      <f7-list-item>
        <f7-row>
          <f7-col>
            <f7-list-input @change="fetchCourse()" 
                               @input="thisYear=$event.target.value"
                               label="Select Year"
                               type="number" 
                               :value="thisYear">
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

    <!-- Metadata popup.  -->
    <f7-popup :opened="popupMetadata" @popup:close="popupMetadata = false">
      <f7-page>
        <f7-navbar title="Update course information">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
    
        <f7-block>

          <f7-list media-list no-hairlines>

            <f7-list-input label="ID" readonly :value="thisCourseMetadata.id">
            </f7-list-input>

            <f7-list-input label="Name"
                           :value="thisCourseMetadata.name"
                           @input="thisCourseMetadata.name=$event.target.value"
                           >
            </f7-list-input>

            <f7-list-input label="Credit"
                           :value="thisCourseMetadata.credits"
                           @input="thisCourseMetadata.credits=$event.target.value"
                           >
            </f7-list-input>

            <f7-list-input label="Description"
                           type="texteditor"
                           :value="thisCourseMetadata.description"
                           @texteditor:change="(value)=>thisCourseMetadata.description=value"
                           >
            </f7-list-input>

            <!-- Instructors -->
            <f7-list-group>
              <f7-list-item title="Instructors" group-title >
              </f7-list-item>
              <f7-list-item v-for="i in 6" :key="'inst'+i"
                            v-if="thisCourseMetadata['instructor_'+i]"
                            media-item>
                <div slot="title">
                  {{thisCourseMetadata['instructor_'+i]}}
                </div>
                <div slot="after">
                  <f7-link raised small @click="removeInstructor(i)"> REMOVE </f7-link> 
                </div>
              </f7-list-item>

              <f7-list-input :input="false" label="Add an instructor" inline-label>
                <input id="autocomplete-instructor" placeholder="autocomplete" slot="input" />
              </f7-list-input>
            </f7-list-group>

            <f7-list-group>
              <f7-list-item>
                <f7-row>
                  <f7-col v-if="thisCourseMetadata.status === 'VALID'">
                    <f7-button color=red raised @click="deactivateCourseMetadata()">
                      Deactivate
                    </f7-button>
                  </f7-col>
                  <f7-col v-else>
                    <f7-button color=red raised @click="activateCourseMetadata()">
                      Activate
                    </f7-button>
                  </f7-col>
                  <f7-col>
                    <f7-button raised @click="updateCourseMetadata()">
                      Update
                    </f7-button>
                  </f7-col>
                </f7-row>
              </f7-list-item>
            </f7-list-group>
          </f7-list>

        </f7-block>
      </f7-page>
    </f7-popup>

    <!-- Slot -->
    <f7-popup :opened="popupAssign" @popup:close="popupAssign = false">
      <f7-page>
        <f7-navbar title="Assign a slot">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block>
        </f7-block>

      </f7-page>
    </f7-popup>
    
    <!-- Running courses -->
    <f7-block>
      <f7-block-title>
        Running courses for {{thisYear}}, {{thisSemester}}
      </f7-block-title>

      <f7-list media-list>
        <f7-list-item v-for="(course,key) in runningCourses" :key="key"
                      :link="'/updatecourse/'+course.id+'/'">
          <div slot="header">{{course.course_id}}, Slot {{course.slot}}, {{course.venue}}</div>
          <div slot="title">{{course.name}}</div>
          <div slot="footer">{{course.note}}</div>
        </f7-list-item>
      </f7-list>
    </f7-block>

    <!-- All courses -->
    <f7-block>

      <f7-block-title>
        All courses. Click on the list to do more.
        <f7-searchbar no-hairlines
                      search-container=".course-list"
                      search-in=".item-title, .item-text, .item-footer, .item-header">
        </f7-searchbar>
      </f7-block-title>

      <f7-list class="course-list" media-list>
        <f7-list-item v-for="(course,key) in metadata" 
                      :style="(course.status==='DEACTIVATED')?'background-color:red':''"
                      :text="course.name"
                      :key="key">

          <div slot="header">
            <f7-link @click="showCourseMetaData(course)" 
               color="blue"
               icon="fa fa-pencil fa-fw">
            </f7-link>
            {{course.id}}, Credit: {{course.credits}}

            <f7-button small color="gray" raised
              @click="assignSlot(course)" class="pull-right">
              Assign Slot
            </f7-button>
          </div>
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
      metadata: [],
      runningCourses: [],
      thisYear: moment().format('YYYY'),
      thisSemester: moment().month() <= 6?'Spring':'Autumn',
      openCoursePopup: false,
      popupMetadata: false,
      popupAssign: false,
      thisCourse: [],
      thisCourseMetadata: { 'instructors' : [] },
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
    self.fetchRunningCourse();
    self.fetchCourseMetadata();

    // Autocomplete
    // Autocomplete.
    app.autocomplete.create({
      inputEl : '#autocomplete-instructor',
      openIn: 'dropdown',
      valueProperty: 'email',
      textProperty: 'name',
      expandInput: true,
    
      source: function(q, render)
      {
        const autocomplete = this;
        var results = [];
    
        if(2 >= q.length || q.includes('@'))
        {
          render(results);
          return;
        }
    
        autocomplete.preloaderShow();

        self.promiseWithAuth('search/faculty/'+q)
          .then( function(x)  {
            var res = JSON.parse(x.data);
            res.map(function(e) {
              e.name = e.first_name + ' ' + e.last_name + ' (' + e.email + ')';
            });
            autocomplete.preloaderHide();
            render(res);
          });
      },
      on: {
        change: function(val) {
          console.log('Adding instructor', val);
          var i = 1;
          for(i = 1; i < 7; i++)
          {
            if(self.thisCourseMetadata['instructor_'+i])
              continue;
            console.log('Found empty instructor slot');
            self.thisCourseMetadata['instructor_'+i] = val[0].email;
            console.log(i, self.thisCourseMetadata['instructor_'+i]);
            break;
          }
          app.dialog.preloader();
          var cid = btoa(self.thisCourseMetadata.id);
          self.promiseWithAuth('course/metadata/update/'+cid, self.thisCourseMetadata)
            .then(function(x) {
              self.postWithPromise('course/metadata/get/'+cid)
                .then(function(x) {
                  self.thisCourseMetadata = JSON.parse(x.data).data;
                  app.dialog.close();
                });
            });
          setTimeout( () => app.dialog.close(), 1000);
        },
      },
    });

  },
  methods : {
    fetchRunningCourse: function() 
    {
      const self = this;
      self.postWithPromise('courses/running/'+self.thisYear+'/'+self.thisSemester)
        .then(function(x) {
          self.runningCourses = JSON.parse(x.data).data;
        });
    },
    fetchCourseMetadata: function()
    {
      const self = this;
      self.postWithPromise('courses/metadata')
        .then(function(x) {
          self.metadata = JSON.parse(x.data).data;
        });
    },
    showCourseMetaData: function(metadata) {
      console.log('Editing metadata');
      const self = this;
      self.thisCourseMetadata = metadata;
      self.popupMetadata = true;
    },
    removeInstructor: function(whichInstructor) {
      // Remove instructor from this course.
      const self = this;
      const app = self.$f7;

      var cid = btoa(self.thisCourseMetadata.id);
      app.dialog.preloader();
      self.thisCourseMetadata['instructor_'+whichInstructor] = '';
      self.promiseWithAuth('course/metadata/update/'+cid, self.thisCourseMetadata)
        .then(function(x) {
          self.postWithPromise('course/metadata/get/'+cid)
            .then(function(x) {
              self.thisCourseMetadata = JSON.parse(x.data).data;
              app.dialog.close();
            });
        });
      setTimeout( () => app.dialog.close(), 1000);
    },
    updateCourseMetadata: function() {
      const self = this;
      const app = self.$f7;
      var cid = btoa(self.thisCourseMetadata.id);
      app.dialog.preloader();
      self.promiseWithAuth('course/metadata/update/'+cid, self.thisCourseMetadata)
        .then(function(x) {
          self.postWithPromise('course/metadata/get/'+cid)
            .then(function(x) {
              self.thisCourseMetadata = JSON.parse(x.data).data;
              app.dialog.close();
            });
        });
      setTimeout( () => app.dialog.close(), 1000);
    },
    deactivateCourseMetadata: function() {
      const self = this;
      const app = self.$f7;
      var cid = btoa(self.thisCourseMetadata.id);
      app.dialog.confirm("Are you sure?", "Deactivating course."
        , function() {
          self.postWithPromise('course/metadata/deactivate/'+cid)
            .then( function(x) {
              self.popupMetadata = false;
              self.fetchCourseMetadata();
            });
        }, null);
    },
    activateCourseMetadata: function() {
      const self = this;
      const app = self.$f7;
      var cid = btoa(self.thisCourseMetadata.id);
      app.dialog.confirm("Are you sure?", "Activating course."
        , function() {
          self.postWithPromise('course/metadata/activate/'+cid)
            .then( function(x) {
              self.popupMetadata = false;
              self.fetchCourseMetadata();
            });
        }, null);
    },
    assignSlot: function(metadata) {
      const self = this;
      const app = self.$f7;
      self.thisCourseMetadata = metadata;
      self.popupAssign = true;
      console.log("Assinging slot");
    },
  },
}
</script>

