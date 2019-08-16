<template>
   <f7-page page-content ptr @ptr:refresh="refreshAWS">
      <f7-navbar title="My AWS" back-link="Back"></f7-navbar>

      <f7-block>
         <f7-list class="components-list" no-hairlines>

         </f7-list>
      </f7-block>

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
            setTimeout( () => self.fetchAws(), 1000);
      },
      methods: {
         fetchAws: function() {
            const self = this;
            self.postWithPromise('/me/aws').then( function(json) {
               let res = JSON.parse(json);
               if(res.status == 'ok')
                  self.saveStore('me.aws', res.data);
               else
                  console.log( 'Failed to fetch data');
               self.awses = self.loadStore('me.aws');
            });
         },
         refreshAWS: function(e, done) {
            const self = this;
            setTimeout( () => self.fetchAws(), 1000);
            done();
         },
      },
   }
</script>
