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
                     :footer="val.date+', '+val.start_time+' to '+val.end_time"
                     :title="val.title"
                     >
                     <f7-accordion-content>
                        <f7-block bg-color="lightblue">
                           <strong>{{val.title}}</strong>
                           <span v-html="val.description"></span>
                        </f7-block>
                     </f7-accordion-content>

                     <!-- <f7-icon slot=media icon="fa fa-info-circle"></f7-icon> -->
                     <!-- Calendar -->
                     <!--
                        <add-to-calendar slot="media"
                        :title="val.title"
                        :location="val.venue"
                        :details="val.description"
                        :start="toDate(val.start)"
                        :end="toDate(val.end)"
                        inline-template>
                        <div>
                        <google-calendar id="google-calendar">
                        <i class="fa fa-google fa-2x"></i></google-calendar>
                        <microsoft-calendar id="microsoft-calendar">
                        <i class="fa fa-windows fa-2x"></i></microsoft-calendar>
                        </div>
                        </add-to-calendar>
                     -->

               </f7-list-item>
            </f7-list>
      </f7-block>
   </f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

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
   methods: { 
      fetchEvents: function() 
      {
         const self         = this;
         const app          = self.$f7;
         app.dialog.preloader('Fetching 20 events ...');
         var link = self.$store.state.api+'/publicevents/'+moment(self.startDate).format('X')+'/20';
         console.log( 'Link is ', link);

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
