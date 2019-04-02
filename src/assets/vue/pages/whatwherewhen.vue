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
          @click="actionGridOpened = true"
          text=""
          >
          <f7-icon icon="fa fa-filter"></f7-icon>
  </f7-fab>

  <!-- Grid -->
  <f7-actions :grid="true" :opened="actionGridOpened" @actions:closed="actionGridOpened = false">
     <f7-actions-group>
        <f7-actions-button v-for="v in venues" :key="v" @click="showTimeline(v)">
           <span>{{v}}</span>
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
         actionGridOpened: false,
         venues: [],
         selectedVenue: 'ALL',
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
      var alreayAddedGroups = [];
      for(var key in self.events)
      {
         const ev = self.events[key];
         if(! alreayAddedGroups.includes(ev.venue))
         {
            self.venues.push(ev.venue);
            alreayAddedGroups.push(ev.venue);
         }
      }
      self.venues.push('ALL');
      self.eventsToTimeLine(self.events);
   },
   methods: { 
      eventToTimelinePoint: function(key, ev) 
      {
         const self = this;
         var color = self.stringToColour(ev.class)
         return {id:key, class:ev.class
            , color : color
            , group: ev.venue
            , tag: self.humanReadableDate(ev.date) + 
                  '\n' + self.str2Moment(ev.start_time,'HH:mm:ss').format('HH:mm A') +
                  '\n' + self.str2Moment(ev.end_time,'HH:mm:ss').format('HH:mm A')
            , htmlMode: true
            , content:  `<span style="font-size:x-small">` + 
                        `${ev.class} <strong>${ev.venue}</strong></span>`+
                        `<br/> ${ev.title}` +
                        `<br/><span style="font-size:x-small">${ev.created_by}</span>`

         };
      },
      eventsToTimeLine: function(events) {
         const self = this;
         self.items = [];
         for(var key in events)
         {
            var ev = events[key];
            if(self.selectedVenue != 'ALL' && ev.venue != self.selectedVenue)
               continue;
            if( moment(ev.date + ' ' + ev.start_time, 'YYYY-MM-DD HH:mm:ss') < moment.now())
               continue;
            self.items.push(self.eventToTimelinePoint(key, ev));
         }
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
                  self.eventsToTimeLine(self.events);
                  self.$localStorage.set('events', JSON.stringify(self.events));
                  console.log( 'Total ', self.events.length);
               }
            });
         setTimeout( () => {self.allowInfinite = true; }, 1000);
         return;
      },
      showTimeline: function(venue) 
      {
         const self = this;
         const app = self.$f7;
         self.selectedVenue = venue;
         var venueEvents = self.events.filter(x => {
            if(venue==self.selectedVenue)
               return true;
            else
               return x.venue == self.selectedVenue;
         });
         self.eventsToTimeLine(venueEvents);
      },
   },
}; 

</script>
