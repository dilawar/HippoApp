<template>
   <f7-page>
      <f7-navbar title="My Inventory" back-link="Back"></f7-navbar>

      <f7-block>
         <f7-block-title> Total {{inventories.count}} items. </f7-block-title>

         <f7-list media-list no-hairlines>
            <f7-list-item v-for="(item, index) in inventories.list"
                           :key="index"
                           :header="item.name + ', ' + item.scientific_name"
                           :footer="`Incharge: ${item.person_in_charge}`"
                           media-item
                           >
            </f7-list-item>
         </f7-list>
      </f7-block>

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
                                    required 
                                    validate>
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

                              <f7-list-input label="Person in charge"
                                             :value="inventory.person_in_charge"
                                             @input="inventory.person_in_charge = $event.target.value"
                                             type='email'
                                             validate
                                             >
                              </f7-list-input>

                                 <f7-list-input label="Requires booking"
                                                :value="inventory.requires_booking"
                                                :defaultValue="inventory.requires_booking"
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
                                               >Submit</f7-button>
                                    <f7-button v-if="popupAction=='Update'"
                                               slot="after" raised fill
                                               popup-close
                                               @click="updateInventory(inventory.id)"
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
      return {
         popupOpened: false,
         popupAction: 'New',
         inventories: [],
         inventory: {
            name: '',
            scientific_name: '',
            ventor: 1,
            quantity_with_unit: '1 nos',
            description: '',
            expiry_date: '',
            person_in_charge: '',
            requires_booking: 'NO',
            intem_condition: 'FUNCTIONAL',
         },
      };
   },
   mounted: function() {
      console.log( 'Mounting inventories' );
      const self = this;
      self.fetchInventories();
   },
   methods: { 
      fetchInventories: function() {
         const self = this;
         self.postWithPromise( '/myinventory/list/').then(
            function(json) {
               let res = JSON.parse(json);
               if( res.status == 'ok') {
                  self.inventories = res.data;
                  self.saveStore('inventories', self.inventories);
               }
               else
                  self.inventories = self.loadStore('inventories');
               console.log( 'inventories', self.inventories );
            }
         );
      },
      inventoryToCard: function(items) {
         const self = this;
         self.cards = [];
      },
      addItemToInventory: function(card) 
      {
         const self = this;
         self.popupAction = "New";

         // Clear object.
         for(const prop of Object.keys(self.inventory)){
            delete self.inventory[prop];
         }

         self.inventory = card;
         self.inventory.scientific_name = card.scientific_name;
         self.inventory.vendor = card.vendor;
         self.inventory.status = 'AVAILABLE';
         self.popupOpened = true;
      },
      submitNewInventory: function(card) {
         const self = this;
         const app = self.$f7;
         self.sendRequest( 'myinventory/create', card);
         self.fetchInventories();
      },
      updateInventory: function(card) {
         const self = this;
         self.popupAction = 'Update';
         self.inventory = card;
         self.popupOpened = true;
      },
      submitUpdateInventory: function(card) {
         const self = this;
         console.log( "Updating menu");
         self.sendRequest( 'myinventory/update', card);
         self.fetchInventories();
      },
      submitDeleteInventory: function(id) {
         const self = this;
         console.log( "deleting item", id);
         self.sendRequest( 'myinventory/delete/'+id);
         self.fetchInventories();
      }
   }
};

</script>
