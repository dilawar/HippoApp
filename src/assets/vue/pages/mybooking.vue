<template>
  <f7-page>
  <f7-navbar title="My Bookings" back-link="Back">
  </f7-navbar>

  <f7-block v-if="Object.keys(requestGroups).length>0">
    <f7-block-title>
      <f7-icon icon="fa fa-bell-o fa-2x"></f7-icon>
      Pending booking requests...
    </f7-block-title>

    <f7-list media-list>
      <f7-list-item accordion-item
                    v-for="(requests, gid, index) in requestGroups" 
                    :title="requests[0].title"
                    :key="gid"
                    :header="requests[0].venue">
        <font slot="header" color="blue">{{requests.length}} pending</font>
        <f7-accordion-content>
          <f7-block inset style="background-color:lightyellow">
            <div>{{requests[0].title}}</div>

            <f7-list media-list margin="10px">

              <f7-list-item v-if="requests.length > 1">
                <f7-button color="red"
                           fill small 
                           @click="deleteThisRequest(requests[0].gid)"
                           raised>
                  Delete whole group
                </f7-button>
              </f7-list-item>

              <f7-list-item swipeout
                            @swipeout:deleted="deleteThisRequest(val.gid, val.rid)"
                            v-for="(val, index) in requests" 
                            :key="val.gid+'.'+val.rid" 
                            :title="humanReadableDateTime(val.date,val.start_time)+' ('+val.venue+')'">

                <!-- SWIPEOUT IF IT IS AN MOBILE APP. ELSE USE BUTTON -->
                <f7-swipeout-actions right v-if="isMobileApp()">
                  <f7-swipeout-button delete>Delete</f7-swipeout-button>
                </f7-swipeout-actions>

                <f7-button v-else 
                           small raised 
                           color="red"
                           fill slot="after"
                                @click="deleteThisRequest(val.gid, val.rid)"> 
                  Delete
                </f7-button>
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>
  </f7-block>
  <f7-block v-else>
    <f7-block-title small> No pending request found.  </f7-block-title>
  </f7-block>

  <!-- THESE ARE CONFIRMED EVENTS -->
  <f7-block v-if="Object.keys(eventGroups).length > 0">
    <f7-block-title>
      <f7-icon icon="fa fa-thumbs-up-o fa-2x"></f7-icon>
      Confirmed bookings...
    </f7-block-title>
    <f7-list media-list>
      <f7-list-item accordion-item 
                    v-for="(events, gid, index) in eventGroups" 
                    :title="events[0].title"
                    :footer="events[0].venue" 
                    @click="popupEditGroupEvent(events[0])"
                    :key="gid">
        <div slot="header">{{events.length}} confirmed</div>
        <f7-accordion-content>
          <f7-list media-list>
            <!-- DELETE THE WHOLE GROUP -->
            <f7-list-item v-if="events.length > 1">
              <f7-button raised> Delete whole group </f7-button>
            </f7-list-item>

            <!-- DELETE EACH ELEMENT -->
            <f7-list-item swipeout 
                          v-for="(val, index) in events" 
                          @swipeout:deleted="deleteEvent(val.gid, val.eid)"
                          :key="val.gid+'.'+val.eid" 
                          :title="humanReadableDateTime(val.date, val.start_time)">
              <f7-icon slot="media" icon="fa fa-check-circle"></f7-icon>

              <!-- ON MOBILE -->
              <f7-swipeout-actions right v-if="isMobileApp()">
                <f7-swipeout-button delete
                                    color="blue"
                                    title="Deleting request?" 
                                    confirm-text="Cancel booking?">
                  Cancel
                </f7-swipeout-button>
              </f7-swipeout-actions>

              <!-- ELSE -->
              <f7-button @click="deleteEvent(val.gid, val.eid)"
                                    color="red" fill
                                    slot="after"
                                    small>
                Delete
              </f7-button>
            </f7-list-item>
          </f7-list>
        </f7-accordion-content>
      </f7-list-item>
      <f7-list-item></f7-list-item>
    </f7-list>
  </f7-block>


  <!-- MY TAKS -->
  <f7-block v-if="Object.keys(myTalks).length>0">
    <f7-block-title>
      <f7-icon icon="fa fa-chalkboard-teacher fa-2x"></f7-icon>
      My talks (total {{myTalks.length}})</f7-block-title>
    <f7-list media-list>
      <f7-list-item v-for="(talk, key) in myTalks"
                    :key="key"
                    @click="$f7router.navigate('/updatetalk/'+talk.id+'/')">
        <div slot="title">{{talk.class}} by {{talk.speaker}}</div>
        <div slot="text">{{talk.title}}</div>

        <!-- If talk is scheduled, show the information -->
        <div slot="header" v-if="talk.booking_status !== 'UNSCHEDULED'">
          {{talk.booking.date | date}}, {{talk.booking.start_time|clockTime}}
            , {{talk.booking.venue}}
        </div>
        <!-- else show the it is not scheduled. -->
        <div slot="header" v-else>{{talk.booking_status}}</div>
        <div slot="footer">Created {{toNow(talk.created_on)}} ago</div>
      </f7-list-item>
      <f7-list-item></f7-list-item>
    </f7-list>
  </f7-block>

  <!-- POPUPS -->
  <!-- POPUP  -->
  <f7-popup :opened="popupEvent" @popup:close="popupEvent = false">
    <f7-page>
      <f7-navbar title="Update event(s)">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
  
      <f7-block>

        <f7-list media-list>

          <f7-list-input label="Class" 
                         :value="thisEvent.class"
                         type="select"
                         @input="thisEvent.class=$event.target.value">
            <option v-for="(cls, key) in classes" :key="cls" :value="cls">{{cls}}</option>
          </f7-list-input>

          <f7-list-input :value="thisEvent.title" 
                 type="textarea"
                 label="Title"
                 @input="thisEvent.title=$event.target.value">
          </f7-list-input>

          <f7-list-input :value="thisEvent.description" 
                 label="Description"
                 type="texteditor"
                 @input="thisEvent.description=$event.target.value">
          </f7-list-input>

          <f7-list-input label="Add to NCBS Calendar" 
                         :value="thisEvent.is_public_event"
                         type="select"
                         @input="thisEvent.is_public_event=$event.target.value">
            <option v-for="(opt, key) in ['YES', 'NO']" :key="key" :value="opt">
              {{opt}}
            </option>
          </f7-list-input>

          <f7-list-item>
            <f7-button slot="after"popup-close raised @click="updateEvent()">Update</f7-button>
          </f7-list-item>
        </f7-list>
      </f7-block>
    </f7-page>
  </f7-popup>
