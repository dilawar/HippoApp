<template>
   <f7-page page-content ptr @ptr:refresh="refreshJC">
      <f7-navbar title="Journal Clubs" back-link="Back"></f7-navbar>

      <f7-block>
        <f7-list media-list no-hairlines accordion-list>
          <f7-list-item v-for="(jc, key) in jcs" :key="key" accordion-item>
            <div slot="footer">By {{jc.presenter}} |  Acknowleged: {{jc.acknowledged}} </div>
            <div slot="header"> 
                <span v-if="isMyJC(jc.jc_id)" style="float:right">(subscribed)</span>
                {{jc.jc_id}} | {{humanReadableDateTime(jc.date,jc.time)}} at {{jc.venue}}
            </div>
            <div slot="title"> {{jc.title}} </div>
            <f7-accordion-content style="background-color:Ivory">
              <span inset style="font-size:small" v-html="jc.description"></span>
              <f7-button>DUM</f7-button>
            </f7-accordion-content>
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
     data()
     {
       const self = this;
       return {
         jcs: [],
         myjcs: [],
       };
     },
     mounted()
     {
       const self = this;
       setTimeout(() => self.fetchJC(), 1000);
     },
     methods: {
       fetchJC: function() 
       {
         const self = this;
         self.myjcs = Object.keys(self.loadStore('me.profile').jcs);
         console.log( "My JCS ", self.myjcs);
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
       isMyJC: function(jc) {
         const self = this;
         if(self.myjcs)
           return self.myjcs.includes(jc);
         return false;
       },
     },
   }
</script>
