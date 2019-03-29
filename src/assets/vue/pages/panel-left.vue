<template>
   <f7-page>
      <f7-navbar title="NCBS Hippo"></f7-navbar>
      <!-- More information here -->
      <f7-block>
         <f7-block-title>Welcome {{username}} </f7-block-title>

         <f7-list>
         </f7-list>

      </f7-block>

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
   }
</script>
