<template>

  <f7-page @page:init="onPageInit">
  <f7-navbar title="Booking" back-link="Back"></f7-navbar>


    <!--  Show venues as grid or list. -->
    <f7-page-content>

      <!-- Date and time -->
      <f7-block>
        <f7-row>
          <f7-col> <f7-input type="date" label="Date" 
              validate clear-button> </f7-input> </f7-col>
          <f7-col> <f7-input type="time" label="Time" 
              validate clear-button> </f7-input> </f7-col>
        </f7-row>
      </f7-block>

      <f7-list>
        <f7-list-item 
          v-for="(item, index) in venues" :title="`${item.id}`">
        </f7-list-item>
      </f7-list>

      <f7-button outline round @click="onPageInit">Refresh venues</f7-button>

    </f7-page-content>

  </f7-page>

</template>

<script>
  export default {
    data() {
      return {
        venues : null,
        showPreloader: true,
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

    //on: { 
    //  pageInit(page) {
    //    console.log( "Fething all venues" );
    //    //const self = this;
    //    //setTimeout( () => {
    //    //  const app = self.$f7;

    //    //  // Try to connect.
    //    //  app.request.post(self.$store.state.api + '/venue/list/all'
    //    //    , {'HIPPO-API-KEY': self.$localStorage.get('HIPPO-API-KEY')
    //    //      , 'login': self.$localStorage.get('HIPPO-LOGIN') 
    //    //    }, 
    //    //    function(json) {
    //    //      var res = JSON.parse(json);
    //    //      console.log(res);
    //    //    });
    //    //  done();
    //    //}, 1000);
    //  },
    //},
  };
</script>
