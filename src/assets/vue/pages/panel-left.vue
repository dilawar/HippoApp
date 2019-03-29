<template>
   <f7-page @init="isUserAuthenticated">
      <f7-navbar title="NCBS Hippo"></f7-navbar>

      <f7-block>
         <f7-list media-list no-hairlines>
            <f7-list-item :title="username">
               <f7-button slot="after"
                          fill raised
                          panel-close
                          title="Logout"
                          label="Logout"
                          v-if="alreadyLoggedIn" 
                          @click="signOut">Logout
               </f7-button>
            </f7-list-item>
         </f7-list>
      </f7-block>

      <!-- More information here -->

   </f7-page>

</template>

<script>
   export default {
      data() {
         return {
            alreadyLoggedIn: false,
            username: '',
         };
      },
      mounted()
      {
         const self = this;
         self.alreadyLoggedIn = self.isUserAuthenticated();
         self.username = self.$localStorage.get('HIPPO-LOGIN');
      },
      methods: {
         signOut: function() {
            const self = this;
            console.log( "Signing out.");
            self.$localStorage.set('HIPPO-API-KEY', '');
            self.$localStorage.set('HIPPO-LOGIN', '');
            self.alreadyLoggedIn = false;
            self.$f7router.navigate("/home/");
         },
         isUserAuthenticated: function() {
            // If API key is found then user is logged in.
            const self = this;
            const apiKey = self.$localStorage.get('HIPPO-API-KEY');
            if( apiKey.trim().length > 0 )
            {
               // TODO: Send a request just to verify that key still works.
               self.alreadyLoggedIn = true;
               return true;
            }
            return false;
         },
      },
   }
</script>
