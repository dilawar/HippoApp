<template>
   <f7-page ptr ptr:refresh="refreshPage">
      <f7-navbar title="Annual Work Seminar" back-link="Back">
      </f7-navbar>

      <f7-block>
      </f7-block>

   </f7-page>

</template>

<script>
  export default {
    data() {
      const self = this;
      return {
        thisAWS: [],
        upcomingAWS: [],
        popupTitle: 'Review request',
        allowInfinite: true,
      };
    },
    mounted()
    {
      const self = this;
      self.fetchUpcomingAws();
    },
    methods : {
      refreshData: function()
      {
        const self = this;
      },
      refreshPage: function()
      {
        const self = this;
      },
      fetchUpcomingAws: function() 
      {
        const self = this;
        const app = self.$f7;
        app.dialog.preloader();
        self.promiseWithAuth('/acadadmin/aws/upcoming')
          .then( function(json) {
            self.upcomingAWS = JSON.parse(json).data;
            app.dialog.close();
          });
      },
    },
  }
</script>
