<template>
   <f7-page page-content ptr @ptr:refresh="fetchAws">
      <f7-navbar title="My AWS" back-link="Back"></f7-navbar>

      <f7-block>
         <f7-list class="components-list" no-hairlines>

         </f7-list>
      </f7-block>

      <!-- 
      <f7-fab position="right-bottom" slot="fixed" color="blue">
         <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
         <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
         <f7-fab-buttons position="top">
         </f7-fab-buttons>
      </f7-fab>
      -->

      <f7-block>
         <f7-block-title>Annual Work Seminar</f7-block-title>
         <f7-list accodion-list no-hairlines>
            <f7-list-item accordion-item 
                          v-for="(aws, key) in awses" :key="key"
                          :header="aws.venue"
                          :footer="str2Moment(aws.date+' '+aws.time,'YYYY-MM-DD HH:mm:ss').format('ddd, MMM DD, YYYY, hh:mm A')"
                          >
                 <f7-accordion-content style="background-color:Ivory">
                    <span inset style="font-size:small" v-html="aws.abstract"></span>
                 </f7-accordion-content>
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
         self.awses = self.loadStore('me.aws');
         if(! self.awses )
            self.fetchAws();
      },
      methods: {
         fetchAws: function( ) {
            const self = this;
            const app = self.$f7;
            app.dialog.preloader();
            self.postWithPromise('/me/aws').then( function(json) {
               let res = JSON.parse(json);
               if(res.status == 'ok')
                  self.saveStore('me.aws', res.data);
               else
                  console.log( 'Failed to fetch data');
               self.awses = self.loadStore('me.aws');
               self.dialog.close();
            });
            setTimeout( () => self.dialog.close(), 1000);
         },
      },
   }
</script>
