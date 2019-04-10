<template>
   <f7-page @page:init="refreshData" @page:refresh="refreshData">
      <f7-navbar title="Hippo"></f7-navbar>
      <!-- More information here -->

         <f7-block-title>Welcome {{username}} </f7-block-title>

         <f7-list no-hairlines>
            <f7-list-item link="/myprofile/" 
                          target="_blank"
                          view=".view-main"
                          title="My Profile" 
                          panel-close
                          >
               <f7-icon slot="media" icon="fa fa-user fa-fw"></f7-icon>
            </f7-list-item>

            <f7-list-item v-if="profile.eligible_for_aws"
                          link="/myaws/" 
                          target="_blank"
                          view=".view-main"
                          title="My AWS" 
                          panel-close
                          >
             <f7-icon slot="media" icon="fa fa-graduation-cap fa-fw"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/mybooking/" 
                          target="_blank"
                          view=".view-main"
                          title="My Bookings" 
                          panel-close
                          >
               <f7-icon slot="media" icon="fa fa-edit fa-fw"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/myinventory/" 
                          target="_blank"
                          view=".view-main"
                          title="My Inventory" 
                          panel-close
                          >
               <f7-icon slot="media" icon="fa fa-archive fa-fw"></f7-icon>
            </f7-list-item>

         </f7-list>

   </f7-page>
</template>

<script>
   export default {
      data() {
         return {
            username: 'Guest',
            alreadyLoggedIn: false,
            profile: [],
         };
      },
      mounted()
      {
         const self = this;
         self.username = self.$localStorage.get('HIPPO-LOGIN');
         self.alreadyLoggedIn = self.isUserAuthenticated();
         self.fetchProfile();
         self.profile = JSON.parse(self.$localStorage.get('me.profile', '[]'));
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
