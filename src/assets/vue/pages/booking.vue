<template>

  <f7-page @page:init="onPageInit">
  <f7-navbar title="Booking" back-link="Back"></f7-navbar>

  <!--  Show venues as grid or list. -->
  <f7-page-content>

  <!-- Date and time -->
  <date-time-picker 
                             singleDate=true
    > </date-time-picker>


  <f7-button raised fill round @click="onPageInit">Refresh venues</f7-button>

  <f7-list>
    <f7-list-item 
             v-for="(item, index) in venues" :title="`${item.id}`">
    </f7-list-item>
  </f7-list>


  </f7-page-content>

</f7-page>

</template>

<script>

import '@lazy-copilot/datetimepicker/dist/datetimepicker.css'
import { DateTimePicker} from '@lazy-copilot/datetimepicker';

export default {
  components : { DateTimePicker },
  data() {
    return {
      venues : null,
      showPreloader: true,
      searchVenueAt : '',
    };
  },
  methods: {
    onPageInit : function() {
      console.log("Fetching all venues");
      const self = this;
      const app = self.$f7;

      // Try to connect.
      app.request.post(self.$store.state.api + '/venue/list/all'
        , {'HIPPO-API-KEY': self.$localStorage.get('HIPPO-API-KEY')
          , 'login': self.$localStorage.get('HIPPO-LOGIN') 
        }, 
        function(json) {
          var res = JSON.parse(json);
          if(res.status == 'ok')
            self.venues = res.data;
        });
    }
  },
};
</script>
