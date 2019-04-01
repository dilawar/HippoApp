<template>
  <f7-page page-content>
  <f7-navbar title="What Where When" back-link="Back"></f7-navbar>

  <f7-block>

  </f7-block>

  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
   data() {
      return {
         selectedDay: moment(),
         events: [],
      };
   },
   mounted: function() {
      const self = this;
      const app = this.$f7;
      // Get thisDay events.
      app.request.post(self.$store.state.api+'/events/date/'+self.selectedDay.format('X')
         , self.apiPostData()
         , function(json) 
         {
            const res = JSON.parse(json);
            if(res.status=='ok')
            {
               self.events = res.data;
               self.$localStorage.set('events', JSON.stringify(res.data));
            }
         },
      );
   },
   methods: { 
   },
}; 

</script>
