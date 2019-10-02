<template>
   <f7-page @page:init="refreshData" @page:refresh="refreshData">
      <f7-navbar title="Hippo"></f7-navbar>
      <!-- More information here -->

      <f7-block v-if="getRoles().includes('BOOKMYVENUE_ADMIN')">
      <f7-block-title>BookMyVenue Admin</f7-block-title>
      </f7-block>

      <f7-block v-if="getRoles().includes('ACAD_ADMIN')">
      <f7-block-title>Acad Admin</f7-block-title>
      </f7-block>

      <f7-block v-if="getRoles().includes('SERVICES_ADMIN')">
      <f7-block-title>Services Admin</f7-block-title>
      </f7-block>

      <f7-block v-if="getRoles().includes('ADMIN')">
      <f7-block-title>Hippo Admin</f7-block-title>
      </f7-block>


   </f7-page>
</template>

<script>
   export default {
      data() {
         const self = this;
         return {
            username: 'Guest',
            alreadyLoggedIn: false,
            profile: [],
            notifications: [],
         };
      },
      mounted()
      {
         const self = this;
         self.notifications = self.loadStore('notifications').filter(x =>false==x.is_read);
         self.username = self.$localStorage.get('HIPPO-LOGIN');
         self.alreadyLoggedIn = self.isUserAuthenticated();
         self.fetchProfile();
         self.profile = self.loadStore('me.profile');
      },
      methods : {
         refreshData: function( ) {
            const self = this;
            self.fetchProfile();
            self.profile = self.loadStore("me.profile");
            self.alreadyLoggedIn = self.isUserAuthenticated();
         },
      },
   }
</script>
