<template>
   <f7-page @page:init="refreshData" @page:refresh="refreshData">
      <f7-navbar title="Events" back-link="Back">
      </f7-navbar>

      <f7-block v-if="getRoles().includes('BOOKMYVENUE_ADMIN')">
        <f7-list no-hairlines media-list accordion-list>
          <f7-list-item v-for="(events, key) in Object.values(eventsGrouped)" :key="key"
                        accordion-item
                        :bg-color="(events[0].is_public_event=='YES')?'yellow':''"
                        >
            <div slot="header"> Created by {{events[0].created_by}} </div>
            <div slot="text"> {{events[0].title}} </div>
            <div slot="footer"> 
              {{events[0].date | date}} |
              {{events[0].start_time | clockTime}} to 
              {{events[0].end_time | clockTime }}
              (#Events {{events.length}})
            </div>
            <div slot="title"> {{events[0].class}} @{{events[0].venue}} </div>
            <div slot="after">
              <f7-link @click="openEventPopup(events)">Update</f7-link>
            </div>
            <!--
            <f7-accordion-content>
              <f7-list no-hairlines v-if="events.length > 1">
                <f7-list-item v-for="(event, key) in events" :key="key">
                  <div slot="header">
                    {{events[0].date | date}} |
                    {{events[0].start_time | clockTime}} to 
                    {{events[0].end_time | clockTime }}
                  </div>
                </f7-list-item>
              </f7-list>
            </f7-accordion-content>
            -->
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
            </f7-card>

            <f7-block>
              <div>Swipe left to mark/unmark <tt>PUBLIC EVENT</tt>.
                Swipe right to <strong>CANCEL</strong> the event.
              </div>
              <f7-list inset>
                <f7-list-item v-for="(event, key) in theseEvents" :key="key"
                              swipeout
                              @swipeout:delete="deleteEvent(event)"
                              >
                  <div slot="title">
                    {{event.date | date}}, 
                    {{event.start_time | clockTime}} to 
                    {{event.end_time | clockTime }}
                  </div>
                  <div slot="footer" v-if="event.is_public_event==='YES'">
                    PUBLIC EVENT
                  </div>
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
        thisEvent: [],
        theseEvents: [],
        eventPopup: false,
        popupTitle: 'Review request',
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
        self.promiseWithAuth('bmvadmin/events/upcoming').then(
          function(json) {
            self.eventsGrouped = JSON.parse(json).data;
          });
      },
      openEventPopup: function(events) 
      {
        const self = this;
        self.theseEvents = events;
        self.thisEvent = events[0];
        self.eventPopup = true;
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
          .then( function(json) {
            // Fetch this group events.
            self.promiseWithAuth('bmvadmin/events/gid/'+event.gid)
              .then( function(json) {
                self.theseEvents = JSON.parse(json).data;
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
    },
  }
</script>
