<template>
  <f7-page page-content ptr @ptr:refresh="fetchMenu">

  <f7-navbar title="Canteen Menu" back-link="Back"></f7-navbar>
  <f7-block-title>Total listings: {{cards.length}}</f7-block-title>

  <f7-block>
     <f7-card v-for="(card, key) in cards">
        <f7-card-title> {{ card.title }} </f7-card-title>
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
              <f7-list-input label="Name"
                             :value="menu_item.name"
                             @input="menu_item.type = $event.target.value"
                             required 
                             >
              </f7-list-input>

              <f7-list-input label="Day"
                             :value="menu_item.day"
                             @input="menu_item.day = $event.target.value"
                             required
                             >
              </f7-list-input>

              <f7-list-input label="Which meal?"
                             :value="menu_item.which_meal"
                             @input="menu_item.which_meal = $event.target.value"
                             >
              </f7-list-input>
              <f7-list-input label="Price (per unit)"
                             :value="menu_item.price"
                             @input="menu_item.price = $event.target.value"
                             type="int" 
                             >
              </f7-list-input>
              <f7-list-input label="Available From"
                             :value="menu_item.available_from"
                             @input="menu_item.available_from = $event.target.value"
                             type="time"
                             >
              </f7-list-input>

              <f7-list-input label="Available Upto"
                             :value="menu_item.available_upto"
                             @input="menu_item.available_upto = $event.target.value"
                             type="time"
                             >
              </f7-list-input>


              <f7-list-input label="Change status"
                             :value="menu_item.status"
                             @input="menu_item.status = $event.target.value"
                             type="select"
                             :defaultValue="menu_item.status"
                             info="To cancel change this field"
                             >
                    <option v-for="st in menu.status" :value="st">{{st}}</option>
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
                            @click="updateAccomodation(menu_item.id)"
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
         selectedDay: moment().format('ddd'),
         menu: [],
         popupOpened: false,
         hideKeys: ["id", "url", "type", "available_from", "open_vacancies", "status","created_by","created_on"],
         popupAction: 'New',
         photos: [],
         menu_item: {
            id: '',
            name: '',
            print: '',
            day: self.selectedDay,
            which_meal: '',
            available_from: '',
            available_upto: '',
            status: 'VALID',
         },
         cards: [],
      };
   },
   mounted: function() {
      // Get menu for this day.
      const self = this;
      self.postWithPromise( '/menu/list/'+self.selectedDay).then(
         function(json) {
            let res = JSON.parse(json);
            if( res.status == 'ok') {
               self.saveStore('menu', self.menu);
               self.menu = res.data;
               self.menuToCards(self.menu.list);
            }
         }
      );
   },
   methods: { 
      fetchMenu: function() {
         const self = this;
         self.fetchAndStore( '/menu/list/'+self.selectedDay, 'menu');
         self.menu = self.getStore('menu');
         self.menuToCards(self.menu.list);
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
      menuToCards: function(items) {
         const self = this;
         let groupItems = [];
         for(let k in items)
         {
            let item = items[k];
            let key = item.canteen_name + ':' + item.which_meal;
            if(key in self.cards)
               groupItems[key].push(item);
            else 
               groupItems[key] = [item];
         }
         for(var k in groupItems)
         {
            let items = groupItems[k];
            self.cards.push({ title: k, count : items.length });
         }
      },
   },
};
</script>
