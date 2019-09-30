<template>
   <f7-page page-content ptr @ptr:refresh="refreshJC">
      <f7-navbar title="Journal Clubs" back-link="Back"></f7-navbar>

      <f7-block :v-if="isAdminOfAnyJC()">
        <!-- <f7-block-title>Admin Interface</f7-block-title> -->
        <f7-row>
          <f7-col>
            <f7-link @click="managePresentation()">Manage Presentations</f7-link>
          </f7-col>
          <f7-col>
            <f7-link @click="manageSubscription()">Manage Subscription</f7-link>
          </f7-col>
        </f7-row>

        <f7-block-title>Upcoming Journal Clubs</f7-block-title>
        <f7-list media-list no-hairlines accordion-list>
          <f7-list-item v-for="(jc, key) in jcs" :key="key" accordion-item>
            <div slot="footer">By {{jc.presenter}} |  Acknowleged: {{jc.acknowledged}} </div>
            <div slot="header"> 
                {{jc.jc_id}} | {{humanReadableDateTime(jc.date,jc.time)}} at {{jc.venue}}
            </div>
            <div slot="title"> {{jc.title}} </div>
            <f7-accordion-content style="background-color:Ivory">
              <span inset style="font-size:small" v-html="jc.description"></span>

              <div style="background-color:white">
              <f7-row>
                <f7-col v-if="isPresenterMe(jc.presenter) && jc.acknowledged==='NO'">
                  <f7-button small raise @click="acknowledgeJC(jc.id)">Acknowledge</f7-button>
                </f7-col>
                <f7-col v-if="amIJCAdmin(jc.jc_id)">
                  <f7-button small raise @click="removeJC(jc.id)">Remove</f7-button>
                </f7-col>
                <f7-col v-if="isPresenterMe(jc.presenter) || amIJCAdmin(jc.jc_id)">
                  <f7-button small raise @click="editJC(jc)">Edit</f7-button>
                </f7-col>
              </f7-row>
              </div>
            </f7-accordion-content>
          </f7-list-item>
        </f7-list>
      </f7-block>

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

      <!-- ADMIN POPUP -->
      <f7-popup :opened="jcAdminPopup" @popup:closed="jcAdminPopup=false">
        <f7-page>
          <f7-navbar :title="popupTitle">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>

          <f7-block>
             <f7-list media-list no-hairlines>
                <!-- list of USER jc for which she is admin -->
                <f7-list-input label="Your JC"
                               type="select"
                               @input="fetchJCInfo($event.target.value)"
                               >
                     <option value="None">Please choose ... </option>
                     <option v-for="(jcid, key) in myJCWithAdminRights()"
                             :value="jcid"
                             >{{jcid}}
                     </option>
                </f7-list-input>

                <f7-list-input label="Presenter"
                               :value="thisJC.presenter"
                               @input="thisJC.presenter = $event.target.value"
                               :required="true"
                               >
                </f7-list-input>

                <!--
                <f7-list-input label="Date"
                               type="date" 
                               placeholder="Select date" 
                               :value="thisJC.date"
                               @input="thisJC.date = $event.target.value"
                               :required="true"
                               >
                </f7-list-input>

                <f7-list-input label="Time"
                               type="time"
                               :value="thisJC.time"
                               @input="thisJC.time = $event.target.value"
                               >
                </f7-list-input>
                -->
                <f7-list-item>
                  <date-picker lang="en" 
                               placeholder="Date"
                               type="date"
                               format="YYYY-MM-DD" 
                               :value="thisJC.date"
                               v-model="thisJC.date"
                               >
                  </date-picker>
                </f7-list-item>

                <f7-list-item>
                  <date-picker lang="en" 
                               placeholder="Time"
                               type="time"
                               format="HH:mm A" 
                               v-model="thisJC.time"
                               :time-select-options="{step: '00:15'}"
                               >
                  </date-picker>
                </f7-list-item>

                <f7-list-input label="Venue" 
                               type="select"
                               @input="thisJC.venue = $event.target.value"
                               >
                  <option :value="thisJC.venue" selected> 
                    {{thisJC.info.venue}}
                  </option>
                  <option v-for="(venue, id) in venues" 
                          :key="id" :value="venue.id"
                          >
                    {{venue.id}}
                  </option>
                </f7-list-input>

                <f7-button small raised @click="assignPresenter()">
                  Assign
                </f7-button>
             </f7-list>
          </f7-block>

        </f7-page>
      </f7-popup>
   </f7-page>

