<template>
   <f7-page>

      <f7-navbar>
         <f7-nav-left>
            <f7-link class="panel-open" open-panel="left" icon="fa fa-bars"></f7-link>
         </f7-nav-left>
         <div class="title">NCBS Hippo</div>
      </f7-navbar>

      <f7-block v-if="alreadyLoggedIn">
         <f7-list class="components-list" no-hairlines>

            <f7-list-item link="/booking/" title="Create Booking" panel-close>
               <f7-icon slot="media" icon="fa fa-clipboard fa-2x"></f7-icon>
            </f7-list-item>

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
         <f7-row> 
            <f7-col>
               <f7-button raised large fill 
                  login-screen-open=".hippo-login-screen"
                  >Login
               </f7-button>
            </f7-col>
         </f7-row>
      </f7-block>

      <!-- Other elements -->
      <f7-login-screen class="hippo-login-screen" 
                       :opened="loginScreenOpened" 
                       @loginscreen:closed="loginScreenOpened = false"
                       >

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
                          <f7-list>
                             <f7-list-button @click="signIn" 
                                button-fill
                                button-raised 
                                login-screen-close
                                >Sign In</f7-list-button>
                             <f7-block-footer>
                                Use your NCBS/InSTEM/Others credentials. Verify
                                that you can login to <a _target="blank"
                                                href="https://ncbs.res.in/hippo">Hippo
                                                Website</a>.
                             </f7-block-footer>
                          </f7-list>
                       </f7-page>
      </f7-login-screen>

   </f7-page>
</template>

<script>
   export default {
      data() {
         return {
            loginScreenOpened: false,
            alreadyLoggedIn: false,
            username: '',
            password: '',
         };
      },
      mounted()
      {
         const self = this;
         self.alreadyLoggedIn = self.isUserAuthenticated();
      },
      methods: {
         signIn: function()
         {
            const self = this;
            const app = self.$f7;

            app.request.post(self.$store.state.api + '/authenticate'
               , {'login':self.username, 'password': btoa(self.password)}
               , function(json) 
               {
                  var res = JSON.parse(json);
                  if( res.status =='ok' && res.data.apikey != '')
                  {
                     self.$localStorage.set('HIPPO-API-KEY', res.data.apikey);
                     self.$localStorage.set('HIPPO-LOGIN', self.username);

                     // Perfect. Refresh page.
                     self.$f7router.refreshPage();
                  }
                  else
                     app.dialog.alert(`Failed to login. Try again.`);
               }
            );
         },
         signOut: function() {
            const self = this;
            console.log( "Signing out.");
            self.$localStorage.set('HIPPO-API-KEY', '');
            self.$localStorage.set('HIPPO-LOGIN', '');
         },
         isUserAuthenticated: function() {
            // If API key is found then user is logged in.
            const self = this;
            const apiKey = self.$localStorage.get('HIPPO-API-KEY');
            if( apiKey.trim().length > 0 )
               return true;
            return false;
         },
      },
   }
</script>
