<template>

  <f7-page @page:init="refreshVenues">
  <f7-navbar title="Booking" back-link="Back"></f7-navbar>

  <!--  Show venues as grid or list. -->
  <f7-page-content>

    <!-- Date and time -->
    <f7-list simple-list>
      <f7-list-item>
        <f7-list-item-cell class="width-auto">
          <f7-icon ios="f7:circle" f7="time"></f7-icon>
        </f7-list-item-cell>
        <f7-list-item-cell>
          <f7-range :min="0.25" :max="8" :step="0.5" :value="1" :label="true"></f7-range>
        </f7-list-item-cell>
      </f7-list-item>
      <f7-list-item>
          <datetime v-model="datetime" type="datetime"
                                              :auto="true"
                                              :minute-step="15"
                                              > </datetime>
      </f7-list-item>
      <f7-list-item>
        <f7-list-item-cell>
          <f7-button fill>Filter Venues</f7-button>
        </f7-list-item-cell>
      </f7-list-item>
    </f7-list>

    <f7-list>
      <f7-list-item v-for="(item, index) in venues" :title="`${item.id}`">
      </f7-list-item>
    </f7-list>

  </f7-page-content>
</f7-page>

</template>

<script>

export default {
  data() {
    return {
      venues : null,
      datetime : '',
    };
  },
  methods: {
    refreshVenues : function(data) {
      console.log("Fetching all venues");
      console.log(data);
      const self = this;
      const app = self.$f7;
      this.isOpen = false;

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
