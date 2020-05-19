<template>
  <f7-page @page:init="refreshData" @page:refresh="refreshData">
    <f7-navbar title="Hippo"></f7-navbar>
    <!-- More information here -->

    <f7-block-title>Welcome {{username}}. </f7-block-title>

    <f7-list no-hairlines>
      <f7-list-item link="/notifications/" 
        target="_blank"
        view=".view-main"
        title="Notifications"
        panel-close>
        <span slot="media" class="fa-stack" v-if="notifications.length>=0">
          <i class="fas fa-bell fa-stack-2x"></i>
          <i class="fas fa-stack circle-red">{{notifications.length}}</i>
        </span>
      </f7-list-item>

      <f7-list-item :link="'/profile/'+username" 
        target="_blank"
        view=".view-main"
        title="My Profile" 
        panel-close
      >
        <f7-icon slot="media" icon="fa fa-user fa-2x"></f7-icon>
      </f7-list-item>

      <f7-list-item link="/mybooking/" 
        target="_blank"
        view=".view-main"
        title="My Bookings" 
        panel-close
      >
        <f7-icon slot="media" icon="fa fa-edit fa-2x"></f7-icon>
      </f7-list-item>

      <f7-list-item v-if="profile.eligible_for_aws"
        link="/myaws/" 
        target="_blank"
        view=".view-main"
        title="My AWS" 
        panel-close
      >
        <f7-icon slot="media" icon="fa fa-graduation-cap fa-2x"></f7-icon>
      </f7-list-item>

      <f7-list-item link="/myjc/" 
        target="_blank"
        view=".view-main"
        title="Journal Clubs" 
        panel-close
      >
        <f7-icon slot="media" icon="fa fa-users fa-2x"></f7-icon>
      </f7-list-item>

      <f7-list-item link="/mycourse/" 
        target="_blank"
        view=".view-main"
        title="My Courses" 
        panel-close
      >
        <f7-icon slot="media" icon="fa fa-book fa-2x"></f7-icon>
      </f7-list-item>


      <f7-list-item link="/myinventory/" 
        target="_blank"
        view=".view-main"
        title="Lab Inventory"
        panel-close
      >
        <f7-icon slot="media" icon="fa fa-archive fa-2x"></f7-icon>
      </f7-list-item>

    </f7-list>

  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    return {
      username: self.$store.getters.profile.login,
      alreadyLoggedIn: false,
      profile: [],
      notifications: [],
    };
  },
  mounted()
  {
    const self = this;
    self.notifications = self.loadStore('notifications').filter(x =>false==x.is_read);
    self.alreadyLoggedIn = self.isUserAuthenticated();
    self.postWithPromise('/me/profile').then(function(x) {
      self.profile = JSON.parse(x.data).data;
      self.saveStore('me.profile', self.profile);
    });
  },
  methods : {
    refreshData: function( ) {
      const self = this;
      self.profile = self.loadStore("me.profile");
      self.alreadyLoggedIn = self.isUserAuthenticated();
    },
  },
}
</script>
