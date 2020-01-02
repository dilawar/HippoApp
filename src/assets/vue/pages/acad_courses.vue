<template>
  <f7-page>

    <f7-navbar title="Courses" back-link="Back">
    </f7-navbar>

    <!-- Select year/semester here -->
    <f7-list>
      <f7-list-item>
        <f7-row>
          <f7-col>
            <f7-list-input @change="fetchRunningCourses()" 
                               @input="thisYear=$event.target.value"
                               label="Select Year"
                               type="number" 
                               :value="thisYear">
            </f7-list-input>
          </f7-col>
          <f7-col>
            <f7-list-input @change="fetchRunningCourses()" 
                                 @input="thisSemester=$event.target.value"
                                 label="Select Semester" 
                                 type="select" 
                                 :value="thisSemester">
              <option value="AUTUMN">Autumn</option>
              <option value="SPRING">Spring</option>
            </f7-list-input>
          </f7-col>
        </f7-row>
      </f7-list-item>
    </f7-list>

    <!-- POPUP: Handle course information.  -->
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

    <!-- POPUP: Manage running courses. -->
    <f7-popup :opened="popupCurrentCourse" @popup:close="popupCurrentCourse=false">
      <f7-page>
        <f7-navbar title="Update running courses">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block-title>
          {{thisCourse.name}} <br /> {{thisCourse.id}}
        </f7-block-title>

        <f7-list media-list no-hairlines>
          <f7-list-input label="Slot" 
                         inline-label
                         type="select"
                         :value="thisCourse.slot"
                         @input="thisCourse.slot=$event.target.value">
            <option v-for="(slot, key) in slots" :key="key" :value="key">
            {{key}}, {{slot.html}}
            </option>
          </f7-list-input>

          <f7-list-input label="Ignore Tiles"
                         inline-label
                         type="text" 
                         @change="thisCourse.ignore_tiles=$event.target.value"
                         :value="thisCourse.ignore_tiles">
          </f7-list-input>

          <f7-list-input label="Venue" 
                         inline-label
                         type="select" 
                         v-model="thisCourse.venue"
                         @input="thisCourse.venue=$event.target.value">
            <option v-for="(venue, key) in venues" 
                    name="venue" 
                    :key="key" 
                    :value="venue.id">
            {{venue.id}}
            </option>
          </f7-list-input>

          <f7-list-input label="Start Date"
                         inline-label
                         type="date" 
                         @input="thisCourse.start_date=$event.target.value"
                         :value="thisCourse.start_date">
          </f7-list-input>

          <f7-list-input label="End Date"
                         inline-label
                         type="date" 
                         @input="thisCourse.end_date=$event.target.value"
                         :value="thisCourse.end_date">
          </f7-list-input>

          <f7-list-input label="Allow Dropping until?"
                         inline-label
                         type="date" 
                         @change="thisCourse.allow_deregistration_until=$event.target.value"
                         :value="thisCourse.allow_deregistration_until">
          </f7-list-input>

          <f7-list-input label="Is AUDIT allowed?"
                         inline-label
                         type="select" 
                         @change="thisCourse.is_audit_allowed=$event.target.value"
                         v-model="thisCourse.is_audit_allowed">
            <option value="YES">Yes</option>
            <option value="No">No</option>
          </f7-list-input>

          <f7-list-input label="Max registrations?"
                         inline-label
                         type="number" 
                         @input="thisCourse.max_registration=$event.target.value"
                         v-model="thisCourse.max_registration">
          </f7-list-input>

          <f7-list-input label="url"
                         inline-label
                         type="url" 
                         @change="thisCourse.url=$event.target.value"
                         :value="thisCourse.url">
          </f7-list-input>

          <f7-list-input label="Note"
                         inline-label
                         type="textarea" 
                         @change="thisCourse.note=$event.target.value"
                         :value="thisCourse.note">
          </f7-list-input>

          <f7-list-item v-if="thisCourseStatus === 'OK'">
            <f7-row>
              <f7-col>
                <f7-button raised fill @click="removeRunningCourse()" color="red">
                  Remove This Course
                </f7-button>
              </f7-col>
              <f7-col>
                <!-- If already assigned then we are updating. else we are
                  adding. 
                -->
                <f7-button raised @click="addRunningCourse()" v-if="thisCourse.is_new">
                  Add To Running Courses
                </f7-button>
                <f7-button raised @click="updateRunningCourse()" v-else>
                  Update Running Course
                </f7-button>
              </f7-col>
            </f7-row>
          </f7-list-item>
          <f7-list-button v-else>
            <f7-button raised disabled> {{thisCourseStatus}} </f7-button>
          </f7-list-button>

        </f7-list>

      </f7-page>
    </f7-popup>

    <!-- Assign popup slot -->
    <f7-popup :opened="popupAssignSlot" @popup:close="popupAssignSlot=false">
      <f7-page>
        <f7-navbar title="Assign slot/venue">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block-title small>
          Assigning slot and venue: <br />
          {{thisCourse.name}} ({{thisCourse.id}}).
        </f7-block-title>

        <f7-block>
          <f7-list media-list no-hairlines>
            <f7-list-input label="Available Slots"
                           @input="checkVenueSlot(thisVenue, $event.target.value)"
                           :value="thisSlot"
                           type="select">
              <option v-for="(slot, key) in slots" :key="key" :value="key">
              {{key}}
              </option>
            </f7-list-input>
            <f7-list-input label="Available Venues" 
                           @input="checkVenueSlot($event.target.value, thisSlot)"
                           :value="thisVenue"
                           type="select">
              <option v-for="(venue, key) in venues" :key="key" :value="venue.id">
              {{venue.id}}
              </option>
            </f7-list-input>
            <f7-button raised 
                       v-if="thisSlotVenueStatus === 'OK'"
                       @click="assignSlotVenue()">
              Assign
            </f7-button>
            <f7-button small v-else disabled>{{thisSlotVenueStatus}}</f7-button>
          </f7-list>



        </f7-block>

      </f7-page>
    </f7-popup>
    
    <!-- Running courses -->
    <f7-block>
      <f7-block-title>
        Running courses for {{thisYear}}/{{thisSemester}}.
      </f7-block-title>

      <f7-card v-for="(course,key) in runningCourses" :key="key"
               :padding="false">
        <f7-card-content>
          <div>({{course.course_id}}) {{course.name}}
          <span class="pull-right">
            <strong>{{course.venue}}</strong>
            slot {{course.slot}}, {{course.ignore_tiles}}
          </span>
          </div>

          <div class="text-small">
            {{course.start_date | date}} to {{course.end_date | date}}
          </div>

          <div style="font-size:small;margin:5px;padding:10px;">
            <f7-row>
              <f7-col>Max Registrations: {{course.max_registration}}</f7-col>
              <f7-col>Is Audit Allowed?: {{course.is_audit_allowed}}</f7-col>
            </f7-row>
            <f7-row>
              <f7-col>URL: {{course.url}}</f7-col>
            </f7-row>
          </div>

          <div class="bg-color-lightblue">
            <small>{{course.note}}</small>
          </div>

          <f7-row class="text-align-center" style="padding:0;padding-top:10px">
            <f7-col>
              <f7-link :href="'/updatecourse/'+course.id+'/'">
                Manage Registrations
              </f7-link>
            </f7-col>
            <f7-col>
              <f7-link @click="showCurrentCourse(course)">
                Edit
              </f7-link>
            </f7-col>
          </f7-row>
        </f7-card-content>

      </f7-card>


    </f7-block>

    <!-- All courses -->
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
          <f7-button small 
                     raised
                     :disabled="isARunningCourse(course.id)"
                     @click="scheduleCourse(course)" 
                     class="pull-right">
            Schedule
          </f7-button>
        </div>
      </f7-list-item>
      <f7-list-item></f7-list-item>
    </f7-list>


  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
  data() {
    const self = this;
    return {
      thisSlot: '',
      thisVenue:  '',
      thisSlotVenueStatus: '',
      metadata: [],
      slots: [],
      runningCourses: [],
      thisYear: moment().format('YYYY'),
      thisSemester: moment().month() <= 6?'SPRING':'AUTUMN',
      openCoursePopup: false,
      popupMetadata: false,
      popupCurrentCourse: false,
      popupAssignSlot: false,
      thisCourse : { 'name':''
        ,'course_id':'', 'id' : ''
        , 'start_date':'', 'end_date':'', 'venue':''
        , 'slot':'', 'allow_deregistration_until':''
        , 'ignore_tiles': ''
        , 'is_audit_allowed': 'YES', 'max_registration': -1
        , 'is_new' : true
        , 'note':'', 'url':''},
      thisCourseStatus: 'UNKNOWN',
      thisCourseMetadata: { 'instructors' : [] },
      venues: {},
    };
  },
  watch : {
    'thisCourse': {
      handler : function(val, oldval) {
        const self = this;
        const app = self.$f7;
        var keys = ['slot', 'venue', 'start_date', 'end_date'];
        for(const key of keys) {
          if(! val[key]) {
            console.log(key, val[key]);
            self.thisCourseStatus =  key + ' is not assigned';
            return true;
          }
        }

        // Allright, now check if slot, venue is available for given dates.
        for(var key of Object.keys(self.runningCourses)) {
          var course = self.runningCourses[key];

          // Ignore the self.
          if(course.id === self.thisCourse.id)
            continue;

          if(parseInt(course.slot) === parseInt(self.thisCourse.slot) 
            && course.venue === self.thisCourse.venue)
          {
            self.thisCourseStatus = course.name + " is running on this slot/venue";
            return true;
          }
        }
        self.thisCourseStatus =  "OK";
        return true;
      },
      deep: true
    },
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
    self.fetchRunningCourses();
    self.fetchCourseMetadata();

    // Venues.
    self.postWithPromise('venue/list/course')
      .then( function(x) {
        self.venues = JSON.parse(x.data).data;
      });

    // Slots.
    self.postWithPromise('/course/slot/all')
      .then( function(x) {
        self.slots = JSON.parse(x.data).data;
      });

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
    fetchRunningCourses: function() 
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
    showCurrentCourse: function(course) {
      const self = this;
      const app = self.$f7;

      // Deep copy because we gonna compare with every runningCourse after changing it.
      self.thisCourse = JSON.parse(JSON.stringify(course));
      self.thisCourse.is_new = false;   // Updating existing course.
      self.popupCurrentCourse = true;
    },
    updateRunningCourse: function() {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader();
      console.log('thisCourse : ', self.thisCourse);

      self.promiseWithAuth('course/running/update', self.thisCourse)
        .then( function(x) {
          var res = JSON.parse(x.data).data;
          self.fetchRunningCourses();
          app.dialog.alert(res.msg, "Running course", null);
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 1000);
    },
    addRunningCourse: function() {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader();
      console.log('thisCourse : ', self.thisCourse);

      self.promiseWithAuth('course/running/add', self.thisCourse)
        .then( function(x) {
          var res = JSON.parse(x.data).data;
          self.fetchRunningCourses();
          app.dialog.alert(res.msg, "Running course", null);
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 1000);
    },
    removeRunningCourse: function() {
      const self = this;
      const app = self.$f7;
      app.dialog.confirm("Are you sure? All registrations will be lost?"
        , "Removing course?"
        , function() {
          self.promiseWithAuth('course/running/remove', self.thisCourse)
            .then( function(x) {
              var res = JSON.parse(x.data).data;
              app.dialog.alert(res.msg, "Course removed.", null);
              app.dialog.preloader();
              self.fetchRunningCourses();
              app.dialog.close();
            });
            setTimeout(() => app.dialog.close(), 1000);
            self.popupCurrentCourse = false;
        }, null);
    },
    scheduleCourse: function(course) {
      const self = this;
      const app = self.$f7;
      self.thisCourse = {...self.thisCourse, ...{ 'name': course.name
        , 'course_id' : course.id
        , 'id' : course.id + '-' + self.thisSemester + '-' + self.thisYear
        , 'venue' : self.thisVenue
        , 'slot' : self.thisSlot
        , 'is_new': true     // its is being added to table first time.
      }};
      self.popupCurrentCourse = true;
      self.checkVenueSlot(self.thisCourse.venue, self.thisCourse.slot);
    },
    checkVenueSlot: function(venue, slot) {
      const self = this;
      const app = self.$f7;
      self.thisVenue = venue;
      self.thisSlot = slot;
      if( ! (self.thisVenue && self.thisSlot))
      {
        self.thisSlotVenueStatus = "Select both venue/slot."
        return;
      }

      // Now check venue and slotashmirathi1
      self.thisSlotVenueStatus = "OK";

      for(var key of Object.keys(self.runningCourses)) {
        var course = self.runningCourses[key];
        console.log('x', course.slot, course.venue, self.thisSlot, self.thisVenue);
        console.log('y', course.slot == self.thisSlot, course.venue == self.thisVenue);
        if(parseInt(course.slot) === parseInt(self.thisSlot) && course.venue === self.thisVenue)
        {
          self.thisSlotVenueStatus = course.name + " is running on this slot/venue";
          break;
        }
      }
    },
    isARunningCourse: function(id) {
      const self = this;
      for(var key of Object.keys(self.runningCourses)) {
        if(id === self.runningCourses[key].course_id)
          return true;
      }
      return false;
    },
  },
}
</script>

