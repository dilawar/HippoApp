<template>
  <f7-page class="with_photography_club hide-native-scrollbar">
    <f7-navbar>
      <!-- LEFT PANEL -->
      <f7-nav-left>
        <f7-link v-if="isUserAuthenticated()" panel-open="left" 
          icon="fa fa-bars fw">
        </f7-link>
      </f7-nav-left>

      <f7-nav-title>
        <div style="vertical-align:bottom">
          <img src="static/logo.png" height="25px" alt="logo" />
          <span style="display:inline-block; font-size:30px">Hippo</span>
          <span style="font-size:small;padding-left:10px">
            <f7-link no-link-class 
              v-if="! isMobileApp()"
              target="_system" external
              href="https://ncbs.res.in/hippo/v1/welcome">
              Old Hippo</f7-link>
            <f7-link no-link-class v-if="! isMobileApp()"
              target="_system" external
              icon="fab fa-android"
              href="https://play.google.com/store/apps/details?id=com.dilawar.hippo">
              App
            </f7-link>
          </span>
        </div>
      </f7-nav-title>

      <!-- RIGHT nav -->
      <f7-nav-right>
        <f7-link v-if="isUserAuthenticated()"
          icon="fas fa-sign-out-alt" @click="signOut" 
          panel-close
          header="Logout"
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
      <f7-col width="40" medium="40" large="60"></f7-col>
      <f7-col width="60" medium="60" large="40">
        <f7-list no-hairlines>
          <f7-list-item v-if="isUserAuthenticated()"
            link="/smartbook/" 
            title="Booking" 
            tooltip="Create a new booking"
            panel-close>
            <f7-icon slot="media" icon="fa fa-plus fa-2x"></f7-icon>
          </f7-list-item>

          <f7-list-item v-if="isUserAuthenticated()"
            link="/inventory/" 
            title="Inventory" 
            tooltip="Search and borrow"
            panel-close>
            <f7-icon slot="media" icon="fa fa-archive fa-2x"></f7-icon>
          </f7-list-item>

          <f7-list-item link="/accomodation/" 
            title="Accomodations" 
            tooltip="Browse/create TO-LET listing"
            panel-close>
            <f7-icon slot="media" icon="fa fa-home fa-2x"></f7-icon>

          </f7-list-item>

          <f7-list-item link="/noticeboards/all" 
            title="Notice Board" 
            tooltip="Because you hate spamming mailing list"
            panel-close>
            <f7-icon slot="media" icon="fa fa-bullhorn fa-2x"></f7-icon>
          </f7-list-item>

          <f7-list-item link="/transport/" title="Transport" panel-close>
            <f7-icon slot="media" icon="fa fa-bus fa-2x"></f7-icon>
            <div slot="text" v-html="upcomingTrips"></div>
          </f7-list-item>

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

      <!-- FAB Right Bottom (Orange) -->
      <f7-fab position="right-bottom" slot="fixed">
        <f7-icon icon="fa fa-info fa-2x" 
          tooltip="See AWS, JC, Courses and other public info">
        </f7-icon>
        <f7-icon ios="f7:xmark" aurora="f7:xmark" md="material:close"></f7-icon>
        <f7-fab-buttons position="top">
          <f7-fab-button href="/info/talks" label="Talks">1</f7-fab-button>
          <f7-fab-button href="/info/upcomingawses" label="Upcoming AWS">2</f7-fab-button>
          <f7-fab-button href="/info/jcs" label="JC">3</f7-fab-button>
          <f7-fab-button href="/info/courses" label="Courses">4</f7-fab-button>
          <f7-fab-button href="/info/statistics" label="Statistics">5</f7-fab-button>
        </f7-fab-buttons>
      </f7-fab>

      <!-- flash cards -->
      <f7-block inset style="background:rgba(255,255,255,0.9); margin-top:25%">
        <f7-swiper navigation 
          :params="{slidesPerView: 'auto', loop: true, autoplay:{delay:1500, disableOnInteraction:true}}">
          <f7-swiper-slide v-for="(card,key) in flashCards" :key="key">
            <div style="padding:3% 10% 3% 10%; text-align:center">
              {{humanReadableDateTime(card.date, card.time)}} | <span v-html="card.venue"></span>
              <div v-html="card.title">
              </div>
            </div>
          </f7-swiper-slide>
        </f7-swiper>
      </f7-block>

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


      <!-- footer -->
      <f7-block-footer class="main-footer">
        <!-- top row -->
        <f7-link external 
          icon="fab fa-readme"
          class="col-30 medium-25"
          external target="_system"
          href="https://ncbs-hippo.readthedocs.io/en/latest/">
          Docs
        </f7-link> |
        <f7-link external target="_system"
          icon="fab fa-github fa-fw"
          class="col-30 medium-25"
          href="https://github.com/dilawar/hippo/">
          Code Repository
        </f7-link> |
        <f7-link external 
          class="col-30 medium-25"
          href="https://ncbs.res.in" 
          target="_system">
          NCBS Bangalore
        </f7-link>
        <!-- bottom row -->
        <div margin-bottom:30px>
          Code licensed under <f7-link>GNU GPLv3</f7-link>, 
          &copy 2018-2020 
          <f7-link external target="_system" href="https://github.com/dilawar">
            Dilawar Singh
          </f7-link>
          Server is provided by NCBS IT Dept.  
          Logo &copy Nuno Jesus.
        </div>
      </f7-block-footer>


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
      charts: {},
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
    /* self.fetchCharts(); */

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
            self.notify('Invalid response from server'
              , 'Is your username/password correct?'
              , 10000);
            app.dialog.close();
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
      // Timeout for a minute.
      setTimeout(() => app.dialog.close(), 60000);
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
