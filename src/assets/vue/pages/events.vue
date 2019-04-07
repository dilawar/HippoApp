<template>
   <f7-page page-content 
             ptr infinite 
             :infinite-distance="50"
             :infinite-preloader="showPreloader"
             @infinite="loadMore"
             page-content
         >

          <f7-navbar title="Events" back-link="Back"></f7-navbar>

          <!-- Filter by venue should be a floating button. -->
          <f7-fab position="right-top" 
                  slot="fixed"
                  color="green"
                  @click="actionGridOpened = true"
                  text=""
                  >
               <f7-icon icon="fa fa-filter"></f7-icon>
          </f7-fab>

          <f7-actions :grid="true" :opened="actionGridOpened" @actions:closed="actionGridOpened = false">
             <f7-actions-group>
                <f7-actions-button v-for="v in eventTypes" :key="v" @click="filterTimeline(v)">
                   <span>{{v}}</span>
                </f7-actions-button>
             </f7-actions-group>
          </f7-actions>


          <light-timeline :items='items'>
             <template slot='tag' slot-scope='{ item }'>
                <span v-html="item.tag" ></span>
             </template>
          </light-timeline>

   </f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

export default {
   data() {
      return {
         events: [],
         eventTypes: [],
         startDate: moment(),
         showPreloader: true,
         allowInfinite: true,
         numEvents: 0,
         actionGridOpened: false,
         items: [],
      };
   }
   , mounted: function() {
      const self = this;
      self.postWithPromise('/publicevents/'+moment(self.startDate).format('X')+'/20')
         .then( function(json) {
            self.events = JSON.parse(json).data;
            self.saveStore('pubevents', self.events);
            self.generateTimeline(self.events);
         });
   }
   , methods: { 
      reformatDate: function(date){
         return moment(date, 'dddd, MMM DD, YYYY').format('ddd, MMM DD');
      }
      , assignColor: function(startDateTime, endDateTime) 
      {
         if(moment(startDateTime) < moment().add(7, 'd'))
            return 'purple';
         if(moment(startDateTime) <= moment().add(1, 'd'))
            return 'deeppurple';
         return '';
      }
      , loadMore: function( )
      {
         const self         = this;
         const app          = self.$f7;
         if(! self.allowInfinite) 
            return;

         self.allowInfinite = false;
         var numToFetch = self.events.length + 20;
         console.log('loading more ', numToFetch);
         let link = '/publicevents/'+moment(self.startDate).format('X') +'/'+numToFetch.toString()
         self.postWithPromise(link).then( 
            function(json) {
               self.events = JSON.parse(json).data;
               console.log( "got ", self.events.length );
               self.saveStore('pubevents', self.events);
               self.generateTimeline(self.events);
               return;
            }
         );
         self.allowInfinite = true;
      },
      generateTimeline: function( events )
      {
         const self = this;
         self.items = [];
         self.eventTypes = [... new Set(events.map(x=>x.class))];
         for(var k in events)
         {
            var e = events[k];
            self.items.push(self.eventToItem(e));
         }
      }
      , eventToItem: function(e) 
      {
         const self = this;
         return {
            tag : moment(e.date, 'dddd, MMM DD, YYYY').format('ddd MMM DD') 
                  + '<br />' + e.start_time + '<br />'
                  + `<span style='font-size:10px;'>${e.venue}</span>`
            , htmlMode : true
            , color : self.stringToColour(e.class)
            , content: `<span style='font-size:9px;color:black;'>${e.class}</span>` 
                        + '<br/>' + e.title
                        + '<br/>'
         };
      }
      , filterTimeline: function(vtype)
      {
         const self = this;
         console.log('Filtering for ' + vtype, self.events.length);
         self.items = [];
         for(var k in self.events)
         {
            var e = self.events[k];
            if(e.class == vtype )
               self.items.push(self.eventToItem(e));
         }
      }
   },
};

</script>
