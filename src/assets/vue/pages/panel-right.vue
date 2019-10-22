<template>
  <f7-page>
    <f7-navbar title="Admin panel"></f7-navbar>

      <!-- More information here -->
      <f7-block v-if="roles.includes('BOOKMYVENUE_ADMIN')">
      <f7-block-title>BookMyVenue Admin</f7-block-title>
        <f7-list>
          <f7-list-item link="/bmvadmin/bookingrequests/" 
                        target="_blank"
                        view=".view-main"
                        title="Pending Requests" 
                        panel-close
                        >
          </f7-list-item>

          <f7-list-item link="/bmvadmin/events/" 
                        target="_blank"
                        view=".view-main"
                        title="Confirmed Events" 
                        panel-close
                        >
          </f7-list-item>

        </f7-list>
      </f7-block>

      <f7-block v-if="roles.includes('ACAD_ADMIN')">
      <f7-block-title>Acad Admin</f7-block-title>
        <f7-list>
          <f7-list-item link="/acadadmin/aws/" 
                        target="_blank"
                        view=".view-main"
                        title="Upcoming AWSs" 
                        panel-close
                        >
          </f7-list-item>

          <f7-list-item link="/acadadmin/awsroster/" 
                        target="_blank"
                        view=".view-main"
                        title="AWS Roster" 
                        panel-close
                        >
          </f7-list-item>

          <f7-list-item link="/acadadmin/courses/" 
                        target="_blank"
                        view=".view-main"
                        title="Courses" 
                        panel-close
                        >
          </f7-list-item>

        </f7-list>

      </f7-block>

      <f7-block v-if="roles.includes('SERVICES_ADMIN')">
      <f7-block-title>Services Admin</f7-block-title>
      </f7-block>

      <f7-block v-if="roles.includes('ADMIN')">
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
        profile: { 'roles':[] },
        notifications: [],
        roles: '',
      };
    },
    mounted: function() {
      console.log('Panel is opening');
      const self = this;
      self.fetchData();
    },
    methods : {
      refreshData: function(ev, done) {
        const self = this;
      },
      fetchData()
      {
        const self = this;
        console.log('Admin panel beforein');
        self.postWithPromise('/me/profile').then(function(x) {
          self.profile = JSON.parse(x.data).data;
          self.roles = self.profile.roles.split(',');
        });
      },
    },
  }
</script>
