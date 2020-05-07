<template>
  <f7-page class="with_photography_club page-content infinite-scroll-content">
    <f7-navbar>

      <!-- LEFT PANEL -->
      <f7-nav-left>
        <f7-link v-if="isUserAuthenticated()" panel-open="left" icon="fa fa-bars fw">
        </f7-link>
      </f7-nav-left>

      <f7-nav-title>NCBS Hippo</f7-nav-title>

      <!-- RIGHT PANEL -->
      <f7-nav-right>
        <f7-link v-if="isUserAuthenticated()"
                 icon="fas fa-sign-out-alt" @click="signOut" 
                 panel-close
                 header="Logout"
                 slot="media">
        </f7-link>
        <f7-link v-else
                 @click="shutdown"
                 color="red"
                 icon="fa fa-power-off fa-fw" 
                 panel-close
                 header="Close"
                 slot="media">
        </f7-link>

        <f7-link v-if="rolesCSV.includes('ADMIN')" 
                 panel-open="right" 
                 icon="fa fa-bars fa-fw"
                 color="red">
        </f7-link>
      </f7-nav-right>
    </f7-navbar>


    <f7-row>
      <f7-col width="20" medium="40">
      </f7-col>
      <f7-col width="80" medium="40">
        <f7-list no-hairlines media-list>

          <f7-list-item v-if="isUserAuthenticated()"
                        link="/smartbook/" 
                        title="Booking" 
                        tooltip="Create a new booking"
                        panel-close>
            <f7-icon slot="after" icon="fa fa-hand-pointer fa-2x"></f7-icon>
          </f7-list-item>

          <f7-list-item v-if="isUserAuthenticated()"
                        link="/inventory/" 
                        title="Inventory" 
                        tooltip="Search and borrow"
                        panel-close>
            <f7-icon slot="after" icon="fa fa-archive fa-2x"></f7-icon>
          </f7-list-item>

          <f7-list-item link="/accomodation/" 
                        title="Accomodations" 
                        tooltip="Browse/create TO-LET listing"
                        panel-close>
            <f7-icon slot="after" icon="fa fa-home fa-2x"></f7-icon>

          </f7-list-item>

          <f7-list-item link="/noticeboards/all" 
                        title="Notice Board" 
                        tooltip="Because you hate spamming mailing list"
                        panel-close>
            <f7-icon slot="after" icon="fa fa-bullhorn fa-2x"></f7-icon>
          </f7-list-item>

          <f7-list-item link="/transport/" title="Transport" panel-close>
            <f7-icon slot="after" icon="fa fa-bus fa-2x"></f7-icon>
            <div slot="text" v-html="upcomingTrips"></div>
          </f7-list-item>

        <!--
          <f7-list-item link="/covid/" title="COVID" panel-close>
            <f7-icon slot="after" icon="fa fa-bug fa-2x"></f7-icon>
          </f7-list-item>
        -->

        </f7-list>
      </f7-col>
    </f7-row>

    <f7-row v-if="! isUserAuthenticated()" style="margin-right:5px" class="pull-right">
      <f7-col>
      </f7-col>
      <f7-col>
        <div>
          <font v-if="isHippoAlive">Hippo is Alive. You may login.</font>
          <font v-else>
            <f7-preloader color="blue"></f7-preloader> Pinging Hippo ...
          </font>
        </div>
        <f7-button fill :disabled="! isHippoAlive" login-screen-open=".hippo-login-screen">
          {{isHippoAlive?'Login':'Pinging Hippo server...'}}
        </f7-button>
      </f7-col>
    </f7-row>

    <!-- FLASH cards -->
    <f7-swiper navigation :params="{loop:true}">
      <f7-swiper-slide v-for="(card,key) in flashCards" :key="key">
        <div style="margin:8%; padding:20px; 
                      border-radius:10px;
                      background-color:rgba(255,255,255,0.9)">
          {{humanReadableDateTime(card.date, card.time)}} 
          | {{card.venue}} 
          | {{card.title}}
        </div>
      </f7-swiper-slide>
    </f7-swiper>


    <!-- FAB Right Bottom (Blue) -->
    <f7-fab v-if="isUserAuthenticated()" 
            text="Book"
            position="right-bottom"
            slot="fixed" 
            color="blue"
            href="/smartbook/" 
            fab-close>
          <f7-icon icon="fa fa-plus"></f7-icon>
    </f7-fab>

    <!-- LOGIN SCREEN  -->
    <f7-login-screen class="hippo-login-screen">
      <f7-page login-screen>
        <f7-login-screen-title>Login</f7-login-screen-title>
        <f7-list form>
          <f7-list-input
            label="Username"
            type="text"
            placeholder="Your username"
            :value="username"
            @input="username = $event.target.value">
          </f7-list-input>
          <f7-list-input
            label="Password"
            type="password"
            placeholder="Your password"
            :value="password"
            @input="password = $event.target.value">
          </f7-list-input>
        </f7-list>

          <f7-row>
            <f7-col width="45">
              <f7-button login-screen-close raised login-screen-close>Cancel</f7-button>
            </f7-col>
            <f7-col width="45">
              <f7-button @click="signIn()" raised login-screen-close>Sign In</f7-button>
            </f7-col>
          </f7-row>

          <f7-block-footer>
            Use your NCBS/InSTEM/Others credentials. Verify
            that you can login to <a _target="blank" href="https://ncbs.res.in/hippo">
              Hippo Website</a>.
          </f7-block-footer>

      </f7-page>
    </f7-login-screen>

    <!-- cards -->
    <vue-highcharts :options="options">
    </vue-highcharts>

  </f7-page>
