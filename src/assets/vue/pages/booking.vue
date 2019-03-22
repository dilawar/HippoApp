<template>

  <f7-page @page:init="onPageInit">
  <f7-navbar title="Booking" back-link="Back"></f7-navbar>


    <!--  Show venues as grid or list. -->
    <f7-page-content>

      <f7-block>
          <f7-button raised fill round @click="onPageInit">Refresh venues</f7-button>
      </f7-block>

      <!-- Date and time -->
      <f7-block>
        <date-picker v-model="searchVenueAt" type="datetime" 
                     format="YYYY-MM-DD hh:mm" 
                     :minute-step="10"
                     lang="en" confirm >
        </date-picker>
      </f7-block>

      <f7-block>
      <f7-list>
        <f7-list-item 
          v-for="(item, index) in venues" :title="`${item.id}`">
        </f7-list-item>
      </f7-list>
      </f7-block>

    </f7-page-content>

  </f7-page>

</template>

<script>

import DatePicker from 'vue2-datepicker'

export default {
  components : {DatePicker},
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
