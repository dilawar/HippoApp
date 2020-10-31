<template>
  <f7-page>
    <f7-navbar title="Admin panel">
      <f7-block-title>
      </f7-block-title>
    </f7-navbar>

    <!-- More information here -->
    <f7-list no-hairlines style="list-style-type:none">
      <template v-if="roles.includes('BOOKMYVENUE_ADMIN')">
        <f7-list-item title="BookMyVenue Admin" group-title>
        </f7-list-item>
        <f7-list-item link="/bmvadmin/bookingrequests/" 
          target="_blank"
          view=".view-main"
          title="Pending Requests" 
          panel-close>
        </f7-list-item>
        <f7-list-item link="/bmvadmin/events/" 
          target="_blank"
          view=".view-main"
          title="Confirmed Events" 
          panel-close>
        </f7-list-item>
        <f7-list-item link="/admin/talks/" 
          target="_blank"
          view=".view-main"
          title="Talks & Seminars" 
          panel-close>
        </f7-list-item>
        <f7-list-item link="/admin/venues" 
          target="_blank"
          view=".view-main"
          title="Venues" 
          panel-close>
        </f7-list-item>
      </template>

      <template v-if="roles.includes('ACAD_ADMIN')">
        <f7-list-item title="Acad Admin" group-title>
        </f7-list-item>
        <f7-list-item link="/acadadmin/aws/" 
          target="_blank"
          view=".view-main"
          title="Upcoming AWS" 
          panel-close>
        </f7-list-item>
        <!--
        <f7-list-item link="/acadadmin/awsroster/" 
          target="_blank"
          view=".view-main"
          title="AWS Roster" 
          panel-close>
        </f7-list-item>
        -->
        <f7-list-item link="/acadadmin/allaws/" 
          target="_blank"
          view=".view-main"
          title="Previous AWS & Roster" 
          panel-close>
        </f7-list-item>
        <f7-list-item link="/acadadmin/courses/" 
          target="_blank"
          view=".view-main"
          title="Courses" 
          panel-close>
        </f7-list-item>
        <f7-list-item link="/acadadmin/jc/" 
          target="_blank"
          view=".view-main"
          title="Journal Clubs" 
          panel-close>
        </f7-list-item>

        <!-- Only when not bmvadmin because this option is available there as
        well. -->
        <f7-list-item link="/admin/talks/" 
          target="_blank"
          view=".view-main"
          title="Manage Talks/Seminar" 
          v-if="! roles.includes('BOOKMYVENUE_ADMIN')"
          panel-close>
        </f7-list-item>
      </template>

      <template v-if="roles.includes('SERVICES_ADMIN')">
        <f7-list-item title="Services Admin" group-title>
        </f7-list-item>

        <f7-list-item link="/serviceadmin/transport/" 
          target="_blank"
          view=".view-main"
          title="Transport" 
          panel-close>
        </f7-list-item>
      </template>

      <template v-if="roles.includes('ADMIN')">
        <f7-list-item title="Hippo Admin" group-title>
        </f7-list-item>
        <f7-list-item link="/admin/holidays/" 
          target="_blank"
          view=".view-main"
          title="Holidays" 
          panel-close>
        </f7-list-item>
        <f7-list-item link="/admin/people/" 
          target="_blank"
          view=".view-main"
          title="People" 
          panel-close>
        </f7-list-item>
        <f7-list-item link="/admin/emailtemplate/" 
          target="_blank"
          view=".view-main"
          title="Email Templates" 
          panel-close>
        </f7-list-item>
        <f7-list-item link="/admin/config/" 
          target="_blank"
          view=".view-main"
          title="Configuration" 
          panel-close>
        </f7-list-item>
      </template>
    </f7-list>

    <f7-button small @click="refreshRoles">Refresh</f7-button>

  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    return {
      username: 'Guest',
      alreadyLoggedIn: false,
      notifications: [],
      roles: self.$store.getters.roles,
    };
  },
  mounted: function() {
    // NOTE. See main.vue. We have a function there which triggers when right
    // panel is opened.
  },
  methods: {
    refreshRoles: function() {
      const self = this;
      console.log('Refreshing page');
      self.postWithPromise('/me/roles').then( function(x) {
        self.roles = JSON.parse(x.data).data;
      });
    },
  },
}
</script>
