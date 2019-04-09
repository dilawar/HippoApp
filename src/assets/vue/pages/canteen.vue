<template>
  <f7-page page-content ptr @ptr:refresh="fetchMenu">
  <f7-navbar title="Canteen Menu" back-link="Back"></f7-navbar>

  <f7-block>
     <f7-row noGap v-model="selectedDay">
        <f7-col v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="'col'+d">
           <f7-button  small
                       :key="d" 
                       :fill="(d==selectedDay)?true:false" 
                       @click="changeDay(d)"
                       > 
              <font><small>{{d}}</small></font>
           </f7-button>
        </f7-col>
     </f7-row>
  </f7-block>

  <f7-block>
     <f7-card v-for="(card, key) in cards" :key="key">
        <f7-card-header> 
           <span style="color:gray">{{card.title}}</span> 
        </f7-card-header>
        <f7-card-content> 
           <span v-for="(item, key) in card.menuItems" style="margin-right:10px">
              <f7-link color="green" @click="updateMenuItem(item)"
                  v-if="isUserAuthenticated()"> {{item.name}}</f7-link>
              <f7-link v-else>{{item.name}}</f7-link>
              <sup>₹{{parseFloat(item.price)}}</sup>
           </span>
        </f7-card-content>
        <f7-card-footer> 
           <span style="font-size:x-small">Recent contributors: {{ card.footer }} </span>
           <span style=""> 
              <f7-button small 
                         raised 
                         v-if="isUserAuthenticated()"
                         @click="addItemToMenu(card)"
                 >Add</f7-button>
           </span>
        </f7-card-footer>
     </f7-card>
  </f7-block>

  <!-- FAB to create accomodation -->
  <!--
  <f7-fab v-if="isUserAuthenticated()"
          position="right-bottom" 
          slot="fixed" 
          @click="popupOpened=true"
          color="red">
     <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
  </f7-fab>
  -->


  <f7-popup class="canteen-popup" :opened="popupOpened" @popup:closed="popupOpened = false">
     <f7-page>
        <f7-navbar :title="`${popupAction} Canteen`">
           <f7-nav-right>
              <f7-link popup-close>Cancel</f7-link>
           </f7-nav-right>
        </f7-navbar>

        <f7-block>
           <f7-block-title>Please add one item at a time!</f7-block-title>
           <f7-list no-hairlines-md inset>


              <f7-list-input label="Name"
                             :value="menu_item.name"
                             @input="menu_item.name = $event.target.value"
                             required 
                             >
              </f7-list-input>

              <f7-list-input label="Price (per unit)"
                             :value="menu_item.price"
                             @input="menu_item.price = $event.target.value"
                             type="int" 
                             >
              </f7-list-input>

              <f7-list-input label="Day"
                             v-if="menu_item.day"
                             :value="menu_item.day"
                             @input="menu_item.day = $event.target.value"
                             required
                             >
              </f7-list-input>

              <f7-list-input label="Which meal?"
                             :value="menu_item.which_meal"
                             type="select"
                             required
                             >
                       <option v-for="(meal,key) in menu.meals" :value="meal" :key="key"> {{meal}} </option>
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

              <f7-list-input label="Canteen name"
                             type="select"
                             required 
                             :defaultValue="menu_item.canteen_name"
                             >
                     <option v-for="(cant, key) in menu.canteens" :key="key" :value="cant">{{cant}}</option>
              </f7-list-input>

              <f7-list-item>
                 <f7-button v-if="popupAction=='New'"
                            slot="after" raised fill
                            popup-close
                            @click="submitNewMenuItem(menu_item)"
                            >Submit</f7-button>
                 <f7-button v-if="popupAction=='Update'"
                            slot="after" raised fill
                            popup-close
                            @click="submitUpdateMenuItem(menu_item)"
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
         hideKeys: [],
         popupAction: 'New',
         photos: [],
         menu_item: {
            id: '',
            name: '',
            print: '',
            day: moment().format('ddd'),
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
               self.saveStore('menu', res.data);
               self.menu = res.data;
               self.menuToCards(self.menu.list);
            }
         }
      );
   },
   methods: { 
      fetchMenu: function() {
         const self = this;
         self.postWithPromise( '/menu/list/'+self.selectedDay).then(
            function(json) {
               let res = JSON.parse(json);
               if( res.status == 'ok') {
                  self.saveStore('menu', self.menu);
                  self.menu = res.data;
               }
               else
                  self.menu = self.loadStore('menu');
               self.menuToCards(self.menu.list);
            }
         );
      },
      changeDay: function(day) {
         this.selectedDay = day;
         this.fetchMenu();
      },
      submitAccomodation: function() {
         const self = this;
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
         self.accomodation.available_from = self.dbDate(self.accomodation.available_from);
         self.sendRequest('/accomodation/update/id', self.accomodation);
         return;
      },
      readMore: function(obj) {
         const self = this;
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
            let key = item.canteen_name + ': ' + item.which_meal;
            if(key in groupItems)
               groupItems[key].push(item);
            else 
               groupItems[key] = [item];
         }
         self.cards = [];
         for(var k in groupItems)
         {
            let items = groupItems[k];
            let content = items.map(x => x.name).join(', ');
            let contributors = [... new Set( 
                     items.reduce((v, x)=>x.modified_by+v, '').split(','))
                  ].join(',');
            self.cards.push({
               title: k
               , canteen_name: items[0].canteen_name
               , which_meal: items[0].which_meal
               , available_from: items[0].available_from
               , available_upto: items[0].available_upto
               , count: items.length
               , content: content
               , menuItems: items
               , footer: contributors}
            );
         }
      },
      addItemToMenu: function(card) {
         const self = this;
         self.popupAction = "New";

         // Clear object.
         for(const prop of Object.keys(self.menu_item)){
            delete self.menu_item[prop];
         }

         self.menu_item.canteen_name = card.canteen_name;
         self.menu_item.which_meal = card.which_meal;
         self.menu_item.available_upto = card.available_upto;
         self.menu_item.available_from = card.available_from;
         self.menu_item.status = 'AVAILABLE';
         self.popupOpened = true;
      },
      submitNewMenuItem: function(card) {
         const self = this;
         const app = self.$f7;
         self.sendRequest( 'menu/create', card);
      },
      updateMenuItem: function(card) {
         const self = this;
         self.popupAction = 'Update';
         self.menu_item = card;
         self.popupOpened = true;
      },
      submitUpdateMenuItem: function(card) {
         const self = this;
         const app = self.$f7;
         self.sendRequest( 'menu/update', card);
      }
   },
};
</script>
