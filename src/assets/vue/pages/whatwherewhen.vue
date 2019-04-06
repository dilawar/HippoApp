<template>
  <f7-page page-content 
           @page:init="fetchEvents"
           infinite
           @infinite="loadMore"
           :infinite-preloader="showPreloader"
     >
  <f7-navbar title="What Where When" back-link="Back"></f7-navbar>

  <!-- Filter by venue should be a floating button. -->
  <f7-fab position="right-top" 
          slot="fixed"
          color="green"
          text=""
          >
          <f7-icon icon="fa fa-filter fa-2x"></f7-icon>
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

  <light-timeline v-model="items" :items='items'>
  </light-timeline>



  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
   data() {
      const self = this;
      return {
         allowInfinite: true,
         showPreloader: false,
         actionVenueGridOpen: false,
         actionTypeGridOpen: false,
         eventTypes: [],
         venues: [],
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
      // Format groups and events.
      console.log( 'Calling mount function' );
      self.items = [];

      // Get thisDay events.
      self.fetchEvents();

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
                        `<br/><span style="font-size:small;color:black;margin:-1rem">${ev.title} </span>` +
                        `<br/><span style="font-size:9px;color:green;margin:-1rem">${ev.created_by}</span>`

         };
      },
      eventsToTimeLine: function(events) 
      {
         const self = this;
         console.log( 'Drawing timeline' );
         self.items = [];
         for(var key in events)
         {
            var ev = events[key];
            if(moment(ev.date + ' ' + ev.start_time, 'YYYY-MM-DD HH:mm:ss') <= moment() )
               continue;
            self.items.push(self.eventToTimelinePoint(key, ev));
         }

         setTimeout( ()=> true, 100);
         if(self.items.length == 0)
            self.items.push({tag:'Nothing found.', content:'Pull to refresh!'});

      },
      fetchEvents: function() 
      {
         const self = this;
         const app = this.$f7;
         self.fetchAndStore( '/events/latest/100', 'events');
         self.eventsToTimeLine();
      },
      loadMore: function() {
         const self = this;
         const app = this.$f7;

         if(!self.allowInfinite) 
            return;
         self.allowInfinite = false;

         if(self.events.length >= 500) 
         {
            self.preloader = false;
            let alert = app.notification.create({
               title: 'Please stop!',
               text: "I won't fetch more items."
            }).open();
            setTimeout(()=> alert.close(), 2000);
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
                  self.events.push(...res.data);
                  self.filterTimeline(self.selectedVenue, self.selectedClass);
                  self.$localStorage.set('events', JSON.stringify(self.events));
               }
            }
         );
         setTimeout(() => {self.allowInfinite = true; }, 200);
         self.venues = [... new Set(self.events.map(x=>x.venue))];
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
         self.eventsToTimeLine(filteredEvents);
      },
   },
}; 

</script>
