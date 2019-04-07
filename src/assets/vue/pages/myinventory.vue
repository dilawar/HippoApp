<template>
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
                                 :value="inventory.name"
                                 @input="inventory.name = $event.target.value"
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
</template>


<script>

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

</script>
