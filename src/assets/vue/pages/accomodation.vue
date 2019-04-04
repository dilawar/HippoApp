<template>
  <f7-page page-content ptr @ptr:refresh="fetchAccomodations">

  <f7-navbar title="Accomodation" back-link="Back"></f7-navbar>
  <f7-block-title> Total {{accomodations.count}} available.</f7-block-title>

  <f7-block>
     <f7-list accordion-list no-hairlines>
        <f7-list-item v-for="(acc, key) in accomodations.list" 
                      accordion-item   
                      :key="key"
                      :header="`${acc.type} is available from
                         ${acc.available_from} for ${acc.open_vacancies} person(s)`"
                      :footer="`Posted by ${acc.created_by} on 
                         ${str2Moment(acc.created_on, 'YYYY-MM-DD HH:mm:ss').format('MMM DD')}`"
                      >
                      <f7-accordion-content>
                         <f7-block inset style="background-color:lightcyan">
                            <span v-for="(val, key) in acc">
                               <span v-if="! hideKeys.find(k=> k===key)">
                                  <span style="color:gray;font-size:xx-small">{{formatKey(key)}}</span>
                                  <span style="font-size:small">{{val}}</span>
                                  <br />
                               </span>
                            </span>
                            <br />
                         </f7-block>
                      </f7-accordion-content>
        </f7-list-item>
     </f7-list>
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
        <f7-navbar title="Create Accomodation">
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

              <f7-list-input label="Open Vacancies" :input="false" 
                             >
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

                    <!--
                       <f7-list-input label="Location"
                       type="textarea" 
                       >
                       </f7-list-input>
                    -->
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

                 <f7-list-item>
                    <f7-button slot="after" raised fill
                               popup-close
                               @click="submitAccomodation"
                       > Submit </f7-button>
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
         hideKeys: ["id","type", "available_from", "open_vacancies", "status","created_by","created_on"],
         accomodation: {
            type: '',
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
      self.fetchAccomodations();
      setTimeout( () => true, 1000);

      self.accomodations = JSON.parse(self.$localStorage.get('accomodations', '[]'));
      console.log( self.accomodations );

      // And this accomodation.
      self.accomodation = JSON.parse(self.$localStorage.get('me.accomodation', '[]'));
   },
   methods: { 
      fetchAccomodations: function()
      {
         const self = this;
         self.fetchAndStore( '/accomodation/list', 'accomodations');
         self.accomodations = JSON.parse(self.$localStorage.get('accomodations', '[]'));
      },
      submitAccomodation: function()
      {
         const self = this;
         const app = self.$f7;
         console.log( "submitting accomodation", self.accomodation );
         // Save it before it goes away.
         self.$localStorage.set('me.accomodation', self.accomodation);
         self.accomodation.available_from = moment(self.accomodation.available_from).format('YYYY-MM-DD')
         let res = self.sendRequest('/accomodation/create', self.accomodation);
         if( res == 'ok')
            self.$localStorage.delete('me.accomodation');
      },
      readMore: function(obj) {
         const self = this;
         const app = self.$f7;
         console.log( obj );
      },
   },
};
</script>
