<template>
<f7-page ptr @ptr:refresh="fetchEvents" @page:init="fetchEvents">
  <f7-navbar title="NCBS Events" back-link="Back"></f7-navbar>

  <!--  Show venues as grid or list. -->
  <f7-page-content>

    <f7-block-title medium>Upcoming Events</f7-block-title>
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
                   <f7-block>{{val.description}}</f7-block>
                </f7-accordion-content>
             <f7-icon slot=media icon="fa fa-info-circle"></f7-icon>
          </f7-list-item>
       </f7-list>
  </f7-page-content>
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
      };
   },
   methods: { 
      fetchEvents: function(event, done) 
      {
         const self         = this;
         const app          = self.$f7;
         setTimeout( () => {
            var link = self.$store.state.api+'/publicevents/'+moment(self.startDate).format('X');
            console.log('Link is', link);
            app.request.post(link, this.apiPostData(),
               function(json) {
                  var res = JSON.parse(json);
                  self.events = res.data;
               });
            done();
         }, 1000);
      },
   },
};

</script>
