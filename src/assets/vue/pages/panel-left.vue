<template>
  <f7-page>
    <f7-navbar title="NCBS"></f7-navbar>

    <f7-block v-if="showLogin">
      <f7-button v-if="showLogin" raised large fill login-screen-open=".hippo-login-screen">Login</f7-button>
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
          <f7-list-button @click="signIn">Sign In</f7-list-button>
          <f7-block-footer>
            Use your NCBS intranet username password or generate an app specific
            password in Hippo.
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
        username: '',
        password: '',
      };
    },
    methods: {
      signIn()
      {
        const self = this;
        const app = self.$f7;

        // Try to connect.
        console.log( 'Already logged in is' + self.$store.state.user );

        if(! self.$store.state.alreadyLoggedIn)
        {
          app.request.post(self.$store.state.api + '/authenticate'
            , {'login':self.username, 'password': btoa(self.password)}
            , function(json) 
            {
              var res = JSON.parse(json);
              if( res.status =='ok' && res.data.apikey != '')
              {
                self.$store.commit('USER_LOGGED', self.username);
                self.$store.commit('HIPPO_API_KEY', res.data.apikey);
                app.dialog.alert(`Success.`, () => {app.loginScreen.close()});
                self.$localStorage.set('HIPPO-API-KEY', res.data.apikey);
                self.$localStorage.set('HIPPO-LOGIN', self.username);
              }
              else
                app.dialog.alert(`Failed to login. Try again.`);
            }
          );
        }
        else
        {
          app.dialog.alert(`You are already logged in!`, ()=>{app.loginScreen.close()});
        }
      },
    },
    computed : {
      showLogin () {
        return ! this.$store.state.alreadyLoggedIn;
      }
    }
  };
</script>
