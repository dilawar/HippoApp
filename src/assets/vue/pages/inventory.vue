<template>
   <f7-page ptr @ptr:refresh="fetchInventory">
    <f7-navbar title="Inventories" back-link="Back">
      <f7-subnavbar :inner="false">
         <f7-searchbar
            search-container=".inventory-list"
            search-item="li"
            search-in=".item-title"
            :disable-button="!$theme.aurora"
            >
         </f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <f7-block>
       <f7-popup ref="photobrowser">
          <f7-page>
             <f7-navbar title="Inventory browser">
                <f7-nav-right>
                   <f7-link popup-close>Close</f7-link>
                </f7-nav-right>
             </f7-navbar>

             <f7-card v-for="(photo, key) in photos" :key="key">
                <f7-card-content class="no-border">
                   <img :src="photo.src" width="100%"></img>
                </f7-card-content>
             </f7-card>
          </f7-page>
       </f7-popup>

       <f7-list class="searchbar-not-found">
          <f7-list-item title="Nothing found"></f7-list-item>
       </f7-list>

       <f7-list class="inventory-list"
                no-hairlines
                :virtual-list-params="{items, searchAll, renderExternal}"
                >
             <f7-list-item 
                           v-for="(item, index) in vlData.items"  
                           :key="index"
                           link="#"
                           :title="item.title"
                           :header="item.header"
                           :style="`top: ${vlData.topPosition}px`"
                           >
               <div slot="footer">
                  <f7-link external
                           target="_system"
                           :href="'mailto:'+item.data.person_in_charge"
                           style="margin-right:5px" 
                           >
                           {{item.data.person_in_charge}} 
                  </f7-link>({{item.data.faculty_in_charge}})
               </div>
               <div slot="text" v-html="item.data.description"> </div>

               <!-- if images are found, display them. -->
               <div slot="after" v-if="item.data.image_id.length > 0">
                  <f7-link
                     @click="fetchAndDisplayPhoto(item.data.image_id)">Photos</f7-link>
               </div>
            </f7-list-item>
       </f7-list>
    </f7-block>

  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
   data() {
      return {
         inventories: [],
         items: [],
         photos: [],
         vlData: {
            items: [],
         },
      };
   },
   mounted() {
      const self = this;
      self.inventories = self.loadStore('inventories');
      if( ! self.inventories || self.inventories.length == 0)
      {
         // Get all inventory.
         console.log( "Fetching inventories ... " );
         self.postWithPromise( '/inventory/list/100').then(
            function(json) 
            {
               self.inventories = JSON.parse(json).data;
               self.saveStore('inventories', self.inventories);
            }
         );
      }
      self.toItems(self.inventories.list);
   },
   methods: { 
      fetchInventory: function() {
         const self = this;
         const app = self.$f7;
         
         self.postWithPromise( '/inventory/list')
            .then(function(json) {
               let res = JSON.parse(json);
               if(res.status == 'ok')
               {
                  self.inventories = res.data;
                  self.saveStore('inventories', self.inventories);
               }
               else
                  self.inventories = self.loadStore('inventories');
               self.toItems(self.inventories.list);
            }
         );
         app.ptr.done();
      },
      toItems: function( invItems ) 
      {
         const self = this;
         self.items = [];
         for(var k in invItems)
         {
            let inv = invItems[k];
            self.items.push({
               title: inv.name,
               header: inv.item_condition + ', ' + inv.scientific_name,
               footer: inv.person_in_charge + ' (' + inv.faculty_in_charge + ')',
               data: inv,
               text: [inv.name, inv.scientific_name, inv.description,
                  , inv.person_in_charge, inv.faculty_in_charge].join(' ')
            });
         }
         self.vlData.items = self.items;
      },
      searchAll: function(query, items) 
      {
         const found = [];
         let q = query.toLowerCase().trim();
         for (let i = 0; i < items.length; i += 1) 
            if ( (items[i].text.toLowerCase().indexOf(q) >= 0) || (q === '')) 
               found.push(i);
         return found; // return array with mathced indexes
      },
      renderExternal: function(vl, vlData) 
      {
         const self = this;
         self.vlData = vlData;
      },
      fetchAndDisplayPhoto: function(ids) {
         const self = this;
         // Fetching images.
         ids = ids.join(',');
         console.log( "Fetching image ", ids );
         self.photos = [];
         self.promiseWithAuth('images/get/'+ids).then( 
            function( json ) {
               let res = JSON.parse(json);
               console.log(res);
               if(res)
               {
                  res = res.data[ids];
                  res.forEach( function(k) {
                     self.photos.push( {src : k});
                  });
               }
               self.$refs.photobrowser.open();
            });
      },
   },

};
</script>
