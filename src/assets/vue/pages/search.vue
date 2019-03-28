<template>
<f7-page>
  <f7-navbar title="Search" back-link="Back"></f7-navbar>
  <!--  Show venues as grid or list. -->
  <f7-page-content>

     <f7-list media-list no-hairlines inset>
        <f7-list-item>
           <f7-list-input v-model="query" 
                          @input="query=$event.target.value"
                          type="text" 
                          placeholder="Search NCBS"></f7-list-input>
           <f7-button @click="searchIntranet" raised fill round>Search</f7-button>
        </f7-list-item>
     </f7-list>

     <f7-list media-list no-hairlines>
        <f7-list-item v-for="(val, key, item) in user" :header="key" :title="val">
           <f7-icon slot="media" 
                    v-if="key.toLowerCase()=='extenstion'" 
                    icon="fa fa-phone fa-2x"></f7-icon>
           <f7-icon slot="media" v-else></f7-icon>
           <a slot="after" 
              v-if="key.toLowerCase()=='extenstion'" 
              href="tel:+91-802363${val}">+91 80 2362{{val}}</a>
        </f7-list-item>
     </f7-list>

  </f7-page-content>
</f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
   data() {
      return {
         query: null,
         user: [],
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
               var res = JSON.parse(json);
               self.user = res.data;
               console.log(self.user);
            });
      },
   },
};

</script>
