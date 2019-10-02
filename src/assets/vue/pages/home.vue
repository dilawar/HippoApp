<template>
   <f7-page @page:init="reinit">

      <f7-navbar>
         <f7-nav-left>
            <!-- LEFT PANEL -->
            <f7-link v-if="alreadyLoggedIn" 
                     panel-open="left" 
                     icon="fa fa-bars fw"
                     >
            </f7-link>
            <!-- <f7-link v-else  -->
                     <!-- icon="fa fa-bars"  -->
                     <!-- @click="youAreNotLoggedIn"> -->
            <!-- </f7-link> -->
         </f7-nav-left>
         <f7-nav-title>Hippo</f7-nav-title>
         <f7-nav-right>
            <f7-link v-if="alreadyLoggedIn"
                     icon="fa fa-sign-out fw" @click="signOut" 
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

            <!-- RIGHT PANEL -->
            <f7-link v-if="alreadyLoggedIn && isAdmin()" 
                     panel-open="right" 
                     icon="fa fa-bars fw"
                     color="red"
                     >
            </f7-link>
            <!-- <f7-link v-else  -->
                     <!-- icon="fa fa-bars"  -->
                     <!-- @click="youAreNotLoggedIn"> -->
            <!-- </f7-link> -->
         </f7-nav-right>
      </f7-navbar>

      <f7-block>
         <f7-list media-list no-hairlines>
            <f7-list-item v-if="alreadyLoggedIn" 
                          link="/whatwherewhen/"
                          title="What? Where? When?" panel-close
                          footer="What is going on at different venues?"
                          panel-close>
               <f7-icon slot="media" icon="fa fa-calendar fa-2x"></f7-icon>
            </f7-list-item>
            <f7-list-item link="/transport/" 
                          title="Transport" 
                          footer="Timetable of shuttle and buggy"
                          panel-close>
               <f7-icon slot="media" icon="fa fa-bus fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item v-if="alreadyLoggedIn" 
                          link="/search/" 
                          title="Search" 
                          footer="Limited information from Interanet search"
                          panel-close>
               <f7-icon slot="media" icon="fa fa-search fa-2x"></f7-icon>
            </f7-list-item>
            <f7-list-item v-if="alreadyLoggedIn"
                          link="/inventory/" 
                          title="Inventory" 
                          footer="Search and borrow"
                          panel-close>
               <f7-icon slot="media" icon="fa fa-archive fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/accomodation/" 
                          title="Accomodations" 
                          footer="Browse/create TO-LET listing"
                          panel-close>
            <f7-icon slot="media" icon="fa fa-home fa-2x"></f7-icon>

         </f7-list-item>

         <f7-list-item link="/noticeboards/all" 
                       title="Notice Board" 
                       footer="Because you hate spamming mailing list"
                       panel-close>
            <f7-icon slot="media" icon="fa fa-bullhorn fa-2x"></f7-icon>
         </f7-list-item>

         </f7-list>
      </f7-block>

      <f7-block v-if="! alreadyLoggedIn">
         <f7-list media-list no-hairlines>
            <f7-list-item>
               <div slot="after">
                  <font v-if="isHippoAlive">Hippo is alive. You may login.</font>
                  <font v-else>
                     <f7-preloader color="blue"></f7-preloader> Pinging Hippo ...
                  </font>
               </div>
            </f7-list-item>
            <f7-list-item>
               <f7-row slow="root">
                  <f7-col>
                  </f7-col>
                  <f7-col>
                     <f7-button raised fill login-screen-open=".hippo-login-screen">Login</f7-button>
                  </f7-col>
               </f7-row>
            </f7-list-item>
         </f7-list>
      </f7-block>
      <f7-block v-else></f7-block>

      <!-- FAB Right Bottom (Blue) -->
      <f7-fab v-if="alreadyLoggedIn" position="right-bottom" slot="fixed" color="green">
         <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
         <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
         <f7-fab-buttons position="left">
            <f7-fab-button fab-extended
                           href="/booking/" fab-close 
                           tooltip="Create new booking" >
                  <f7-icon icon="fa fa-calendar-plus-o fa-fw"></f7-icon>
            </f7-fab-button>
         </f7-fab-buttons>
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

           <f7-block>
              <f7-row>
                 <f7-col width="45">
                    <f7-button login-screen-close raised login-screen-close>Cancel</f7-button>
                 </f7-col>
                 <f7-col width="45">
                    <f7-button @click="signIn" raised login-screen-close>Sign In</f7-button>
                 </f7-col>
              </f7-row>

              <f7-block-footer>
                 Use your NCBS/InSTEM/Others credentials. Verify
                 that you can login to <a _target="blank" href="https://ncbs.res.in/hippo">
                    Hippo Website</a>.
              </f7-block-footer>
           </f7-block>
        </f7-page>
      </f7-login-screen>

   </f7-page>

