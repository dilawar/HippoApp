<template>
   <f7-page @page:init="refreshData" @page:refresh="refreshData">
      <f7-navbar title="Admin panel" back-link="Back"></f7-navbar>

      <!-- More information here -->

      <f7-block v-if="getRoles().includes('BOOKMYVENUE_ADMIN')">
      <f7-block-title>BookMyVenue Admin</f7-block-title>
        <f7-list no-hairlines>

          <f7-list-item link="/bmvadmin/bookingrequests/" 
                        target="_blank"
                        view=".view-main"
                        title="Booking Requests" 
                        panel-close
                        >
          </f7-list-item>

        </f7-list>
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

    },
    methods : {
      refreshData: function(ev, done) {
        const self = this;
      },
    },
  }
</script>
