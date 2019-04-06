<template>
   <f7-page page-content ptr @ptr:refresh="fetchProfile">
      <f7-navbar title="My AWS" back-link="Back"></f7-navbar>

      <f7-block>
         <f7-list class="components-list" no-hairlines>

         </f7-list>
      </f7-block>

      <!-- FAB Right Bottom (Blue) -->
      <f7-fab position="right-bottom" slot="fixed" color="blue">
         <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
         <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
         <f7-fab-buttons position="top">
         </f7-fab-buttons>
      </f7-fab>

      <f7-block v-for="(aws, key) in awses" :key="key">
         <f7-block-header> {{aws.title}} </f7-block-header>
         <f7-list >
            <f7-list-item
               :header="aws.venue"
               :footer="str2Moment(aws.date+' '+aws.time, 'YYYY-MM-DD HH:mm:ss').format('ddd, MMM DD, YYYY, hh:mm A')"
               >
            </f7-list-item>
               <f7-list-item style="width:90%">
                  <span inset style="font-size:small" v-html="aws.abstract"></span>
               </f7-list-item>
         </f7-list>
      </f7-block>

   </f7-page>

</template>

<script>
   export default {
      data() {
         const self = this;
         return {
            awses: [],
         };
      },
      mounted()
      {
         const self = this;
         const app = self.$f7;
         self.fetchAndStore( '/me/aws', 'me.aws');
         self.awses = JSON.parse( self.$localStorage.get('me.aws', '[]'));
      },
      methods: {
      },
   }
</script>
