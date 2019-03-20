<template>
  <f7-page>
    <f7-block-title>Hippo</f7-block-title>
    <f7-block>
    </f7-block>

    <!--<f7-block-title>Main View Navigation</f7-block-title>-->

    <f7-list>
        <f7-list-item link="/login-screen-page/" 
                      title="As separate page"></f7-list-item>

        <f7-list-item link="/info/" title="Info" panel-close></f7-list-item>

        <f7-login-screen class="demo-login-screen" 
                         :opened="loginScreenOpened" 
                         @loginscreen:closed="loginScreenOpened=false"
                         >

                         <f7-list form>
                             <f7-list-input label="Username" 
                                            type="text"
                                            placeholder="Your username"
                                            :value="username"
                                            @input="username=$event.target.value"
                                            ></f7-list-input>
                         </f7-list>
            <f7-list>
                <f7-list-button @click="signIn">Sign In</f7-list-button>
                <f7-block-footer>Some text about login information.<br>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</f7-block-footer>
            </f7-list>


        </f7-login-screen>

    </f7-list>
    <f7-block>
    </f7-block>
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
      signIn() {
        const self = this;
        const app = self.$f7;

        app.dialog.alert(`Username: ${self.username}<br>Password: ${self.password}`, () => {
          app.loginScreen.close();
        });
      },
    },
  };
</script>
