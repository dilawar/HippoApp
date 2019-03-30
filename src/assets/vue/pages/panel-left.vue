<template>
   <f7-page>
      <f7-navbar title="NCBS Hippo"></f7-navbar>
      <!-- More information here -->
      <f7-block>
         <f7-block-title>Welcome {{username}} </f7-block-title>

         <f7-list>
            <f7-list-item link="/mybooking/" 
                          target="_blank"
                          view=".view-main"
                          title="My Bookings" 
                          panel-close>
               <f7-icon slot="media" icon="fa fa-edit fa-2x"></f7-icon>
            </f7-list-item>
         </f7-list>

      </f7-block>
   </f7-page>
</template>

<script>
   export default {
      data() {
         return {
            username: 'Guest',
         };
      },
      mounted()
      {
         const self = this;
         self.username = self.$localStorage.get('HIPPO-LOGIN');
      },
   }
</script>
