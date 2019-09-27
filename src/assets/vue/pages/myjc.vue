<template>
   <f7-page page-content ptr @ptr:refresh="refreshJC">
      <f7-navbar title="My Journal Clubs" back-link="Back"></f7-navbar>

      <f7-block>
         <f7-list media-list no-hairlines>
            <f7-list-item v-for="(jc, key) in jcs" :key="key" >
               <div slot="header"> {{jc.jc_id}} |
                  {{humanReadableDateTime(jc.date, jc.time)}} at {{jc.venue}}</div>
               <div slot="title"> {{jc.title}} </div>
            </f7-list-item>
         </f7-list>
      </f7-block>

      <f7-block>
         <f7-list accodion-list no-hairlines>
         </f7-list>
      </f7-block>

   </f7-page>

</template>

<script>
   export default {
      data() {
         const self = this;
         return {
            jcs: [],
         };
      },
      mounted()
      {
         const self = this;
         setTimeout(() => self.fetchJC(), 1000);
      },
      methods: {
         fetchJC: function() {
            const self = this;
            self.postWithPromise('/me/jc').then( function(json) {
               let res = JSON.parse(json);
               if(res.status == 'ok')
               {
                  self.jcs = res.data;
                  self.saveStore('me.jcs', res.data);
               }
               else
               {
                  console.log( 'Failed to fetch JC. Loading old data...');
                  self.jcs = self.loadStore('me.jcs');
               }
            });
         },
         refreshJC: function(e, done) {
            const self = this;
            setTimeout( () => self.fetchJC(), 1000);
            done();
         },
      },
   }
</script>
