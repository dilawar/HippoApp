<template>
   <f7-page infinite @infinite="loadMore">
      <f7-navbar title="AWS Roster" back-link="Back">
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
        thisData: [],
        popupTitle: 'Review request',
        allowInfinite: true,
      };
    },
    mounted()
    {
      const self = this;
    },
    methods : {
      refreshData: function( ) {
        const self = this;
      },
      loadMore: function()
      {
        const self = this;
        if(! self.allowInfinite)
          return;
        self.allowInfinite = false;
      },
    }
  }
</script>

