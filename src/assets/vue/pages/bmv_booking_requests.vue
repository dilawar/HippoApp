<template>
   <f7-page @page:init="refreshData" @page:refresh="refreshData">
      <f7-navbar title="Hippo" back-link="Back">
      </f7-navbar>

      <f7-block-title small>Booking requests</f7-block-title>
      <f7-block v-if="getRoles().includes('BOOKMYVENUE_ADMIN')">
        <f7-list no-hairlines media-list accordion-list>
          <f7-list-item v-for="(request, id) in requests"
                        accordion-item>
            <div slot="header"> {{request.venue}} | {{request.class}} </div>
            <div slot="header"> Created by {{request.created_by}} </div>
            <div slot="title"> {{request.title}} </div>
            <div slot="footer">
              {{request.date | date}} |
              {{request.start_time | clockTime}} to 
              {{request.end_time | clockTime }}
            </div>
            <f7-accordion-content>
               <div v-html="request.description"> </div>
            </f7-accordion-content>
          </f7-list-item>
        </f7-list>

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
      self.fetchPendingRequests();
    },
    methods : {
      refreshData: function( ) {
        const self = this;
      },
      fetchPendingRequests: function() 
      {
        const self = this;
        self.promiseWithAuth('bmvadmin/requests/pending').then(
          function(json) {
            self.requests = JSON.parse(json).data;
          });
      },
    },
  }
</script>
