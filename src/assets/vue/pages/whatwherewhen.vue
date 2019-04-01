<template>
  <f7-page page-content
           infinite 
           :infinite-distance="50"
           :infinite-preloader="showPreloader"
           @infinite="loadMore"
     >
  <f7-navbar title="What Where When" back-link="Back"></f7-navbar>

  <!-- Venues at side buttons -->
  <f7-block>
     <f7-button raised 
                label="ellow"
                @click="actionGridOpened = true"
                >Filter by Venue</f7-button>
     </f7-button>
  </f7-block>

  <!-- Grid -->
  <f7-actions :grid="true" :opened="actionGridOpened" @actions:closed="actionGridOpened = false">
     <f7-actions-group v-for="i in 1+Math.floor(venues.length/3)" :key="'r'+i">
        <f7-actions-button v-for="v in venues.slice(3*i,3*(i+1))"
                           :key="v"
                           @click="showTimeline(v)">
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
         events: JSON.parse(self.$localStorage.get('events', '[{}]')),
         venueEvents: [],
         items: [],
         options: {
            editable: false,
         },
      }
   },
   mounted: function() {
      const self = this;
      const app = this.$f7;
      // Get thisDay events.
      if(self.events.length == 0)
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
         self.items.push(self.eventToTimelinePoint(key, ev));
      };
   },
   methods: { 
      eventToTimelinePoint: function(key, ev) 
      {
         const self = this;
         return {id:key, class:ev.class
            , color: self.stringToColour(ev.class)
            , group: ev.venue
            , tag: self.humanReadableDate(ev.date) + 
                  '\n' + self.str2Moment(ev.start_time,'HH:mm:ss').format('HH:mm A') +
                  '\n' + self.str2Moment(ev.end_time,'HH:mm:ss').format('HH:mm A')
            , htmlMode: true
            , content: `${ev.title} <br /> <small>${ev.venue}</small>` 
         };
      },
      eventsToTimeLine: function(events) {
         const self = this;
         self.items = [];
         for(var key in events)
         {
            var ev = events[key];
            self.items.push(self.eventToTimelinePoint(key, ev));
         }
      },
      fetchEventsOnThisDay: function() 
      {
         const self = this;
         const app = this.$f7;
         app.request.post(self.$store.state.api+'/events/latest/100'
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

         if(self.events.length >= 500) {
            self.showPreloader = false;
            return;
         }
         app.request.post(self.$store.state.api+'/events/latest/' 
            + (self.events.length+20).toString() + '/' + self.events.length.toString()
            , self.apiPostData()
            , function(json) 
            {
               const res = JSON.parse(json);
               console.log( 'fetched ', res.data.length);
               if(res.status=='ok')
               {
                  self.events.push(...res.data);
                  self.$localStorage.set('events', JSON.stringify(self.events));
               }
            }
         );
         self.allowInfinite = true;
      },
      showTimeline: function(venue) 
      {
         const self = this;
         const app = self.$f7;
         var venueEvents = self.events.filter(x=> x.venue==venue);
         self.eventsToTimeLine(venueEvents);
      },
   },
}; 

</script>
