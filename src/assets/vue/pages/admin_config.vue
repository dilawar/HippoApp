<template>
  <f7-page>
    <f7-navbar title="Configuration" back-link="Back">
    </f7-navbar>


    <f7-popup :opened="popupConfig" @popup:close="popupConfig = false">
      <f7-page>
        <f7-navbar title="Update course information">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block-header class="text-color-black">
          To create possible values that a table field can take, set <tt>ID</tt>
          to <tt>TABLENAME.FIELDNAME</tt> e.g., faculty.specialization to a CSV
          of possible values. If values has ',' then use `;` as delimiter.
        </f7-block-header>

        <f7-block>
          <f7-list media-list no-hairlines>
            <f7-list-input label="ID" 
              type="text" 
              :value="thisConfig.id"
              @input="thisConfig.id=$event.target.value"
              :readonly="thisConfig.id?true:false">
            </f7-list-input>
            <f7-list-input label="Value" 
              type="textarea"
              @input="thisConfig.value = $event.target.value"
              :value="thisConfig.value"
              resizable>
            </f7-list-input>
            <f7-list-input label="Comment" type="texteditor"
              @texteditor:change="(v) => thisConfig.comment = v"
              :value="thisConfig.comment">
            </f7-list-input>
            <f7-list-item>
              <f7-button raised small @click="updateConfig">Add/Update</f7-button>
            </f7-list-item>
          </f7-list>
        </f7-block>
      </f7-page>
    </f7-popup>
      
    <f7-block>
      <f7-block-header>
        These are simple key-value pairs. These changes the behvaiour of Hippo
        API.
      </f7-block-header>

      <f7-list media-list>
        <f7-list-item>
          <f7-button raised slot="after" @click="addNewConfig">
            Add a new entry
          </f7-button>
        </f7-list-item>
        <f7-list-item v-for="val, key in configs" 
          @click="updateConfigPopup(configs[key])"
          :header="configs[key].id" :key="key">
          <div slot="text" v-html="configs[key].value"></div>
          <div slot="footer" v-html="configs[key].comment"></div>
        </f7-list-item>
      </f7-list>

    </f7-block>

  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    return {
      logins: [],
      configs: {},
      thisConfig: {key:'', value:'', comment:''},
      popupConfig: false,
    };
  },
  mounted: function()
  {
    const self = this;
    self.fetchAllConfig();
  },
  methods : {
    fetchAllConfig: function( ) {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.postWithPromise('admin/config/list').then(function(x) {
        self.configs = JSON.parse(x.data).data;
        app.preloader.hide();
      });
      setTimeout(()=> app.preloader.hide(), 2000);
    },
    updateConfigPopup: function(conf) {
      const self = this;
      console.log('This conf', conf);
      self.thisConfig = conf;
      self.popupConfig = true;
    },
    updateConfig: function() {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('admin/config/update', self.thisConfig)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.fetchAllConfig();
            self.popupConfig = false;
          }
          else
            self.notify('Failed to update config', res.msg);
        });
    },
    addNewConfig: function() {
      const self = this;
      const app = self.$f7;
      self.resetSimple(self.thisConfig);
      self.popupConfig = true;
    },
  },
}
</script>
