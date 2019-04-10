<template>
   <f7-page>
      <f7-navbar title="Your Lab Inventory" back-link="Back"></f7-navbar>

      <f7-fab position="right-bottom" 
              slot="fixed" 
              color="blue"
              @click="addItemToInventory"
              >
              <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
              <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
      </f7-fab>

      <f7-list media-list no-hairlines>
         <f7-list-item v-for="(item, index) in inventories.list"
                       :key="index"
                       :title="item.name + ', ' + item.scientific_name"
                       media-item
                       >
           <div slot="header" style="color:green">
              {{item.item_condition}}, {{item.quantity_with_unit}} 
           </div>
            <f7-link external :href="'mailto:'+item.person_in_charge">{{item.person_in_charge}}
            </f7-link> | {{item.faculty_in_charge}}
            <f7-button small slot="after" @click="updateInventory(item)">Update</f7-button>
         </f7-list-item>
      </f7-list>

      <f7-popup class="inventory-popup" :opened="popupOpened" @popup:closed="popupOpened = false">
         <f7-page>
            <f7-navbar :title="`${popupAction} Inventory`">
               <f7-nav-right>
                  <f7-link popup-close>Cancel</f7-link>
               </f7-nav-right>
            </f7-navbar>

            <f7-block>

            <f7-list no-hairlines-md inset>

            <f7-list-input label="Name"
                           :value="inventory.name"
                           @input="inventory.name = $event.target.value"
                           required 
                           validate
                           >
            </f7-list-input>

            <f7-list-input label="Scientific Name" 
                           :value="inventory.scientific_name"
                           @input="inventory.scientific_name = $event.target.value"
                           >
            </f7-list-input>

            <f7-list-input label="Vendor" 
                           :value="inventory.vendor"
                           @input="inventory.vendor=$event.target.value"
                           required 
                           >
            </f7-list-input>

            <f7-list-input label="Quanity With unit"
                           :value="inventory.quantity_with_unit"
                           @input="inventory.quantity_with_unit = $event.target.value"
                           defaultValue="1 nos"
                           required
                           >
            </f7-list-input>

            <f7-list-input label="Description"
                           :value="inventory.description"
                           @input="inventory.description = $event.target.value"
                           :resizable="true"
                           type="textarea" 
                           >
            </f7-list-input>

            <f7-list-input label="Condition"
                           :value="inventory.item_condition"
                           :defaultValue="inventory.item_condition"
                           @input="inventory.item_condition = $event.target.value"
                           type="select"
                           required
                           >
               <option v-for="(cond, key) in inventories.item_conditions" 
                       :value="cond" :key="key"
                       >{{cond}}</option>
            </f7-list-input>

            <f7-list-input label="Requires booking"
                           :value="inventory.requires_booking"
                           :defaultValue="inventory.requires_booking"
                           @input="inventory.requires_booking = $event.target.value"
                           type="select"
                           required
                           >
                           <option value="YES">Yes</option>
                           <option value="NO">No</option>
            </f7-list-input>


            <f7-list-item>
               <f7-button v-if="popupAction=='New'"
                          slot="after" raised fill
                          popup-close
                          @click="submitNewInventory"
                          >Add New</f7-button>

               <f7-button v-if="popupAction=='Update'"
                          slot="title" raised 
                          popup-close
                          @click="submitDeleteInventory(inventory.id)"
                          >Delete</f7-button>
               <f7-button v-if="popupAction=='Update'"
                          slot="after" raised fill
                          popup-close
                          @click="submitUpdateInventory(inventory)"
                          >Update</f7-button>
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
         popupOpened: false,
         popupAction: 'New',
         inventories: [],
         inventory: {
            name: '',
            scientific_name: '',
            vendor: 'UNSPECIFIED',
            quantity_with_unit: '1 nos',
            description: '',
            status: 'VALID',
            expiry_date: '',
            person_in_charge: self.getLogin(),
            faculty_in_charge: '',
            requires_booking: 'NO',
            item_condition: 'FUNCTIONAL',
         },
      };
   },
   mounted: function() {
      const self = this;
      self.fetchInventories();
   },
   methods: { 
      fetchInventories: function() {
         const self = this;
         const app = self.$f7;
         app.dialog.preloader();
         self.postWithPromise( '/labinventory/list/').then(
            function(json) {
               let res = JSON.parse(json);
               if( res.status == 'ok') {
                  self.inventories = res.data;
                  self.saveStore('me.inventories', self.inventories);
               }
               else
                  self.inventories = self.loadStore('me.inventories');
               app.dialog.close();
            }
         );
      },
      inventoryToCard: function(items) {
         const self = this;
         self.cards = [];
      },
      addItemToInventory: function() 
      {
         const self = this;
         self.popupAction = "New";
         self.inventory.person_in_charge = self.getLogin();
         self.inventory.status = 'VALID';
         self.popupOpened = true;
      },
      submitNewInventory: function( ) 
      {
         console.log( 'Adding inventory');
         const self = this;
         self.sendRequest( 'labinventory/create', self.inventory);
         self.fetchInventories();
      },
      updateInventory: function(item) {
         const self = this;
         self.popupAction = 'Update';
         self.inventory = item;
         self.popupOpened = true;
      },
      submitUpdateInventory: function(card) {
         const self = this;
         self.sendRequest( 'labinventory/update', card);
         self.fetchInventories();
      },
      submitDeleteInventory: function(id) {
         const self = this;
         console.log( "deleting item", id);
         self.sendRequest( 'labinventory/delete/'+id);
         self.fetchInventories();
      },
   }
};

</script>
