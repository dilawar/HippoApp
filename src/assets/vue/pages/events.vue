<template>
   <f7-page page-content 
             ptr infinite 
             @page:init="fetchEvents"
             :infinite-distance="50"
             :infinite-preloader="showPreloader"
             @infinite="fetchMoreEvents"
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
          </light-timeline>

          <!--
          <f7-block>
             <f7-list accordion-list>
             <f7-list-item 
             accordion-item
             v-for="(val, index) in events" 
             :key="index"
             :header="reformatDate(val.date)+', '+val.start_time+' | '+val.venue"
             :footer="val.title"
             >
             <f7-accordion-content>
             <f7-block margin=30>
             <small><span v-html="val.description"></span></small>
             </f7-block>
             </f7-accordion-content>
             </f7-list-item>
             </f7-list>
             </f7-block>
          -->

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
   , computed: { }
   , mounted() {
      const self         = this;
      const app          = self.$f7;
      var link = self.$store.state.api+'/publicevents/'+moment(self.startDate).format('X')+'/20';
      app.request.post(link, this.apiPostData(),
         function(json) {
            var res = JSON.parse(json);
            self.events = res.data;
            self.generateTimeline();
         }
      );
      return;
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
      , fetchEvents: function() 
      {
         const self         = this;
         const app          = self.$f7;
         var link = self.$store.state.api+'/publicevents/'+moment(self.startDate).format('X')+'/20';
         app.request.post(link, this.apiPostData(),
            function(json) {
               var res = JSON.parse(json);
               self.events = res.data;
               self.generateTimeline();
            }
         );
         return;
      }
      , fetchMoreEvents: function( )
      {
         const self         = this;
         const app          = self.$f7;
         if( ! self.allowInfinite ) return;

         self.allowInfinite = false;

         var numToFetch = self.events.length + 10;
         var link = self.$store.state.api+'/publicevents/'+moment(self.startDate).format('X') 
            +'/'+ numToFetch.toString();
         app.request.post(link, this.apiPostData(),
            function(json) {
               var res = JSON.parse(json);
               self.events = res.data;
               self.generateTimeline();
            }
         );
         setTimeout(() => {
            if(self.events.length >= 50) {
               self.showPreloader = false;
               return;
            }
            self.allowInfinite = true;
         }, 1000);
      },
      generateTimeline: function()
      {
         const self = this;
         self.items = [];
         self.eventTypes = [... new Set(self.events.map(x=>x.class))];
         for(var k in self.events)
         {
            var e = self.events[k];
            self.items.push(self.eventToItem(e));
         }
      }
      , eventToItem: function(e) 
      {
         const self = this;
         return {tag : e.venue
                     + '\n' + moment(e.date, 'dddd, MMM DD, YYYY').format('ddd MMM DD') 
                     + '\n' + e.start_time
               , htmlMode : true
               , color : self.stringToColour(e.class)
               , content: `<span style='font-size:8px;color:gray;'>${e.class}</span>` 
                           + '<br/>' + e.title
                           + '<br/>'
         };
      }
      , filterTimeline: function( vtype )
      {
         const self = this;
         console.log('Filtering for ' + vtype, self.events.length);
         self.items = [];
         for(var k in self.events)
         {
            var e = self.events[k];
            console.log( e.class );
            if(e.class == vtype )
               self.items.push(self.eventToItem(e));
         }
      }
   },
};

</script>
