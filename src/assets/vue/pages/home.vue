<template>
   <f7-page @page:init="reinit">

      <f7-navbar>
         <f7-nav-left>
            <f7-link panel-open="left" icon="fa fa-bars"> </f7-link>
         </f7-nav-left>
         <f7-nav-title>Hippo</f7-nav-title>
         <f7-nav-right v-if="alreadyLoggedIn">
            <f7-link icon="fa fa-sign-out fa-1x" @click="signOut" 
                     header="Logout"
                     slot="media">
            </f7-link>
         </f7-nav-right>
      </f7-navbar>

      <f7-block v-model="alreadyLoggedIn" v-if="alreadyLoggedIn">
         <f7-list class="components-list" no-hairlines>

            <f7-list-item link="/mybooking/" title="My Bookings" panel-close>
               <f7-icon slot="media" icon="fa fa-edit fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/events/" title="Events" panel-close>
               <f7-icon slot="media" icon="fa fa-calendar fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/transport/" title="Transport" panel-close>
               <f7-icon slot="media" icon="fa fa-bus fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/search/" title="Search" panel-close>
               <f7-icon slot="media" icon="fa fa-search fa-2x"></f7-icon>
            </f7-list-item>
         </f7-list>

      </f7-block>
      <f7-block v-else>
         <f7-list media-list no-hairlines>
            <f7-list-item>
               <font v-if="isHippoAlive" slot="footer">Hippo is alive. You may login.</font>
               <font v-else slot="footer">
                  Hippo is not responding. Is it alive?!  <br />
                  You can try login but I woudn't count on it.
               </font>
               <f7-button slot="root"
                          raised fill
                          login-screen-open=".hippo-login-screen"
                          >Login</f7-button>
            </f7-list-item>
         </f7-list>
      </f7-block>

      <!-- FAB -->
      <!-- FAB Right Bottom (Blue) -->
      <f7-fab v-if="alreadyLoggedIn" position="right-bottom" slot="fixed" color="blue">
         <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
         <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
         <f7-fab-buttons position="top">
            <f7-fab-button href="/booking/" fab-close 
                           target="_blank"
                           label="Create new booking"
                           >B</f7-fab-button>
         </f7-fab-buttons>
      </f7-fab>


      <!-- Other elements -->
      <f7-login-screen class="hippo-login-screen">
        <f7-page login-screen>
           <f7-login-screen-title>Login</f7-login-screen-title>
           <f7-list form>
              <f7-list-input
                 label="Username"
                 type="text"
                 placeholder="Your username"
                 :value="username"
                 @input="username = $event.target.value"
                 ></f7-list-input>
              <f7-list-input
                 label="Password"
                 type="password"
                 placeholder="Your password"
                 :value="password"
                 @input="password = $event.target.value"
                 ></f7-list-input>
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
         self.alreadyLoggedIn = self.isUserAuthenticated();

         // Check if hippo is alive
         app.request.post(self.$store.state.api + '/status'
            , function(json) 
            {
               var res = JSON.parse(json);
               if( res.status =='ok' && res.data.status == 'alive')
               {
                  self.isHippoAlive = true;
               }
            }
         );

         // Fetch the available classes of booking. 
         app.request.post( self.$store.state.api+'/config/bookmyvenue.class'
            , self.apiPostData()
            , function(json) 
            {
               const res = JSON.parse(json);
               if( res.status=='ok')
                  self.$localStorage.set('classes', res.data.value);
            }
         );
      },
      methods: {
         signIn: function()
         {
            const self = this;
            const app = self.$f7;

            app.dialog.preloader("Loging in ...");
            app.request.post(self.$store.state.api + '/authenticate'
               , {'login':self.username, 'password': btoa(self.password)}
               , function(json) 
               {
                  var res = JSON.parse(json);
                  if( res.status =='ok' && res.data.apikey != '')
                  {
                     self.$localStorage.set('HIPPO-API-KEY', res.data.apikey);
                     self.$localStorage.set('HIPPO-LOGIN', self.username);
                     self.isUserAuthenticated = true;
                     self.$f7router.refreshPage();
                  }
                  else
                  {
                     app.dialog.alert("Failed to login. Try again.", "Error");
                  }
               }
            );
            setTimeout(() => app.dialog.close(), 200);
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
            console.log( "Calling reinit on home" );
            const self = this;
            self.isUserAuthenticated();
            console.log( "User logged in " + self.alreadyLoggedIn );
         },
      },
   }
</script>
