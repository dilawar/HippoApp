<template>
   <f7-page @page:init="refreshData" @page:refresh="refreshData">
      <f7-navbar title="Hippo">
      </f7-navbar>

      <f7-block-title small>Booking requests</f7-block-title>

      <f7-block v-if="getRoles().includes('BOOKMYVENUE_ADMIN')">

      </f7-block>

   </f7-page>
</template>

<script>
   export default {
      data() {
         const self = this;
         return {
            requests: [],
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
      },
   }
</script>
