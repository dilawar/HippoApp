<template>
   <f7-page page-content @page:init="reinit">
      <f7-navbar title="Profile" back-link="Back"></f7-navbar>

      <f7-block>
         <f7-list class="components-list" no-hairlines>

         </f7-list>
      </f7-block>

      <!-- FAB Right Bottom (Blue) -->
      <f7-fab v-if="alreadyLoggedIn" position="right-bottom" slot="fixed" color="blue">
         <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
         <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
         <f7-fab-buttons position="top">
         </f7-fab-buttons>
      </f7-fab>

   </f7-page>

</template>

<script>
   export default {
      data() {
         const self = this;
         return {
            profile: JSON.parse(self.$localStorage.get('my.profile', '[]')),
         };
      },
      mounted()
      {
         const self = this;
         const app = self.$f7;
         var $$ = this.$$;

         // Fetch the transport as well.
         app.request.post( self.$store.state.api+'/me/profile'
            , self.apiPostData()
            , function(json) 
            {
               const res = JSON.parse(json);
               if( res.status=='ok')
                  self.$localStorage.set('me.profile', JSON.stringify(res.data));
            }
         );
      },
      methods: {
      },
   }
</script>