</template>

<script>
export default {
  data() {
    return {
      isHippoAlive: false,
      username: '',
      password: '',
      flashCards: {},
      profile: { },
      upcomingTrips: '',
      rolesCSV: 'USER',
      options: {
      },
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;

    // Check if hippo is alive
    self.promiseWithAuth('status').then(function(x) {
      var res = JSON.parse(x.data);
      if( res.status ==='ok' && res.data.status === 'alive')
      {
        console.log('Hippo is alive.');
        self.isHippoAlive = true;
      }
    });

    self.promiseWithAuth('transport/upcoming').then(function(x) {
      let data = JSON.parse(x.data).data;
      if(data) {
        self.upcomingTrips = '<div style="color:black;">'
        self.upcomingTrips += '<marquee direction="left" scrollamount="3">';
        data.forEach( (val, key) => {
          self.upcomingTrips += '🚐  '
            + val.vehicle + ': ' + val.pickup_point + ' to '
            + val.drop_point + ', ' + self.humanReadableTime(val.trip_start_time) 
            + '. . . . ';
        });
        self.upcomingTrips += '</marquee></div>';
      }
    });

    self.fetchFlashCards();
    self.fetchRoles();

    // Get notification now and display them.
    setTimeout(() => {self.fetchNotifications();}, 1000);
    setTimeout(() => {self.displayNotifications();}, 1000);

    // Call fetchNotifications in the background. every minutes.
    // FIXME:  Make it query 15 minutes later.
    setInterval( function() {
      console.log("Fetching notitication");
      try {
        self.fetchNotifications()
      } catch (e) {
        /* handle error */
        console.log( "Could not fetch notifications.");
      }}, 30*60*1000);

    setInterval( function() {
      try {
        self.displayNotifications()
      } catch (e) {
        /* handle error */
        console.log("Could not display notifications.");
      }}, 60*60*1000);

  },
  methods: {
    signIn: function()
    {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader("Loging in ...");
      app.request.promise.post( self.$store.state.api+"/authenticate"
        , {login:self.username, password: btoa(self.password)})
        .then(function(x) {
          try {
            var res = JSON.parse(x.data);
          } catch (e) {
            /* handle error */
              app.notification.create({
                title:'Invalid response from server'
                , subtitle: 'Is your username/password correct?'
                , closeTimeout: 5000
                , closeOnClick: true, closeButton: true
              }).open();
            return;
          }

          if( res.status==='ok' && res.data.apikey!=='')
          {
            // This goes in local store. Persistent till user logged out.
            self.$store.commit('HIPPO_API_KEY', res.data.apikey);
            self.$store.commit('USER_LOGGED', self.username);

            // Store in vuex
            self.$store.commit('GOOGLE_MAP_API_KEY', res.data.gmapapikey);

            self.postWithPromise('me/profile')
              .then(function(x) {
                self.$store.commit('PROFILE', JSON.parse(x.data).data);
              });
            self.$f7router.refreshPage();
          }
          else
            app.dialog.alert("Failed to login. Try again.", "Error");
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 2000);
    },
    fetchRoles: function() {
      const self = this;
      self.promiseWithAuth('me/roles').then( function(x) {
        var res = JSON.parse(x.data);
        if(res.data.roles)
          self.rolesCSV = res.data.roles;
      });
    },
    fetchFlashCards: function() {
      const self = this;
      self.promiseWithAuth('info/flashcards').then( function(x) {
        self.flashCards = JSON.parse(x.data).data;
        console.log("Total flash cards: ", self.flashCards.length );
      });
    },
    shutdown: function() {
      navigator.app.exitApp();
    },
  },
}
</script>
