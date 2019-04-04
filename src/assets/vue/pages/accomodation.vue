<template>
  <f7-page page-content>

  <f7-navbar title="Accomodation" back-link="Back"></f7-navbar>
  <f7-block-title></f7-block-title>


  </f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
   data() {
      return {
         accomodations: [],
      };
   },
   methods: { 
   },
};
</script>
