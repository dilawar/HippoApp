<template>
   <f7-page ptr @ptr:refresh="ptrRefreshInventory">
      <f7-navbar title="Your Lab Inventory" back-link="Back"></f7-navbar>

      <f7-fab position="right-bottom" 
              slot="fixed" 
              color="blue"
              @click="addItemToInventory"
              >
              <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
              <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
      </f7-fab>

      <f7-block>
         <f7-card v-for="(item, index) in inventories.list" :key="index">

            <f7-card-header>
               <span style="color:red; font-size:small">{{item.item_condition}}</span>
               <span style="float:right">{{item.scientific_name}}</span>
            </f7-card-header>


           <f7-card-content>
              <f7-list media-list>
                 <f7-list-item>
                    <div slot="footer">
                       Person in charge: 
                       <f7-link external :href="'mailto:'+item.person_in_charge">
                          {{item.person_in_charge}}
                       </f7-link> 
                       <br />
                       <span v-if="item.location" style="float:right">
                          <f7-icon icon="fa fa-map-marker fa-fw"></f7-icon>
                          <font style="font-size:small">{{item.location}}</font>
                       </span>
                       <div v-if="item.borrowing.length > 0"
                          style="color:red; font-size:x-small">
                          Borrowed by {{item.borrowing[0].borrower}} on
                          {{item.borrowing[0].borrowed_on}}
                       </div>
              <br />
                    </div>


                    <div slot="title" style="font-size:small">
                        {{item.name}} - {{item.quantity_with_unit}}  
                    </div>
                    <div slot="text">
                       {{ item.description }}
                    </div>

                    <div slot="media" v-if="item.thumbnails.length > 0">
                       <img :src="item.thumbnails[0].base64"></img>
                    </div>

                 </f7-list-item>
              </f7-list>
           </f7-card-content>

           <f7-card-footer>
              <f7-button small @click="lendInventory(item)">Lend</f7-button>
              <f7-button small style="float:right" @click="editInventory(item)">Edit</f7-button>
           </f7-card-footer>

         </f7-card>

      </f7-block>

      <f7-popup :opened="lendPopup" @popup:closed="lendPopup = false">
         <f7-page>
            <f7-navbar title="Lend Inventory">
               <f7-nav-right>
                  <f7-link popup-close>Cancel</f7-link>
               </f7-nav-right>
            </f7-navbar>

            <f7-block>
               <!-- Lending list -->
               <f7-list media-list no-hairlines>
                  <div>You are lending '{{inventory.name}}' (id:{{inventory.id}}) </div>

                  <f7-list-input label="Borrower (email)"
                                 :value="inventory.borrowing[0].borrower"
                                 @input="inventory.borrowing[0].borrower = $event.target.value"
                                 type="email" 
                                 required
                                 validate
                                 >
                  </f7-list-input>

                  <f7-list-item>
                     <f7-button slot="after" raised fill
                                popup-close
                                @click="submitLendInventory(inventory)"
                                > Lend </f7-button>
                     <f7-button slot="title" raised fill
                                popup-close
                                @click="submitClearLending(inventory)"
                                >Clear Borrowing</f7-button>
                  </f7-list-item>
               </f7-list>
            </f7-block>
         </f7-page>
      </f7-popup>

      <!-- Another popup for editing the current inventory item -->
       <f7-popup :opened="editPopup" ref="edit_popup" @popup:closed="editPopup = false">
         <f7-page>
            <f7-navbar title="Edit Inventory">
               <f7-nav-right>
                  <f7-link popup-close>Cancel</f7-link>
               </f7-nav-right>
            </f7-navbar>
            <f7-block>
               <f7-list no-hairlines-md media-list>
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

                  <f7-list-input label="Location"
                                 :value="inventory.location"
                                 @input="inventory.location = $event.target.value"
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

                  <!-- Show existing pictures and button to remove them. -->
                  <f7-list-item v-for="(thumb, key) in inventory.thumbnails" :key="key">
                     <div slot="media">
                        <img :src="thumb.base64"> </img>
                     </div>
                     <div slot="after">
                        <f7-button small @click="removeImage(thumb.id)">Remove Image</f7-button>
                     </div>
                  </f7-list-item>

                  <!-- Show dropzone to upload files . -->
                  <f7-list-item no-media>
                     <vue-dropzone id="dropzone1" 
                                   ref="inventoryDZ" 
                                   v-on:vdropzone-sending="onImageSendingAddExternalID"
                                   :options="dropzoneOptions"
                                   >
                     </vue-dropzone>
                  </f7-list-item>

                  <f7-list-item>
                     <f7-button v-if="popupAction=='New'"
                                slot="after" raised fill
                                popup-close
                                @click="submitNewInventory"
                                >Add New</f7-button>

                     <f7-button v-if="popupAction=='Edit'"
                                slot="title" raised fill
                                popup-close
                                @click="submitDeleteInventory(inventory.id)"
                                >Delete</f7-button>
                     <f7-button v-if="popupAction=='Edit'"
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
         lendPopup: false,
         editPopup: false,
         popupAction: 'New',
         inventories: [],
         inventory: {
            name: '',
            scientific_name: '',
            vendor: 'UNSPECIFIED',
            quantity_with_unit: '1 nos',
            description: '',
            location: '',
            status: 'VALID',
            expiry_date: '',
            person_in_charge: self.getLogin(),
            faculty_in_charge: '',
            requires_booking: 'NO',
            item_condition: 'FUNCTIONAL',
            id: '',
            thumbnails: [],
            borrowing: [{ borrower : '' }],
         },
         dropzoneOptions: {
            url: self.$store.state.api + '/upload/images',
            thumbnailWidth: 150,
            maxFilesize: 5,
            resizeWidth: 500,
            acceptedFiles: "image/*",
            addRemoveLinks: true,
            autoProcessQueue: false, // do not upload automatically.
            headers: self.apiPostData(),
         },
      };
   },
   mounted: function() {
     const self = this;
     self.inventories = self.loadStore('me.inventories');
     if(! self.inventories)
       self.fetchInventories();
   },
   methods: { 
      fetchInventories: function() {
         const self = this;
         const app = self.$f7;
         self.postWithPromise( '/labinventory/list/').then(
            function(x) {
               let res = JSON.parse(x.data);
               if( res.status == 'ok') {
                  self.inventories = res.data;
                  self.saveStore('me.inventories', self.inventories);
               }
               else
               {
                  console.log( "Failed to fetch inventory");
                  self.inventories = self.loadStore('me.inventories');
               }
            }
         );
      },
      ptrRefreshInventory: function(event, done) {
         const self = this;
         setTimeout( () => {
            self.fetchInventories();
            done();
         }, 1000);
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

         if(self.inventory.borrowing.length == 0)
            self.inventory.borrowing.push({borrower: ''});
         self.editPopup = true;
      },
      submitNewInventory: function( ) 
      {
         const self = this;
         self.promiseWithAuth( 'labinventory/create', self.inventory).then(
            function(x) {
               let res = JSON.parse(x.data).data;
               console.log( "Created inventory", res.id );
               self.inventory = res;
               if(self.inventory.borrowing.length == 0)
                  self.inventory.borrowing.push({borrower: ''});

               // Before we upload, make sure to send inventory_id in $_POST.
               self.$refs.inventoryDZ.processQueue();
            });
         setTimeout( () => self.fetchInventories(), 1000);
      },
      submitUpdateInventory: function(card) {
         const self = this;
         self.promiseWithAuth( 'labinventory/update', card).then(
            function(x) {
               let res = JSON.parse(x.data).data;
               // Now upload images if any.
               // Before uploading image, add corresponding inventory id to the image.
               self.$refs.inventoryDZ.processQueue();
            });
         setTimeout( () => self.fetchInventories(), 1000);
      },
      submitDeleteInventory: function(id) {
         const self = this;
         console.log( "deleting item", id);
         setTimeout( () => {
            self.sendRequest( 'labinventory/delete/'+id);
         }, 1000);
         self.fetchInventories();
      },
      lendInventory: function(inv) {
         const self = this;
         self.popupAction = "Lend";
         self.inventory = inv;

         // Make sure to have default fields setup.
         if(self.inventory.borrowing.length == 0)
            self.inventory.borrowing.push({ borrower : '' });

         self.lendPopup = true;
      },
      editInventory: function(inv) {
         const self = this;
         console.log( "Updating inventory ", inv.id );
         self.thumbnails = inv.thumbnails;
         self.popupAction = "Edit";
         self.inventory = inv;

         // Make sure to have a borrowing field set.
         if( self.inventory.borrowing.length == 0)
            self.inventory.borrowing.push({borrower : '' });

         self.editPopup = true;
      },
      submitLendInventory: function( inv ) {
         const self = this;
         self.inventory = inv;
         self.sendRequest( 'labinventory/lend', inv);
      },
      submitClearLending: function( inv ) {
         const self = this;
         self.sendRequest('labinventory/gotback/'+inv.id);
         setTimeout( () => self.fetchInventories(), 1000);
      },
      onImageSendingAddExternalID: function(img, xhr, formData) {
         const self = this;
         // Add external id to formData.
         formData.append("inventory_id", self.inventory.id);
      },
      removeImage: function( id ) {
         const self = this;
         setTimeout( () => {
            self.sendRequest('images/delete/' + id );
            // Remove this thumbnail from the page whether we succeed or not.
            self.inventory.thumbnails = self.inventory.thumbnails.filter(th =>th.id!=id);
         }, 1000);
      },
   },
};

</script>