</f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
  data() {
    return {
      requestGroups: [],
      eventGroups: [],
      myTalks: [],
      startDate: moment(),
      endDate: '',

      // This talk and associated popup.
      thisTalk: [],

      // events.
      thisEvent: {},
      popupEvent: false,

      // Classes of events.
      classes: [],
    };
  },
  mounted: function() {
    const self = this;
    self.fetchMyBooking();
    self.fetchMyTalks();

    self.promiseWithAuth('info/bmv/bookingclasses')
      .then( function(x) {
        self.classes = JSON.parse(x.data).data.all;
      });
  },
  methods: { 
    fetchMyTalks: function()
    {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader('Fetching your talks...');
      self.promiseWithAuth('me/talk/all')
        .then( function(x) {
          self.myTalks = JSON.parse(x.data).data;
          app.dialog.close();
        });
      setTimeout(()=>app.dialog.close(), 3000);
    },
    fetchMyBooking: function(data) 
    {
      const self         = this;
      const app          = self.$f7;
      self.isOpen        = false;

      var groupBy = function(xs, key) 
      {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };

      var link = '/mybooking/list/'+moment(self.startDate).format('X');
      app.dialog.preloader('Fetching your bookings...');
      self.promiseWithAuth(link)
        .then( function(x) {
          var res = JSON.parse(x.data);
          self.requestGroups = res.data.requests;
          self.eventGroups = res.data.events;
          app.dialog.close();
        }
      );
      setTimeout(()=>app.dialog.close(), 10000);
    },
    refreshMyBooking: function(event, done) 
    {
      console.log("Refreshing booking request.");
      const self = this;
      setTimeout(() => {
        self.fetchMyBooking();
        done();
      }, 3000);
    },
    deleteEvent: function(gid, eid) 
    {
      const self = this;
      const app = self.$f7;
      var link = 'mybooking/delete/event/'+gid+'.'+eid;
      console.log('Link is', link);
      self.promiseWithAuth(link)
        .then( function(x) {
          var res = JSON.parse(x.data);
          if( res.status == 'ok')
          {
            app.notification.create( {
              title: "Deleted",
              subtitle: res.data[0],
              closeButton: true,
              closeOnClick: true,
              closeTimeout: 3000,
            }).open();
            self.fetchMyBooking();
          }
        }
      );
    },
    deleteThisRequest: function(gid, rid='')
    {
      const self = this;
      const app = this.$f7;
      // When rid is empty, delete whole group.
      console.log( "Deleting ", gid, rid );
      app.dialog.confirm( "Really?", "Deleting", 
        function(val) {
          var link = 'mybooking/delete/request/'+gid+'.'+rid;
          self.promiseWithAuth(link).then( 
            function(x) {
              var res = JSON.parse(x.data);
              if(res.status == 'ok')
              {
                app.notification.create( {
                  title: "Deleted",
                  subtitle: res.data[0],
                  closeButton: true,
                  closeOnClick: true,
                  closeTimeout: 3000,
                }).open();
                self.fetchMyBooking();
              }
              else
                app.notification.create( {
                  title: "Failed to delete",
                  subtitle: res.msg,
                  closeButton: true,
                  closeOnClick: true,
                  closeTimeout: 10000,
                }).open();
            });
        }, null);
    },
    editThisRequest: function(gid, rid) {
      const self = this;
      const app = self.$f7;
      app.notification.create( {
        title: "Not implemented yet",
        closeTimeout: 3000,
        closeOnClick: true,
        closeButton: true,
      }).open();
    },
    popupEditGroupEvent: function(event) {
      const self = this;
      self.thisEvent = event;
      self.popupEvent = true;
    },
    updateEvent: function()
    {
      const self = this;
      self.promiseWithAuth('/me/event/update', self.thisTalk).then(
        function(x) {
          let res = JSON.parse(x.data);
          console.log('Done');
        });
    }
  },
};
</script>
