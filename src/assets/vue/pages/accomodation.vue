<template>
  <f7-page page-content ptr @ptr:refresh="fetchAccomodations">

  <f7-navbar title="Accomodation" back-link="Back"></f7-navbar>
  <f7-block-title>Total listings: {{accomodations.count}}</f7-block-title>

  <f7-block>
     <f7-photo-browser ref="standalone"></f7-photo-browser>
     <f7-card 
        v-for="(acc, key) in accomodations.list" :key="key">
        <f7-card-header
              >
           <div style="font-size:x-small;color:gray;">
              Posted by {{acc.created_by}} on {{str2Moment(acc.created_on,
              'YYYY-MM-DD HH:mm:ss').format('MMM DD')}}
           </div>
           <div style="font-size:small"> 
              {{acc.type}} is available from {{str2Moment(acc.available_from,
              'YYYY-MM-DD').format('MMM DD, YY')}} for
              {{acc.open_vacancies}} person(s).
           </div>
        </f7-card-header>
        <f7-card-content>
           <span v-for="(val, key) in acc">
              <span v-if="! hideKeys.find(k=> k===key)">
                 <span style="color:gray;font-size:xx-small">{{formatKey(key)}}</span>
                 <span style="font-size:small">{{val}}</span>
                 <br />
              </span>
           </span>
        </f7-card-content>
        </f7-card-content>
        <f7-card-footer>
           <f7-link v-if="acc.created_by===getLogin()"
                    @click="updateAction(acc)"
              >Update</f7-link>
           <f7-link v-else>+1</f7-link>
           <!-- TODO 
           <f7-link raised @click="showPics(acc)">Pics</f7-link>
           -->
           <f7-link disabled>Comment</f7-link>
        </f7-card-footer>
     </f7-card>
  </f7-block>

  <!-- FAB to create accomodation -->
  <f7-fab v-if="isUserAuthenticated()"
          position="right-bottom" 
          slot="fixed" 
          @click="popupOpened=true"
          color="red">
     <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
  </f7-fab>


  <f7-popup class="accomodation-popup" :opened="popupOpened" @popup:closed="popupOpened = false">
     <f7-page>
        <f7-navbar :title="`${popupAction} Accomodation`">
           <f7-nav-right>
              <f7-link popup-close>Cancel</f7-link>
           </f7-nav-right>
        </f7-navbar>

        <f7-block>

           <f7-list no-hairlines-md inset>
              <f7-list-input label="Type"
                             :value="accomodation.type"
                             @input="accomodation.type = $event.target.value"
                             type="select"
                             defaultValue="1BHK"
                             placeholder="Please choose ..."
                             required 
                             validate
                             >
                             <option v-for="typ in accomodations.types" :value="typ">{{typ}}</option>
              </f7-list-input>

              <f7-list-input label="Available From" :input="false">
                 <date-picker lang="en"
                              v-model="accomodation.available_from"
                              slot="input"
                              type="date"
                              format="YYYY-MM-DD"
                              readonly
                              >
                  </date-picker>
              </f7-list-input>

              <f7-list-input label="Open Vacancies" :input="false" >
                 <f7-range slot="input" 
                           :value="accomodation.open_vacancies"
                           @input="accomodation.open_vacancies=$event.target.value"
                           :min="1" :max="5" :step="1"
                           :label="true"
                           required 
                           >
                 </f7-range>
              </f7-list-input>

              <f7-list-input label="Address"
                             :value="accomodation.address"
                             @input="accomodation.address = $event.target.value"
                             type="textarea" 
                             :resizable="true"
                             required
                             >
              </f7-list-input>

              <f7-list-input label="Description"
                             :value="accomodation.description"
                             @input="accomodation.description = $event.target.value"
                             :resizable="true"
                             type="textarea" 
                             >
              </f7-list-input>
              <f7-list-input label="Owner Contact"
                             :value="accomodation.owner_contact"
                             @input="accomodation.owner_contact = $event.target.value"
                             :resizable="true"
                             required
                             type="textarea" 
                             >
              </f7-list-input>
              <f7-list-input label="Rent"
                             :value="accomodation.rent"
                             @input="accomodation.rent = $event.target.value"
                             required
                             validate
                             pattern="[0-9]{3,7}"
                             >
              </f7-list-input>

              <f7-list-input label="Extra e.g. elecricity water"
                               :value="accomodation.extra"
                               @input="accomodation.extra = $event.target.value"
                               type="text" 
                               >
              </f7-list-input>

              <f7-list-input label="Advance"
                             :value="accomodation.advance"
                             @input="accomodation.advance = $event.target.value"
                             type="text" 
                             validate
                             pattern="[0-9]{3,7}"
                             >
              </f7-list-input>
                 
              <f7-list-input label="Link to photos"
                             :value="accomodation.url"
                             @input="accomodation.url = $event.target.value"
                             type="url" 
                             validate
                             >
              </f7-list-input>

              <f7-list-input label="Change status"
                             :value="accomodation.status"
                             @input="accomodation.status = $event.target.value"
                             type="select"
                             :defaultValue="accomodation.status"
                             info="To cancel change this field"
                             >
                    <option v-for="st in accomodations.status" :value="st">{{st}}</option>
              </f7-list-input>

              <f7-list-item>
                 <f7-button v-if="popupAction=='New'"
                            slot="after" raised fill
                            popup-close
                            @click="submitAccomodation"
                            >Submit</f7-button>
                 <f7-button v-if="popupAction=='Update'"
                            slot="after" raised fill
                            popup-close
                            @click="updateAccomodation(accomodation.id)"
                            >Submit</f7-button>
              </f7-list-item>

           </f7-list>
        </f7-block>

     </f7-page>
  </f7-popup>

  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
   data() {
      const self = this;
      return {
         accomodations: [],
         popupOpened: false,
         hideKeys: ["id", "url", "type", "available_from", "open_vacancies", "status","created_by","created_on"],
         popupAction: 'New',
         photos: [],
         accomodation: {
            type: '',
            status: 'AVAILABLE',
            available_from: '',
            open_vacancies: 1,
            address: '',
            description: '',
            owner_contact: '',
            rent: 0,
            extra: '',
            advance: 0,
            url: '',
         },
      };
   },
   mounted() {
      const self = this;

      // Get all accomodations.
      self.postWithPromise( '/accomodation/list').then(
         function(json) {
            self.accomodations = JSON.parse(json).data;
            self.saveStote('accomodations', self.accomodations);
      });
   },
   methods: { 
      fetchAccomodations: function() {
         const self = this;
         const app = self.$f7;
         setTimeout( () => {
            self.fetchAndStore( '/accomodation/list', 'accomodations');
            self.accomodations = JSON.parse(self.$localStorage.get('accomodations', '[]'));
            return;
         }, 1000);
         app.ptr.done();
      },
      submitAccomodation: function() {
         const self = this;
         console.log( "submitting accomodation");
         // Save it before it goes away.
         self.$localStorage.set('me.accomodation', self.accomodation);
         self.accomodation.available_from = moment(self.accomodation.available_from).format('YYYY-MM-DD')
         let res = self.sendRequest('/accomodation/create', self.accomodation);
         if( res == 'ok')
            self.$localStorage.delete('me.accomodation');
      },
      updateAction: function(acc) {
         const self = this;
         self.accomodation = acc;
         self.popupAction = 'Update';
         self.popupOpened = true;
      },
      updateAccomodation: function(id) 
      {
         const self = this;
         self.popupAction = 'New';
         console.log( 'Updating id: ', id);
         self.accomodation.available_from = self.dbDate(self.accomodation.available_from);
         self.sendRequest('/accomodation/update/id', self.accomodation);
         return;
      },
      readMore: function(obj) {
         const self = this;
         console.log( obj );
      },
      getNumVotes: function(externalID) {
         return 0;
      },
      showPics: function(acc) {
         const self = this;
         self.$refs.standalone.photos = [ acc.url ];
         self.$refs.standalone.open();
      },
   },
};
</script>