</template>

<script>
   export default {
     data()
     {
       const self = this;
       return {
         jcs: [],
         venues: {},
         myjcs: [],
         popupOpened: false,
         jcAdminPopup: false,
         popupTitle: 'Invalid title',
         subscriptions: {},
         thisJCSubscrptionsListStr: "",
         thisJC: { title: ''
           , jc_id: ''
           , presenter: ''
           , description: '' 
           , url: ''
           , paperurl: ''
           , date: ''
           , time: ''
           , venue: ''
           , info: {venue: '', time:''}  // Store default parameters and other info.
         },
       };
     },
     mounted()
     {
       const self = this;
       if(! self.venues)
         self.fetchVenues();
       else
         self.venues = self.loadStore('venues');
       self.fetchJC();
     },
     methods: {
       fetchJC: function() 
       {
         const self = this;
         self.myjcs = self.loadStore('me.profile').jcs;
         console.log( "My JCS ", self.myjcs);
         self.postWithPromise('/me/jc').then( function(json) {
           let res = JSON.parse(json);
           self.jcs = res.data;
           self.saveStore('me.jcs', res.data);
           });
       },
       myJCWithAdminRights: function() {
         const self = this;
         var adminJCS = Object.keys(self.myjcs).filter( 
           x => self.myjcs[x]['subscription_type'] === 'ADMIN'
         );
         return adminJCS;
       },
       fetchJCInfo: function(jcid)
       {
         const self = this;
         self.thisJC.jc_id = jcid;

         self.postWithPromise('/jc/info/'+jcid)
           .then( function(json) {
             let res = JSON.parse(json);
             self.thisJC.info = res.data;
             // Add time.
             self.thisJC.time = self.thisJC.info.time;
             self.thisJC.venue = self.thisJC.info.venue;
           });

         if(! self.subscriptions.hasOwnProperty(jcid)) 
         {
           self.postWithPromise('/jc/subscriptions/'+jcid)
             .then( function(json) {
               let res = JSON.parse(json);
               self.subscriptions[jcid] = res.data;
             });
         }
         // self.thisJCSubscrptionsListStr = JSON.stringify(Object.keys(self.subscriptions)
         //   .forEach( key => { return self.subscriptions[key].login; })
         // );
         // console.log('subscriptions', self.thisJCSubscrptionsListStr);
       },
       refreshJC: function(e, done) {
         const self = this;
         setTimeout(() => self.fetchJC(), 500);
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
       isAdminOfAnyJC: function() {
         const self = this;
         Object.keys(self.myjcs).forEach( function(key) {
           if(self.myjcs[key]['subscription_type'] === 'ADMIN')
             return true;
         });
         return false;
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
         self.promiseWithAuth('/jc/update', self.thisJC).then(
           function(json) {
             self.fetchJC();
           }
         );
       },
       acknowledgeJC: function(jcid) {
         const self = this;
         setTimeout( () => {
           self.sendRequest('/jc/acknowledge/' + jcid)
           self.fetchJC();
         }, 1000);
       },
       removeJC: function(jcid) {
         const self = this;
         setTimeout( () => {
           self.sendRequest('/jc/remove/' + jcid)
           self.fetchJC();
         }, 1000);
       },
       managePresentation: function() {
         const self = this;
         self.popupTitle = "Assign presenter";
         self.jcAdminPopup = true;
       },
       manageSubscription: function() {
         const self = this;
         self.popupTitle = "Manage subscription";
         self.jcAdminPopup = true;
       },
       assignPresenter: function() {
         const self = this;
         console.log('Submitting', self.thisJC);
         //self.promiseWithAuth('/jc/assign', self.thisJC).then(
         //  function(json) {
         //    self.fetchJC();
         //  });
         //self.jcAdminPopup = false;
       },
     },
   }
</script>
