<template>
   <f7-page infinite @infinite="loadMore">
      <f7-navbar title="Events" back-link="Back">
      </f7-navbar>

      <f7-block v-if="getRoles().includes('BOOKMYVENUE_ADMIN')">
        <f7-list no-hairlines media-list accordion-list>
          <f7-list-item v-for="(event, key) in events" :key="key"
                        accordion-item
                        :bg-color="(event.is_public_event=='YES')?'yellow':''"
                        @click="openEventPopup(event)"
                        >
            <div slot="header"> Created by {{event.created_by}} </div>
            <div slot="title"> {{event.title}} </div>
            <div slot="text"> 
              {{event.date | date}} |
              {{event.start_time | clockTime}} to 
              {{event.end_time | clockTime }}
              (#Events {{event.total}})
            </div>
            <div slot="subtitle"> {{event.class}} @{{event.venue}} </div>
          </f7-list-item>
        </f7-list>
      </f7-block>

      <!-- POPUP -->
      <!-- Review POPUP -->
      <f7-popup :opened="eventPopup" @popup:close="eventPopup = false">
        <f7-page>
          <f7-navbar title="Update Event(s)">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>
          <f7-block>
            <!-- POPUP ACTION -->
            <f7-card>
              <f7-card-content>
                <strong> {{thisEvent.venue}} </strong>
                <br />
                {{thisEvent.title}} 
                <div style="font-size:small">Created by
                  {{thisEvent.created_by}} 
                </div>
                <small>
                  <div v-html="thisEvent.description"></div>
                </small>
              </f7-card-content>
              <f7-card-footer>
                <f7-col>
                  <f7-button close-popup
                    color="red" @click="deleteGroup(thisEvent.gid)">
                    Delete Group
                  </f7-button>
                </f7-col>
                  <f7-button close-popup 
                    @click="toggleIsPublicEventGroup(thisEvent.gid)">
                    Toggle PUBLIC EVENT group
                  </f7-button>
              </f7-card-footer>
            </f7-card>

            <!-- If on mobile apps -->
            <f7-block>
              <div v-if="isMobileApp()">
                Swipe left to mark/unmark <tt>PUBLIC EVENT</tt>.
                Swipe right to <strong>CANCEL</strong> the event.
              </div>
              <f7-list inset media-list>
                <f7-list-item v-for="(event, key) in theseEvents" :key="key"
                              swipeout
                              @swipeout:delete="deleteEvent(event)"
                              >
                  <div slot="text">
                    {{event.date | date}}, 
                    {{event.start_time | clockTime}} to 
                    {{event.end_time | clockTime }}
                  </div>
                  <div slot="footer" v-if="event.is_public_event==='YES'">
                    PUBLIC EVENT
                  </div>
                  <div v-if="isMobileApp()"> <!-- MOBILE -->
                    <f7-swipeout-actions right>
                      <f7-swipeout-button delete 
                                          confirm-text="Are you sure to cancel this event"
                                          >
                                          Cancel
                      </f7-swipeout-button>
                    </f7-swipeout-actions>
                    <f7-swipeout-actions left>
                      <f7-swipeout-button v-if="event.is_public_event==='NO'"
                                          @click="toggleIsPublicEvent(event)"
                                          >
                                          Mark PUBLIC Event
                      </f7-swipeout-button>
                        <f7-swipeout-button v-else 
                                            @click="toggleIsPublicEvent(event)"
                                            >
                                            Mark NON-PUBLIC Event
                        </f7-swipeout-button>
                    </f7-swipeout-actions>
                  </div>
                  <div slot="footer" v-else> <!-- BROWSER -->
                    <f7-row>
                      <f7-col>
                        <f7-button small raised color="red"
                          @click="deleteEvent(event)">Delete</f7-button>
                      </f7-col>
                      <f7-col>
                          <f7-button small raised
                                     @click="toggleIsPublicEvent(event)">
                            toggle PUBLIC EVENT
                          </f7-button>
                      </f7-col>
                    </f7-row>
                  </div>
                </f7-list-item>
              </f7-list>
            </f7-block>

          </f7-block>
        </f7-page>
      </f7-popup>

   </f7-page>
</template>

<script>
  export default {
    data() {
      const self = this;
      return {
        eventsGrouped: [],
        events: [],
        thisEvent: [],
        theseEvents: [],
        eventPopup: false,
        popupTitle: 'Review request',
        allowInfinite: true,
      };
    },
    mounted()
    {
      const self = this;
      self.fetchUpcomingEvents();
    },
    methods : {
      refreshData: function( ) {
        const self = this;
      },
      fetchUpcomingEvents: function() 
      {
        const self = this;
        self.promiseWithAuth('bmvadmin/events/upcoming/0/10').then(
          function(x) {
            self.events = JSON.parse(x.data).data;
          });
      },
      loadMore: function()
      {
        const self = this;
        if(! self.allowInfinite)
          return;

        self.allowInfinite = false;

        const app = self.$f7;
        var from = Object.keys(self.events).length;
        var to = from + 10;
        console.log("Fetching from ", from, " to ", to );
        self.promiseWithAuth('bmvadmin/events/upcoming/'+from+'/'+to).then(
          function(x) {
            var moreE = JSON.parse(x.data).data;
            for(var o in moreE)
              self.events.push(moreE[o]);
            self.allowInfinite = true;
          });
      },
      openEventPopup: function(event) 
      {
        const self = this;
        self.thisEvent = event;
        // Fetch all events for this gid.
        self.promiseWithAuth('bmvadmin/events/gid/'+event.gid)
          .then( function(x) {
            self.theseEvents = JSON.parse(x.data).data;
            self.eventPopup = true;
          });
      },
      selectEvent: function(e)
      {
        const self = this;
      },
      toggleIsPublicEvent: function(event) 
      {
        const self = this;
        event.is_public_event = (event.is_public_event==='YES')?'NO':'YES';
        self.updateEvent(event);
      },
      updateEvent: function(event) 
      {
        const self = this;
        const app = self.$f7;
        app.dialog.preloader();
        self.promiseWithAuth('bmvadmin/event/update', event)
          .then( function(x) {
            // Fetch this group events.
            self.promiseWithAuth('bmvadmin/events/gid/'+event.gid)
              .then( function(x) {
                self.theseEvents = JSON.parse(x.data).data;
                app.dialog.close();
              });
          });
        setTimeout(()=>app.dialog.close(), 1000);
      },
      deleteEvent: function(event) 
      {
        const self = this;
        console.log('Deleting event: ', event);
        event['status'] = 'CANCELLED';
        self.updateEvent(event);
      },
      deleteGroup: function(gid) 
      {
        const self = this;
        const app = self.$f7;
        console.log('Deleting event: group ', gid);
        app.dialog.prompt("Reason...", "Cancelling whole group..."
          , function(value) {
            self.promiseWithAuth('bmvadmin/events/cancel/'+gid, {reason:value})
              .then(function(x){
                self.eventPopup = false;
                console.log('Cancelled group');
                self.fetchUpcomingEvents();
              });
          }, '');
      },
    },
  }
</script>
