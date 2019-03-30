<template>
   <f7-page ptr 
            infinite
            :infinite-distance="50"
            :infinite-preloader="showPreloader"
            @infinite="fetchMoreEvents"
            @page:init="fetchEvents" 
            @ptr:refresh="fetchEvents" 
            page-content
            >
      <f7-navbar title="Upcoming events" back-link="Back"></f7-navbar>
      <f7-block>
            <f7-list accordion-list>
               <f7-list-item 
                     accordion-item
                     v-for="(val, index) in events" 
                     :key="index"
                     :header="val.venue"
                     :text-color="assignColor(val.start, val.end)"
                     :footer="val.date+', '+val.start_time+' to '+val.end_time"
                     :title="val.title"
                     >
                     <f7-accordion-content>
                        <f7-block margin=30>
                              <strong>{{val.title}}</strong>
                              <small><span v-html="val.description"></span></small>
                        </f7-block>
                     </f7-accordion-content>
               </f7-list-item>
            </f7-list>
      </f7-block>
   </f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

export default {
   data() {
      return {
         events: [],
         startDate: moment(),
         showPreloader: true,
         allowInfinite: true,
         numEvents: 0,
      };
   },
   computed: {
   },
   methods: { 
      assignColor: function(startDateTime, endDateTime) 
      {
         console.log( 'start', moment(startDateTime), 'today', moment());
         if(moment(startDateTime) < moment().add(7, 'd'))
            return 'purple';
         if(moment(startDateTime) <= moment().add(1, 'd'))
            return 'deeppurple';
         return '';
      },
      fetchEvents: function() 
      {
         const self         = this;
         const app          = self.$f7;
         var link = self.$store.state.api+'/publicevents/'+moment(self.startDate).format('X')+'/20';

         app.request.post(link, this.apiPostData(),
            function(json) {
               var res = JSON.parse(json);
               self.events = res.data;
            }
         );
         setTimeout(() => {app.dialog.close();}, 1000);
         return;
      },
      fetchMoreEvents: function( )
      {
         const self         = this;
         const app          = self.$f7;
         if( ! self.allowInfinite ) return;

         self.allowInfinite = false;

         var numToFetch = self.events.length + 10;
         var link = self.$store.state.api+'/publicevents/'+moment(self.startDate).format('X') 
            +'/'+ numToFetch.toString();
         console.log('Link is', link);
         app.request.post(link, this.apiPostData(),
            function(json) {
               var res = JSON.parse(json);
               self.events = res.data;
            }
         );
         setTimeout(() => {
            if(self.events.length >= 50) {
               self.showPreloader = false;
               return;
            }
            self.allowInfinite = true;
         }, 2000);
      },
   },
};

</script>
