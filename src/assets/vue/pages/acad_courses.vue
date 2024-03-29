<template>
  <f7-page>
    <f7-navbar title="Courses" back-link="Back">
    </f7-navbar>

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
            <f7-list-input label="ID" 
              inline-label
              :value="thisCourseMetadata.id"
              @change="thisCourseMetadata.id=$event.target.value">
            </f7-list-input>

            <f7-list-input label="Name"
              inline-label
              :value="thisCourseMetadata.name"
              @change="thisCourseMetadata.name=$event.target.value">
            </f7-list-input>

            <f7-list-input label="Credit"
              inline-label
              :value="thisCourseMetadata.credits"
              type="number" 
              min="0"
              validate
              @change="thisCourseMetadata.credits=$event.target.value">
            </f7-list-input>

            <f7-list-input label="Description"
              float-label
              type="texteditor"
              :value="thisCourseMetadata.description"
              @texteditor:change="(value)=>thisCourseMetadata.description=value">
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
                  <f7-col v-if="thisCourseMetadata.status === 'VALID' && ! thisCourseMetadata.is_new">
                    <f7-button color=red raised @click="deactivateCourseMetadata()">
                      Deactivate
                    </f7-button>
                  </f7-col>
                  <f7-col v-if="thisCourseMetadata.status !== 'VALID' && ! thisCourseMetadata.is_new">
                    <f7-button color=red raised @click="activateCourseMetaata()">
                      Activate
                    </f7-button>
                  </f7-col>
                  <f7-col>
                    <f7-button raised 
                      @click="thisCourseMetadata.is_new?addNewCourseMetadata():updateCourseMetadata()"
                      v-if="'OK' === thisCourseMetadataStatus">
                      Submit Course
                    </f7-button>
                    <f7-button raised disabled v-else>
                      {{thisCourseMetadataStatus}}
                    </f7-button>
                  </f7-col>
                </f7-row>
              </f7-list-item>
              <f7-list-item>
                <f7-row v-if="thisCourseMetadata.id && !  thisCourseMetadata.is_new">
                  <f7-col>
                    <f7-button icon="fa fa-danger" small raised fill
                      @click="deleteThisCourseMetadata()"
                      color=red>
                      Delete This course
                    </f7-button>
                  </f7-col>
                  <f7-col></f7-col>
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
            inline-label type="select"
            :value="thisCourse.slot"
            @input="thisCourse.slot=$event.target.value">
            <option>Please select a slot...</option>
            <option v-for="(slot, key) in slots" :key="key" :value="key">
              {{key}}, {{slot.html}}
            </option>
            <option key="XXX" value="NONE">No Slot</option>
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
                <!-- If already assigned then we are updating. else we are adding.  -->
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
    <f7-block inset>
      <f7-list>
        <f7-row style="list-style-type:none">
          <f7-list-input @change="fetchRunningCourses()" 
              class="col-50"
              @input="thisYear=$event.target.value"
              label="Year" type="number" :value="thisYear">
          </f7-list-input>
          <f7-list-input @change="fetchRunningCourses()" 
               class="col-50" @input="thisSemester=$event.target.value"
               label="Semester" type="select" :value="thisSemester">
            <option value="AUTUMN">Autumn</option>
            <option value="SPRING">Spring</option>
            <option value="OTHER">Other</option>
          </f7-list-input>
        </f7-row>
      </f7-list>
    </f7-block>

    <f7-block-title>
      Running courses in {{thisYear}}/{{thisSemester}}
    </f7-block-title>
    <f7-block-header>
      <f7-row>
        <f7-button small 
                   class="col-50 medium-30"
                   :href="'/coursefeedback/'+thisYear+'/'+thisSemester+'/'"
                   tooltip="Combined feedback for whole semester">
          Semester Feedback
        </f7-button>
        <f7-button small class="col-50 medium-30" @click="downloadCourseCSV">
          Download Course list
        </f7-button>
      </f7-row>
      Click on the course entry below to update, see registrations and 
      see the course specific feedback.
    </f7-block-header>

    <!-- list view -->
    <f7-list accordion-list>
      <f7-list-item v-for="course, key in runningCourses" :key="key" accordion-item>
        <div slot="header">
          {{course.venue}}  
          | {{humanReadableDate(course.start_date)}} 
          to {{humanReadableDate(course.end_date)}} 
          | {{course.course_id}}
        </div>
        <div slot="after">{{course.slot}}</div>
        <div slot="title"> {{course.name}} </div>
        <div slot="footer" class="text-color-red"> {{course.note}} </div>
        <f7-accordion-content>
          <f7-block inset style="background-color:Ivory;padding:5px">
            <div>
              Max Registrations: 
              {{course.max_registration===-1?'No limit':course.max_registration}}
            </div> 
            <div>
              Audit Allowed? {{course.is_audit_allowed}}
            </div>
            <f7-row>
              <f7-col>
                <f7-link v-if="course.url" external target="_system" :href="course.url">{{course.url}}</f7-link>
              </f7-col>
            </f7-row>
            <f7-row>
              <f7-col width=50 medium=30 style="padding-top:5px">
                <f7-button raised
                  :href="'/coursefeedback/'+course.year+'/'+course.semester+'/'+course.course_id+'/'"
                  icon="far fa-comment-dots">
                  {{course.numfeedback}} Feedbacks
                </f7-button>
              </f7-col>
              <f7-col width=50 medium=30 style="padding-top:5px">
                <f7-button raised 
                  :href="'/updatecourse/'+course.id+'/'" icon="fa fa-users">
                  Registrations
                </f7-button>
              </f7-col>
              <f7-col width=50 medium=30 style="padding-top:5px">
                <f7-button raised @click="showCurrentCourse(course)" icon="fa fa-edit">
                  Edit
                </f7-button>
              </f7-col>
            </f7-row>
          </f7-block>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>


