<template>
   <f7-page page-content>
      <f7-navbar title="Search" back-link="Back"></f7-navbar>
      <f7-block>
         <f7-list media-list no-hairlines inset>
            <f7-list-input @input="query=$event.target.value"
                  type="text" 
                  placeholder="Query e.g. Purchase, Chakrapani, 6532">
            </f7-list-input>
            <f7-button @click="searchIntranet" raised fill round>Search</f7-button>
         </f7-list>

      <f7-list media-list>
         <f7-list-item v-for="(e,key) in ldapInfo" 
                       :key="key"
                       :after="e.extension"
                       :footer="`${e.group}`"
                       >
                       <f7-link slot="title" 
                                external
                                icon="fa fa-envelope-o fa-fw"
                                :href="`mailto:${e.email}`"
                                target="_blank"
                                > <small>{{e.name}}</small></f7-link>
                       <f7-link slot="after" 
                                external
                                icon="fa fa-phone fa-fw"
                                :href="`tel:${e.phone}`"
                                target="_blank"
                                > <small> {{e.phone}}</small> </f7-link>
         </f7-list-item>
      </f7-list>
      </f7-block>
   </f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
   data() {
      const self = this;
      return {
         query: null,
         ldapCache: JSON.parse(self.$localStorage.get('ldap.cache', '[]')),
         ldapInfo : [],
      };
   },
   methods: { 
      searchIntranet: function( )
      {
         const self = this;
         const app = self.$f7;
         var link = self.$store.state.api+'/ldap/'+self.query;
         app.request.post(link, this.apiPostData(),
            function(json) {
               var ldap = JSON.parse(json).data;

               // Keep a copy else it will clutter.
               self.ldapInfo =JSON.parse(json).data;

               // Append to my personal library.
               var stored = JSON.parse(self.$localStorage.get('ldap.cache'), '[]');
               for(var k in stored)
                  ldap.push(stored[k]);
               self.$localStorage.set('ldap.cache', JSON.stringify(ldap));
            }
         );
      },
   },
};

</script>
