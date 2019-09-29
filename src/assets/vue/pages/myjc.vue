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

              <div style="background-color:white">
              <f7-row>
                <f7-col v-if="isPresenterMe(jc.presenter) && jc.acknowledged==='NO'">
                  <f7-button small raise>Acknowledge</f7-button>
                </f7-col>
                <f7-col v-if="amIJCAdmin(jc.jc_id)">
                  <f7-button small raise>Remove</f7-button>
                </f7-col>
                <f7-col v-if="isPresenterMe(jc.presenter) || amIJCAdmin(jc.jc_id)">
                  <f7-button small raise @click="editJC(jc)">Edit</f7-button>
                </f7-col>
              </f7-row>
              </div>

            </f7-accordion-content>
          </f7-list-item>
        </f7-list>

        <!-- POPUP -->
        <f7-popup :opened="popupOpened" @popup:closed="popupOpened = false">
          <f7-page>
            <f7-navbar :title="popupTitle">
              <f7-nav-right>
                <f7-link popup-close>Close</f7-link>
              </f7-nav-right>
            </f7-navbar>
            <f7-block>

               <f7-list media-list>
                  <f7-list-input label="Title"
                                 resizable
                                 @input="thisJC.title = $event.target.value"
                                 :value="thisJC.title"
                                 >
                  </f7-list-input>

                  <f7-list-input label="Description"
                                 resizable
                                 :value="thisJC.description"
                                 @input="thisJC.description = $event.target.value"
                                 type="textarea"
                                 >
                  </f7-list-input>

                  <f7-list-input label="Paper URL"
                                 :value="thisJC.url"
                                 @input="thisJC.url = $event.target.value"
                                 >
                  </f7-list-input>

                  <f7-button small raised fill
                             @click="submitJCChanges()"
                     >Submit</f7-button>
               </f7-list>

            </f7-block>
          </f7-page>
        </f7-popup>

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
         popupOpened: false,
         popupTitle: 'Invalid title',
         thisJC: { title: ''
            , description: '' 
            , url: ''
            , paperurl: ''
         },
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
         self.myjcs = self.loadStore('me.profile').jcs;
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
           return Object.keys(self.myjcs).includes(jc);
         return false;
       },
       isPresenterMe: function(presenter) {
         const self = this;
         return presenter === self.whoAmI();
       },
       amIJCAdmin: function(jcid) {
         const self = this;
         if(! self.myjcs)
            return false;
         if( ! Object.keys(self.myjcs).includes(jcid))
           return false;
         return self.myjcs[jcid]['subscription_type'] === 'ADMIN';
       },
       editJC: function(jc) {
         const self = this;
         self.thisJC = jc;
         console.log('This JC: ', self.thisJC);
         self.popupTitle = 'Editing JC entry';
         self.popupOpened = true;
       },
       submitJCChanges: function() {
          const self = this;
          self.popupOpened = false;
          setTimeout(self.sendRequest('/jc/update', self.thisJC), 1000);
          setTimeout(self.fetchJC(), 1000);
       },
     },
   }
</script>
