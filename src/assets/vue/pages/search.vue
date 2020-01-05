<template>
  <f7-page page-content>
    <f7-navbar title="Search" back-link="Back"></f7-navbar>

    <f7-list media-list no-hairlines inset>
      <f7-list-input 
             @input="query=$event.target.value"
             @change="searchIntranet"
             type="text" 
             placeholder="Query e.g. Purchase, Chakrapani, 6532">
      </f7-list-input>
      <f7-button @click="searchIntranet" small raised>Search</f7-button>
    </f7-list>

    <f7-list media-list>
      <f7-list-item v-for="(e,key) in ldapInfo" :key="key">
        <div slot="media"></div>
        <div slot="title">{{e.name}}</div>
        <div slot="header">
          <f7-link external
                   icon="fa fa-envelope-o fa-fw"
                   :href="`mailto:${e.email}`"
                   target="_blank">
            {{e.email}} 
          </f7-link>
          <f7-link external
                   icon="fa fa-phone fa-fw"
                   :href="`tel:${e.phone}`"
                   target="_blank">
            {{e.phone}}
          </f7-link>
        </div>
        <div slot="footer" class="text-color-gray">
          Group: {{e.group}}
        </div>
      </f7-list-item>
      <f7-list-item></f7-list-item>
    </f7-list>

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
      app.preloader.show();
      var ldap = [];
      self.promiseWithAuth('ldap/'+self.query)
        .then( function(x) {
          // Keep a copy else it will clutter.
          self.ldapInfo =JSON.parse(x.data).data;
          // Append to my personal library.
          var stored = JSON.parse(self.$localStorage.get('ldap.cache'), '[]');
          for(var k in stored)
            ldap.push(stored[k]);
          self.$localStorage.set('ldap.cache', JSON.stringify(ldap));
          app.preloader.hide();
        });
      setTimeout( () => app.preloader.hide(), 1000);
    },
  },
};

</script>
