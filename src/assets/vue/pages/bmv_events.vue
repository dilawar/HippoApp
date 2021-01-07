<template>
  <f7-page infinite @infinite="loadMore">
    <f7-navbar title="Confirmed Bookings" back-link="Back">
      <f7-subnavbar :inner="false">
        <f7-searchbar
          search-container=".event-list"
          search-in=".item-header, .item-title, .item-subtitle, .item-text, .item-footer">
        </f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <f7-block>

      <f7-block-header>
        <f7-list no-hairlines media-list>
          <f7-list-input :input="false">
            <v-autocomplete slot="input"
                            ref="refEventSpeaker"
                            input-class="form-control"
                            placeholder="Search for old bookings..."
                            results-property="gid"
                            :results-display="(res) => res.date + ', ' + res.title"
                            :request-headers="apiPostData()"
                            method="post"
                            @selected="onEventSelected"
                            @results="foundEvents"
                            :source="(q)=>searchEventURI(q)">
            </v-autocomplete>
          </f7-list-input>
          <template v-if="oldEvent !== null && oldEvent.gid">
            <f7-list-item :title="oldEvent.title"
                    :footer="'gid=' + oldEvent.gid + ', eid=' + oldEvent.eid"
                    :header="oldEvent.date + ', start time: ' + oldEvent.start_time + ', ' + oldEvent.venue">
              <f7-link slot="after" @click="deleteEvent(oldEvent, 'INVALID')">
                Delete
              </f7-link>
            </f7-list-item>
          </template>
        </f7-list>
      </f7-block-header>

      <f7-list media-list accordion-list class="event-list">
        <f7-list-item v-for="(event, key) in events" :key="key"
          accordion-item
          :class="event.is_public_event==='YES'?'bg-color-yellow':''"
          @click="openEventPopup(event)">
          <div slot="header">
            {{event.class}} 
            <span style="float:right">{{event.venue}}</span>
          </div>
          <div slot="title"> {{event.title}} </div>
          <div slot="text"> 
            {{event.date | date}} |
            {{event.start_time | clockTime}} to 
            {{event.end_time | clockTime }}
            (#Events {{event.total}})
          </div>
          <div slot="footer"> Created by {{event.created_by}} </div>
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
              <!--
              <f7-button close-popup 
                @click="toggleIsPublicEventGroup(thisEvent.gid)">
                Toggle <tt>PUBLIC EVENT</tt> group
              </f7-button>
              -->
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
                :style="(event.is_public_event==='YES')?'background-color:yellow':''"
              >
                <div slot="title">
                  {{event.date | date}}, 
                  {{event.start_time | clockTime}} to 
                  {{event.end_time | clockTime }}
                </div>
                <div slot="footer" v-if="event.is_public_event==='YES'">
                  Public Event
                </div>
                <div slot="footer" v-else>Private Event</div>
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
                    <f7-col width=30>
                      <f7-button small color="red"
                        @click="deleteEvent(event)">Delete</f7-button>
                    </f7-col>
                    <f7-col width=30>
                      <f7-button small @click=editEvent(event)>
                        Edit
                      </f7-button>
                    </f7-col>
                    <f7-col width=30>
                      <f7-button small 
                        @click="toggleIsPublicEvent(event)">
                        toggle Public Event
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
        oldEvent: {gid: '', eid:'', title:''},
        thisEvent: [],
        theseEvents: [],
        eventPopup: false,
        popupTitle: 'Review request',
        allowInfinite: true,
        rolesCSV: 'USER',
      };
    },
    mounted()
    {
      const self = this;
      self.fetchUpcomingEvents();
      self.fetchRoles();
    },
    methods : {
      refreshData: function( ) {
        const self = this;
      },
      editEvent: function(ev) {
        const self = this;
        self.eventPopup = false;
        self.$f7router.navigate("/event/edit/"+ev.gid+"/"+ev.eid);
      },
      fetchUpcomingEvents: function() 
      {
        const self = this;
        self.promiseWithAuth('bmvadmin/events/upcoming/0/100').then(
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
        var to = from + 20;
        console.log("Fetching from ", from, " to ", to );
        self.promiseWithAuth('bmvadmin/events/upcoming/'+from+'/'+to).then(
          function(x) {
            var moreE = JSON.parse(x.data).data;
            if(moreE.length == 0) {
              self.allowInfinite = false;
              app.toast.create({ text: "No new data returned from server"}).open();
            }
            else {
              for(var o in moreE)
                self.events.push(moreE[o]);
              self.allowInfinite = true;
            }
          });
      },
      openEventPopup: function(event) 
      {
        const self = this;
        const app = self.$f7;
        app.preloader.show();
        self.thisEvent = event;
        // Fetch all events for this gid.
        self.promiseWithAuth('bmvadmin/events/gid/'+event.gid)
          .then( function(x) {
            self.theseEvents = JSON.parse(x.data).data;
            app.preloader.hide();
            self.eventPopup = true;
          });
        setTimeout(() => app.preloader.hide(), 10000);
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
        app.preloader.show();
        self.promiseWithAuth('bmvadmin/event/update', event)
          .then( function(x) {
            // Fetch this group events.
            self.promiseWithAuth('bmvadmin/events/gid/'+event.gid)
              .then( function(x) {
                self.theseEvents = JSON.parse(x.data).data;
                app.dialog.close();
              });
          });
        setTimeout(()=>app.preloader.hide(), 1000);
      },
      deleteEvent: function(event, st='CANCELLED') 
      {
        const self = this;
        const app = self.$f7;

        console.log('Deleting event: ', event);
        event['status'] = st;
        self.updateEvent(event);
      },
      fetchRoles: function() {
        const self = this;
        self.promiseWithAuth('me/roles').then( function(x) {
          let res = JSON.parse(x.data).data;
          self.rolesCSV = res.roles;
        });
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
      foundEvents: function() {
        console.log("Found events.");
      },
      onEventSelected: function(ev) {
        const self = this;
        self.oldEvent = ev.selectedObject;
        console.log("Selected event", self.oldEvent);
      },
    },
  }
</script>
