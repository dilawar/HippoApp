<template>
  <f7-page>
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

       <f7-block-title> Total {{inventories.count}} items. </f7-block-title>

    <f7-list class="searchbar-not-found">
       <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>

    <f7-list class="inventory-list"
             media-list 
             no-hairlines
             :virtual-list-params="{items, searchAll, renderExternal}"
             >
      <ul>
        <f7-list-item media-item
                      v-for="(item, index) in vlData.items"  
                      :key="index"
                      link="#"
                      :title="item.title"
                      :header="item.header"
                      :style="`top: ${vlData.topPosition}px`"
                      >
             <div slot="footer">
                <f7-link style="margin-right:5px" 
                   href="'mailto:'+item.data.person_in_charge">
                   {{item.data.person_in_charge}} 
                </f7-link>({{item.data.faculty_in_charge}})
             </div>
             <div slot="text" v-html="item.data.description"> </div>
        </f7-list-item>
      </ul>
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
         vlData: {
            items: [],
         },
      };
   },
   mounted() {
      const self = this;
      // Get all inventory.
      self.postWithPromise( '/inventory/list/100').then(
         function(json) 
         {
            self.inventories = JSON.parse(json).data;
            self.saveStore('inventories', self.inventories);
            self.toItems(self.inventories.list);
         }
      );
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
               header: inv.scientific_name,
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
   },

};
</script>
