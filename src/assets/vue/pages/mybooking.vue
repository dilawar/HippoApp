<template>
  <f7-page ptr @ptr:refresh="refreshMyBooking" 
           @page:init="fetchMyBooking"
           @page:refresh="fetchMyBooking">
           

  <f7-navbar title="My Bookings" back-link="Back"></f7-navbar>
  <f7-block-title></f7-block-title>

     <f7-list media-list>
       <f7-list-item accordion-item
                     v-for="(requests, gid, index) in requestGroups" 
                     :title="requests[0].title"
                     :key="gid"
                     :header="requests[0].venue">
         <font slot="after" color="blue">{{requests.length}} pending</font>
         <f7-accordion-content>
           <f7-list media-list inset>
             <f7-list-item swipeout
                           @swipeout:deleted="deleteThisRequest(val.gid, val.rid)"
                           v-for="(val, index) in requests" 
                           :key="val.gid+'.'+val.rid" 
                           :title="humanReadableDateTime(val.date,val.start_time)+' ('+val.venue+')'">

               <!-- SWIPEOUT IF IT IS AN MOBILE APP. ELSE USE BUTTON -->
               <f7-swipeout-actions right v-if="isMobileApp()">
                 <f7-swipeout-button delete>Delete</f7-swipeout-button>
               </f7-swipeout-actions>

               <f7-button v-else small raised color="red" fill slot="after"
                           @click="deleteThisRequest(val.gid, val.rid)"> 
                 Delete
               </f7-button>
             </f7-list-item>
           </f7-list>
         </f7-accordion-content>
       </f7-list-item>

        <f7-list-item accordion-item 
                      v-for="(events, gid, index) in eventGroups" 
                      :title="events[0].title"
                      :footer="events[0].venue" 
                      :key="gid">
           <div slot="after">{{events.length}} confirmed</div>
           <f7-accordion-content>
              <f7-list media-list>
              <f7-list-item swipeout 
                            v-for="(val, index) in events" 
                            @swipeout:deleted="deleteEvent(val.gid, val.eid)"
                            :key="val.gid+'.'+val.eid" 
                            :title="humanReadableDateTime(val.date, val.start_time)"
                            footer="Swipe ← to cancel">
                <f7-icon slot="media" icon="fa fa-check-circle"></f7-icon>
                <f7-swipeout-actions right>
                  <f7-swipeout-button delete
                                      color="blue"
                                      title="Deleting request?" 
                                      confirm-text="Cancel booking?"
                                      >Cancel
                  </f7-swipeout-button>
                </f7-swipeout-actions>
              </f7-list-item>
           </f7-list>
                      </f7-accordion-content>
        </f7-list-item>
     </f7-list>

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
      startDate: moment(),
      endDate: '',
    };
  },
  mounted: function() {
    const self = this;
    self.fetchMyBooking();
  },
  methods: { 
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
      self.promiseWithAuth(link)
        .then( function(x) {
          var res = JSON.parse(x.data);
          self.requestGroups = res.data.requests;
          self.eventGroups = res.data.events;
        }
      );
    },
    refreshMyBooking: function(event, done) 
    {
      console.log("Refreshing booking request.");
      const self = this;
      setTimeout(() => {
        self.fetchMyBooking();
        done();
      }, 1000);
    },
    deleteEvent: function(gid, eid) 
    {
      console.log("Deleting event: ", gid, eid );
      const self = this;
      const app = self.$f7;
      var link = self.$store.state.api+'/mybooking/delete/event/'+gid+'.'+eid;
      console.log('Link is', link);
      app.request.post(link, this.apiPostData(), 
        function(json) {
          var res = JSON.parse(json);
          console.log(res);
          if( res.status == 'ok')
          {
            app.notification.create( {
              title: "Deleted",
              subtitle: res.data[0],
              closeButton: true,
              closeOnClick: true,
              closeTimeout: 3000,
            }).open();
            return;
          }
        }
      );
    },
    deleteThisRequest: function(gid, rid)
    {
      const self = this;
      const app = this.$f7;
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
  },
};
</script>