<!-- All courses -->
<f7-block strong>
  <f7-block-title medium> 
    All Courses 
    <div style="font-size:small" class="float-right">
      <f7-button fill small @click="addNewCourseMetadataPopup()">
        Add New Course
      </f7-button>
    </div>
  </f7-block-title>

  <f7-block-header>
    <f7-searchbar no-hairlines
      search-container=".course-list"
      search-in=".item-title, .item-text, .item-footer, .item-header">
    </f7-searchbar>
  </f7-block-header>

  <f7-list class="course-list" media-list>
    <f7-row style="list-style-type:none">
      <f7-list-item v-for="(course,key) in metadata" 
        class="col-100 medium-50"
        :style="(course.status==='DEACTIVATED')?'background-color:red':''"
        :header="course.name"
        :key="key">
        <f7-link @click="showCourseMetaData(course)" 
          color="blue" icon="fas fa-edit" slot="title">
          {{course.id}}, Credit: {{course.credits}}
        </f7-link>
        <f7-button small raised slot="after"
          :disabled="isARunningCourse(course.id)"
          @click="scheduleCourse(course)">
          Schedule
        </f7-button>
      </f7-list-item>
    </f7-row>
  </f7-list>
</f7-block>

  </f7-page>
</template>

<script>

import moment from 'moment';
import Vue from 'vue';

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
      thisYear: '',
      thisSemester: '',
      openCoursePopup: false,
      popupMetadata: false,
      popupCurrentCourse: false,
      popupAssignSlot: false,
      thisCourse : { 'name':''
        ,'course_id':'', 'id' : ''
        , 'start_date': null
        , 'end_date': null
        , 'venue':''
        , 'slot':''
        , 'allow_deregistration_until':null
        , 'ignore_tiles': ''
        , 'is_audit_allowed': 'YES', 'max_registration': -1
        , 'is_new' : true
        , 'note':'', 'url':''},
      thisCourseStatus: 'UNKNOWN',
      thisCourseMetadata: {'id':''
        , 'name':'', 'credits':'0', 'description': ''
        , 'instructor_1':'', 'instructor_2':'', 'instructor_3':''
        , 'instructor_4':'', 'instructor_5':'', 'instructor_6':''
        , 'instructor_extras':'', 'comment':'', 'is_new':true
        , 'instructors' : []},
      thisCourseMetadataStatus: 'UNKNOWN',
      venues: {},
    };
  },
  watch : {
    'thisCourse': {
      handler : function(val, oldval) {
        const self = this;
        const app = self.$f7;
        var keys = ['start_date', 'end_date'];
        for(const key of keys) {
          if(! val[key]) {
            // console.log(key, val[key]);
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

          // Don't compare NONE slot.
          if(self.thisCourse.slot === 'NONE')
            break;

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
    'thisCourseMetadata': {
      handler : function(val, oldval) {
        const self = this;
        const app = self.$f7;
        var keys = ['id', 'name', 'credits'];
        for(const key of keys) {
          if(! val[key]) {
            self.thisCourseMetadataStatus =  key + ' is not assigned';
            return true;
          }
        }
        self.thisCourseMetadataStatus = 'OK';
        return true;
      },
      deep: true
    },
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;

    self.thisYear = self.thisYear || moment().format('YYYY');
    self.thisSemester = self.thisSemester ||  moment().month() <= 6?'SPRING':'AUTUMN';

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

            // Use Vue.set of vue can detect the change.
            Vue.set(self.thisCourseMetadata, 'instructor_'+i, val[0].email);
            console.log(i, self.thisCourseMetadata['instructor_'+i]);
            break;
          }
        },
      },
    });

  },
  methods : {
    fetchRunningCourses: function() 
    {
      const self = this;
      const app = self.$f7;

      app.preloader.show();
      self.postWithPromise('courses/list/'+self.thisYear+'/'+self.thisSemester)
        .then(function(x) {
          self.runningCourses = JSON.parse(x.data).data;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 3000);
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
      self.thisCourseMetadata['is_new']=false;
      self.popupMetadata = true;
    },
    addNewCourseMetadataPopup: function() {
      const self = this;
      self.thisCourseMetadata['is_new'] = true;
      for(var key of ['id', 'name', 'credits'])
        self.thisCourseMetadata[key] = '';
      self.popupMetadata = true;
    },
    removeInstructor: function(whichInstructor) {
      // Remove instructor from this course.
      const self = this;
      const app = self.$f7;
      //var cid = btoa(self.thisCourseMetadata.id);
      //app.dialog.preloader();
      self.thisCourseMetadata['instructor_'+whichInstructor] = '';
    },
    addNewCourseMetadata: function() {
      const self = this;
      const app = self.$f7;
      var cid = btoa(self.thisCourseMetadata.id);
      app.dialog.preloader();
      self.promiseWithAuth('course/metadata/add', self.thisCourseMetadata)
        .then(function(x) {
          self.fetchCourseMetadata();
          app.dialog.close();
        });
      self.popupMetadata = false;
      setTimeout( () => app.dialog.close(), 1000);
    },
    updateCourseMetadata: function() {
      const self = this;
      const app = self.$f7;
      var cid = btoa(self.thisCourseMetadata.id);
      app.dialog.preloader();
      self.promiseWithAuth('course/metadata/update', self.thisCourseMetadata)
        .then(function(x) {
          self.postWithPromise('course/metadata/get/'+cid)
            .then(function(x) {
              self.thisCourseMetadata = JSON.parse(x.data).data;
              app.dialog.close();
            });
        });
      self.popupMetadata = false;
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
    deleteThisCourseMetadata: function() {
      const self = this;
      const app = self.$f7;
      var cid = btoa(self.thisCourseMetadata.id);
      app.dialog.confirm("Are you sure?", "Deleting course."
        , function() {
          self.postWithPromise('course/metadata/delete/'+cid)
            .then( function(x) {
              self.popupMetadata = false;
              self.fetchCourseMetadata();
            });
        }, null);
    },
    isValidCourseMetadata: function() {
      const self = this;
      const app = self.$f7;
      return true;

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
      self.promiseWithAuth('course/running/update', self.thisCourse)
        .then( function(x) {
          var res = JSON.parse(x.data).data;
          self.fetchRunningCourses();
          navigator.notification.alert(res.msg, null, "Updated course");
        });
      self.popupCurrentCourse = false;
    },
    addRunningCourse: function() {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('course/running/add', self.thisCourse)
        .then( function(x) {
          var res = JSON.parse(x.data).data;
          self.fetchRunningCourses();
          navigator.notification.alert(res.msg, null, "Added new course");
        });
      self.popupCurrentCourse = false;
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
    downloadCourseCSV: function() {
      const self = this;
      let filename = 'courses_'+ self.thisYear + '_' + self.thisSemester + '.csv';
      self.writeCSVFile(filename, self.runningCourses);
    }
  },
}
</script>