</template>

<script>
   export default {
      data() {
         return {
            alreadyLoggedIn: false,
            isHippoAlive: false,
            username: '',
            password: '',
         };
      },
      mounted()
      {
         const self = this;
         const app = self.$f7;
         var $$ = this.$$;

         // Listen to Cordova's backbutton event
         document.addEventListener('backbutton', function navigateBack() {
            // Use Framework7's router to navigate back
            var mainView = app.views.main;

            var leftp = app.panel.left && app.panel.left.opened;
            var rightp = app.panel.right && app.panel.right.opened;

            if (leftp || rightp) {

               app.panel.close();
               return false;
            } else if ($$('.modal-in').length > 0) {

               app.dialog.close();
               app.popup.close();
               return false;
            } else if (app.views.main.router.url == '/') {
               navigator.app.exitApp();
            } else {
               mainView.router.back();
            }
         }, false);

         self.alreadyLoggedIn = self.isUserAuthenticated();

         // Check if hippo is alive
         setTimeout( () =>
            app.request.post(self.$store.state.api + '/status'
               , function(json) 
               {
                  var res = JSON.parse(json);
                  if( res.status =='ok' && res.data.status == 'alive')
                  {
                     self.isHippoAlive = true;
                  }
               })
            , 1000);

         // Fetch the transport as well.
         setTimeout( () => {
            app.request.post( self.$store.state.api+'/transport'
               , self.apiPostData()
               , function(json) 
               {
                  const res = JSON.parse(json);
                  if( res.status=='ok')
                     self.$localStorage.set('transport', JSON.stringify(res.data));
               }
            );
         }, 2000);

         // Get notification now and display them.
         setTimeout(() => {self.fetchNotifications();}, 500);
         setTimeout(() => {self.displayNotifications();}, 500);
         // Call fetchNotifications in the background. every minutes.
         // FIXME:  Make it very 10 minutes later.
         setInterval( function() {
            console.log("Fetching notitication");
            try {
               self.fetchNotifications()
            } catch (e) {
               /* handle error */
               console.log( "Could not fetch notifications.");
            }
         }, 30*60*1000);

         setInterval( function() {
            try {
               self.displayNotifications()
            } catch (e) {
               /* handle error */
               console.log("Could not display notifications.");
            }
         }, 60*60*1000);
      },
      methods: {
         signIn: function()
         {
            const self = this;
            const app = self.$f7;
            app.dialog.preloader("Loging in ...");
            app.request.promise.post( self.$store.state.api+"/authenticate"
               , {"login":self.username, "password": btoa(self.password)}
               ).then( function(json) {
                  var res = JSON.parse(json);
                  if( res.status =='ok' && res.data.apikey != '')
                 {
                   self.$localStorage.set('HIPPO-API-KEY', res.data.apikey);
                   self.$localStorage.set('GOOGLE-MAP-API-KEY', res.data.gmapapikey);
                   self.$localStorage.set('HIPPO-LOGIN', self.username);
                   self.isUserAuthenticated = true;
                   self.fetchProfile();
                   self.$f7router.refreshPage();
                 }
                 else
                   app.dialog.alert("Failed to login. Try again.", "Error");
                 app.dialog.close();
               });
            setTimeout(() => app.dialog.close(), 2000);
         },
         signOut: function() {
            const self = this;
            console.log( "Signing out.");
            self.$localStorage.set('HIPPO-API-KEY', '');
            self.$localStorage.set('HIPPO-LOGIN', '');
            self.isUserAuthenticated = false;
            self.$f7router.refreshPage();
         },
         reinit: function() {
            const self = this;
            self.isUserAuthenticated();
            console.log( "User logged in " + self.alreadyLoggedIn );
         },
         youAreNotLoggedIn: function() {
            const app = this.$f7;
            app.dialog.alert("Access denied. Login first.", "Prohibited");
         },
         isAdmin: function() 
         {
            const self = this;
            var roles = self.getRoles();
            if(roles.includes("ADMIN") 
               || roles.includes("BOOKMYVENU_ADMIN") 
               || roles.includes("ACAD_ADMIN")
               )
               return true;
            return false;
         },
         shutdown: function() {
            navigator.app.exitApp();
         },
      },
   }
</script>
