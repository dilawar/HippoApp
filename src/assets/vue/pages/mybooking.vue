<template>
  <f7-page>
  <f7-navbar title="My Bookings" back-link="Back">
  </f7-navbar>

  <f7-block v-if="Object.keys(requestGroups).length>0">
    <f7-block-title medium>
      <f7-icon icon="far fa-bell fa-fw"></f7-icon>
      Pending Requests.
    </f7-block-title>

    <f7-card v-for="(requests, gid, index) in requestGroups" :key="gid">
      <f7-card-content>
        <div>
          {{requests[0].title}} ({{requests.length}})
        </div>
        <br>

        <f7-list media-list>
          <f7-list-item v-for="(val, index) in requests" 
            :key="val.gid+'.'+val.rid" 
            :title="humanReadableDateTime(val.date,val.start_time)+' ('+val.venue+')'">
            <f7-button small raised color="red"
              tooltip="Delete this booking"
              icon="fa fa-trash fa-fw" slot="after"
              @click="deleteThisRequest(val.gid, val.rid)"> 
            </f7-button>
          </f7-list-item>
        </f7-list>
        <div>
          Public Event: {{requests[0].is_public_event}}
        </div>
      </f7-card-content>
      <f7-card-footer>
          <f7-button v-if="requests.length>1" color="red" raised small 
                     @click="deleteThisRequest(requests[0].gid)">
            Delete All
          </f7-button>
          <f7-button raised small icon="fa fa-pencil fa-1x"
                     @click="popupEditRequest(requests[0], true)">
            Edit All
          </f7-button>
      </f7-card-footer>
    </f7-card>

  </f7-block>
  <f7-block v-else>
    <f7-block-title small> No pending request found.  </f7-block-title>
  </f7-block>

  <!-- THESE ARE CONFIRMED EVENTS -->
  <f7-block v-if="Object.keys(eventGroups).length > 0">
    <f7-block-title medium>
      <f7-icon icon="far fa-calendar-check"></f7-icon>
      Confirmed bookings...
    </f7-block-title>

    <f7-list media-list no-hairlines>
      <f7-list-item accordion-item 
                    v-for="(events, gid, index) in eventGroups" 
                    :title="events[0].title"
                    :footer="events[0].venue" 
                    :key="gid">
        <div slot="header">{{events.length}} confirmed</div>
        <f7-accordion-content>
          <f7-block>
            <f7-list media-list no-hairlines>
              <!-- DELETE THE WHOLE GROUP -->
              <f7-list-item v-if="events.length > 1">
                <f7-row>
                  <f7-col>
                    <f7-button raised fill 
                      tooltip="Delete all bookings in this group"
                      color=red @click="deleteThisEvent(events[0].gid)"> 
                      Delete this group
                    </f7-button>
                  </f7-col>
                  <f7-col>
                    <f7-button raised
                      @click="popupEditEvent(events[0], true)">Edit Group</f7-button>
                  </f7-col>
                </f7-row>
              </f7-list-item>

              <!-- DELETE EACH ELEMENT -->
              <f7-list-item swipeout 
                            v-for="(val, index) in events" 
                            @swipeout:deleted="deleteThisEvent(val.gid, val.eid)"
                            :key="val.gid+'.'+val.eid" 
                            :title="humanReadableDateTime(val.date, val.start_time)">
                <f7-row slot="after">
                  <f7-col>
                    <f7-button @click="deleteThisEvent(val.gid,val.eid)" 
                               small raised
                               icon="fas fa-trash"
                               tooltip="Delete this booking"
                               color="red">
                    </f7-button>
                  </f7-col>
                  <f7-col>
                    <f7-button @click="popupEditEvent(val)" small raised
                               icon="far fa-edit"
                               tooltip="Edit this booking">
                    </f7-button>
                  </f7-col>
                </f7-row>
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-accordion-content>
      </f7-list-item>
      <f7-list-item></f7-list-item>
    </f7-list>
  </f7-block>


  <!-- MY TAKS -->
  <f7-block v-if="Object.keys(myTalks).length>0">
    <f7-block-title medium>
      <f7-icon icon="fa fa-user-o fa-fw"></f7-icon>
      My talks (total {{myTalks.length}})</f7-block-title>
    <f7-list media-list no-hairlines>
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
  <f7-popup :opened="popupEditBooking" @popup:close="popupEditBooking = false">
    <f7-page>
      <f7-navbar title="Update Booking(s)">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
  
      <f7-block>

        <f7-list media-list no-hairlines>

          <f7-list-input label="Class" 
                         :value="thisBooking.class"
                         type="select"
                         @input="thisBooking.class=$event.target.value">
            <option v-for="(cls, key) in classes" :key="cls" :value="cls">{{cls}}</option>
          </f7-list-input>

          <f7-list-input :value="thisBooking.title" 
                 type="textarea"
                 label="Title"
                 @input="thisBooking.title=$event.target.value">
          </f7-list-input>

          <f7-list-input :value="thisBooking.description" 
                 label="Description"
                 type="texteditor"
                 @input="thisBooking.description=$event.target.value">
          </f7-list-input>

          <f7-list-input label="VC URL" 
                         type="url"
                         validate
                         :value="thisBooking.vc_url"
                         @input="thisBooking.vc_url=$event.target.value">
          </f7-list-input>

          <f7-list-input label="Add to NCBS Calendar" 
                         :value="thisBooking.is_public_event"
                         type="select"
                         @input="thisBooking.is_public_event=$event.target.value">
            <option v-for="(opt, key) in ['YES', 'NO']" :key="key" :value="opt">
            {{opt}}
            </option>
          </f7-list-input>

          <f7-list-item>
            <f7-button slot="after" popup-close raised fill @click="updateBooking()"> 
              Update
            </f7-button>
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

      // events.
      thisBooking: {confirmed:false, title:'', description:'', 'vc_url':''},
      popupEditBooking: false,

      // Classes of events.
      classes: [],
      updateGroup: false,
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
    /**
     * Delete this event. When eid is empty, delete the whole group.
     */
    deleteThisEvent: function(gid, eid="") 
    {
      const self = this;
      const app = self.$f7;

      app.dialog.confirm("Deleting...", "Are you sure?", 
        function(val) {
          app.dialog.preloader();
          var link = 'mybooking/delete/event/'+gid+'.'+eid;
          self.promiseWithAuth(link)
            .then(function(x) {
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
                app.dialog.close();
              }
            });
        }, null);
      setTimeout(()=> app.dialog.close(), 5000);
    },
    /**
     * Delete this request. When rid is not set, delete the whole group.
     */
    deleteThisRequest: function(gid, rid='')
    {
      const self = this;
      const app = this.$f7;

      // When rid is empty, delete whole group.
      app.dialog.confirm("Really?", "Deleting", 
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
    popupEditEvent: function(ev, updateGroup) {
      const self = this;
      self.updateGroup = updateGroup;
      self.thisBooking = ev;
      self.thisBooking.confirmed = true;
      self.popupEditBooking = true;
    },
    popupEditRequest: function(request, updateGroup) {
      const self = this;
      self.thisBooking = request;
      self.thisBooking.confirmed = false;
      self.updateGroup = updateGroup;
      self.popupEditBooking = true;
    },
    updateBooking: function()
    {
      const self = this;

      if(self.updateGroup)
        self.thisBooking.eid = '';

      let endpoint = '';
      if(self.thisBooking.confirmed)
        endpoint = '/me/event/update/' + self.thisBooking.gid + '.' 
          + self.thisBooking.eid;
      else
        endpoint = '/me/request/update/' + self.thisBooking.gid + '.' 
          + self.thisBooking.rid;
      self.promiseWithAuth(endpoint, self.thisBooking).then(
        function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success)
            self.notify('Success', 'Updated successfully.');
          else
            self.notify('Failed', 'Could not update.');
        });
      self.fetchMyBooking();
    },
  },
};
</script>
