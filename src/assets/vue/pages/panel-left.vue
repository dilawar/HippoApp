<template>
   <f7-page @page:init="refreshData" @page:refresh="refreshData">
      <f7-navbar title="Hippo"></f7-navbar>
      <!-- More information here -->
      <f7-block>
         <f7-block-title>Welcome {{username}} </f7-block-title>
         <f7-list>
            <f7-list-item link="/mybooking/" 
                          target="_blank"
                          view=".view-main"
                          title="My Bookings" 
                          panel-close>
               <f7-icon slot="media" icon="fa fa-edit fa-2x"></f7-icon>
            </f7-list-item>
         </f7-list>
      </f7-block>
   </f7-page>
</template>

<script>
   export default {
      data() {
         return {
            username: 'Guest',
            alreadyLoggedIn: false,
         };
      },
      mounted()
      {
         const self = this;
         self.username = self.$localStorage.get('HIPPO-LOGIN');
         self.alreadyLoggedIn = self.isUserAuthenticated();
      },
      methods : {
         refreshData: function( ) {
            console.log('Calling refreshData');
            const self = this;
            self.alreadyLoggedIn = self.isUserAuthenticated();
         },
      },
   }
</script>
