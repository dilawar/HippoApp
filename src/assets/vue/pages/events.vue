<template>
   <f7-page page-content 
            ptr @ptr:refresh="fetchEvents"
            infinite 
            :infinite-preloader="showPreloader"
            @infinite="loadMore"
            >

         <f7-navbar title="Public Calendar" back-link="Back"></f7-navbar>
         <f7-block-title> Total events {{events.length}} </f7-block-title>

         <f7-block v-if="showGoogleCalendar">
            <div class="google-calendar">
<iframe src="https://calendar.google.com/calendar/embed?showTitle=0&amp;showPrint=0&amp;showCalendars=0&amp;showTz=0&amp;mode=AGENDA&amp;;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=d2jud2r7bsj0i820k0f6j702qo%40group.calendar.google.com&amp;color=%236B3304&amp;ctz=Asia%2FKolkata"></iframe>
            </div>
         </f7-block>


         <!-- Filter by venue should be a floating button. -->
         <f7-fab position="right-top" slot="fixed" color="green" @click="actionGridOpened = true" text=""> 
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

import Vue from "vue";
import LightTimeline from 'vue-light-timeline';
Vue.use(LightTimeline);

export default {
   data() {
      return {
         showGoogleCalendar: true,
         events: [],
         eventTypes: [],
         startDate: moment(),
         showPreloader: true,
         allowInfinite: true,
         numEvents: 0,
         actionGridOpened: false,
         items: [],
      };
   }, 
   mounted: function() {
      const self = this;
      self.events = self.loadStore('pubevents');
      if(! self.events || self.events.length == 0)
         self.fetchEvents();
      self.generateTimeline(self.events);
   }, 
   methods: { 
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
      }, 
      fetchEvents: function() {
         const self = this;
         const app = self.$f7;
         app.dialog.preloader();
         self.postWithPromise('/publicevents/'+moment(self.startDate).format('X')+'/20')
            .then( function(x) {
               self.events = JSON.parse(x.data).data;
               self.saveStore('pubevents', self.events);
               app.dialog.close();
               app.ptr.done();
            });
         setTimeout( () => app.dialog.close(), 1000);
         self.generateTimeline(self.events);
      },
      loadMore: function() {
         console.log('Loading more');
         const self = this;
         const app = self.$f7;
         if(! self.allowInfinite) 
         {
            console.log( ' .... returning ');
            return;
         }

         self.allowInfinite = false;
         let link = "/publicevents/" + 
            moment(self.startDate).format('X')+"/10/"+self.events.length;
         self.postWithPromise(link).then(
            function(x) {
               try {
                  let events = JSON.parse(x.data).data;
                  self.events = self.events.concat(events);
                  self.saveStore('pubevents', self.events);
                  console.log( "Total events ", self.events.length);
               } catch(e) {  
                  // pass
                  console.log('Error', e);
               }
               self.allowInfinite = true;
               app.dialog.close();
            }
         );
      },
      generateTimeline: function( events )
      {
         if( ! events || events.length == 0 )
         {
            console.log( 'Error. No events' );
            return;
         }
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
                  + '<br />' + e.start_time 
            , htmlMode : true
            , color : self.stringToColour(e.class)
            , content: `<span style='color:black;'>${e.class}</span>` 
                       + `<span style='float:right;'>${e.venue}</span>`
                       + '<br/>' + e.title
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
