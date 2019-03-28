<template>
<f7-page ptr @ptr:refresh="fetchEvents" @page:init="fetchEvents">
  <f7-navbar title="Travel" back-link="Back"></f7-navbar>

  <!--  Show venues as grid or list. -->
  <f7-page-content>

    <f7-block-title medium>Schedule</f7-block-title>
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
