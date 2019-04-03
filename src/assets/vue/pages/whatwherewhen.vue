<template>
  <f7-page page-content
           infinite
           :infinite-preloader="showPreloader"
           @infinite="loadMore"
     >
  <f7-navbar title="What Where When" back-link="Back"></f7-navbar>

  <!-- Filter by venue should be a floating button. -->
  <f7-fab position="right-top" 
          slot="fixed"
          color="green"
          text=""
          >
          <f7-icon icon="fa fa-plus fa-2x"></f7-icon>
          <f7-icon icon="fa fa-close fa-2x"></f7-icon>
          <f7-fab-buttons position="bottom">
             <f7-fab-button @click="actionVenueGridOpen=true"><small>Venue</small></f7-fab-button>
             <f7-fab-button @click="actionTypeGridOpen=true"><small>Type</small></f7-fab-button>
          </f7-fab-buttons>
  </f7-fab>

  <!-- Grid -->
  <f7-actions :grid="true" :opened="actionVenueGridOpen" @actions:closed="actionVenueGridOpen = false">
     <f7-actions-group>
        <f7-actions-button v-for="v in venues" :key="v" @click="filterTimeline(v, '')">
           <span>{{v}}</span>
        </f7-actions-button>
     </f7-actions-group>
  </f7-actions>

  <!-- Venue grid -->
  <f7-actions :grid="true" :opened="actionTypeGridOpen" @actions:closed="actionTypeGridOpen = false">
     <f7-actions-group>
        <f7-actions-button v-for="t in eventTypes" :key="t" @click="filterTimeline('', t)">
           <span>{{t}}</span>
        </f7-actions-button>
     </f7-actions-group>
  </f7-actions>

  <f7-block v-model="items">
     <light-timeline :items='items'>
     </light-timeline>
  </f7-block>



  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
   data() {
      const self = this;
      return {
         allowInfinite: true,
         showPreloader: true,
         actionVenueGridOpen: false,
         actionTypeGridOpen: false,
         eventTypes: ['ALL'],
         venues: ['ALL'],
         selectedVenue: 'ALL',
         selectedClass: 'ALL',
         events: JSON.parse(self.$localStorage.get('events', '[]')),
         venueEvents: [],
         items: [],
      }
   },
   mounted: function() {
      const self = this;
      const app = this.$f7;
      console.log('mounting');

      // Get thisDay events.
      console.log( "Fetching 100 events" );
      self.fetchEventsOnThisDay();

      // Format groups and events.
      self.items = [];

      // Two loops but its OK since I don't know better.
      self.eventTypes = [... new Set( self.events.map(x=>x.class))];
      self.eventTypes.push('ALL');
      self.venues = [... new Set(self.events.map(x=>x.venue))];
      self.venues.push('ALL');
      self.eventsToTimeLine(self.events);
   },
   methods: { 
      eventToTimelinePoint: function(key, ev) 
      {
         const self = this;
         var color = self.stringToColour(ev.class)
         return { id:key
            , class:ev.class
            , color : color
            , group: ev.venue
            , tag: self.humanReadableDate(ev.date) + 
                  '\n' + self.str2Moment(ev.start_time,'HH:mm:ss').format('HH:mm A') +
                  '\n' + self.str2Moment(ev.end_time,'HH:mm:ss').format('HH:mm A')
            , htmlMode: true
            , content:  `<span style="font-size:10px;color:green;margin-left:-1rem">${ev.venue}</span> `+
                        `<span style="font-size:8px;color:gray;">${ev.class}</span>`+
                        `<br/><span style="font-size:small;color:black;margin:1px">${ev.title} </span>` +
                        `<br/><span style="font-size:9px;color:green;margin:0px">${ev.created_by}</span>`

         };
      },
      eventsToTimeLine: function(events) {
         const self = this;
         self.items = [];
         for(var key in events)
         {
            var ev = events[key];
            if( moment(ev.date + ' ' + ev.start_time, 'YYYY-MM-DD HH:mm:ss') <= moment() )
               continue;
            self.items.push(self.eventToTimelinePoint(key, ev));
         }
         if(self.items.length == 0)
            self.items.push({tag:'', content:'Nothing found'});
      },
      fetchEventsOnThisDay: function() 
      {
         const self = this;
         const app = this.$f7;
         app.request.post(self.$store.state.api+'/events/latest/30'
            , self.apiPostData()
            , function(json) 
            {
               const res = JSON.parse(json);
               if(res.status=='ok')
               {
                  self.events = res.data;
                  self.venueEvents = self.events;
                  self.$localStorage.set('events', JSON.stringify(res.data));
                  return;
               }
            }
         );
      },
      loadMore: function() {
         const self = this;
         const app = this.$f7;

         if(!self.allowInfinite) 
            return;
         self.allowInfinite = false;

         if(self.events.length >= 200) 
         {
            self.preloader = false;
            const alert = app.notification.create({
               title: 'Please stop!',
               text: "I won't fetch more items."
            }).open();
            setTimeout(()=> alert.close(), 1000);
            return;
         }

         // now fetch 20 more starting from offset.
         app.request.post(self.$store.state.api+'/events/latest/20'+'/'+self.events.length.toString()
            , self.apiPostData()
            , function(json) 
            {
               const res = JSON.parse(json);
               if(res.status=='ok')
               {
                  console.log( 'fetched ', res.data.length);
                  self.events.push(...res.data);
                  // Update self.items so that we can refresh the page.
                  self.filterTimeline(self.selectedVenue, self.selectedClass);
                  self.$localStorage.set('events', JSON.stringify(self.events));
                  console.log( 'Total ', self.events.length);
               }
            });
         setTimeout( () => {self.allowInfinite = true; }, 1000);
         return;
      },
      filterTimeline: function(venue, cls) 
      {
         const self = this;
         const app = self.$f7;

         // Preserve the previous venue, cls because they will be reset on
         // ptr, refresh or infinite events.
         self.selectedVenue = venue;
         self.selectedClass = cls;
         console.log( 'Filter using '+venue+ ' and '+cls);
         var filteredEvents = self.events.filter(x => {
            if(venue)
               return (venue=='ALL' || x.venue==self.selectedVenue)
            else if(cls)
               return (cls=='ALL' || x.class==self.selectedClass)
            else
               return true;
            }
         );
         console.log('Events found after filter: ', filteredEvents.length);
         self.eventsToTimeLine(filteredEvents);
      },
   },
}; 

</script>