<template>
  <f7-page>
    <f7-navbar title="Email templates" back-link="Back">
    </f7-navbar>

    <f7-block>
      <f7-block-header>
        Email templates. Click on the item to update it. These are for
        developers only.
      </f7-block-header>
      <f7-list media-list>
        <f7-list-item>
          <f7-button raised small @click="addNewTemplate">Add a new template</f7-button>
        </f7-list-item>
        <f7-list-item v-for="template, key in templates" :key="key"
            @click="updateTemplate(template)">
            <div slot="header">{{template.id}}</div>
            <div slot="footer">{{template.when_to_send}}</div>
        </f7-list-item> 
      </f7-list>
    </f7-block>

    <f7-popup :opened="popupTemplate" @popup:close="popupTemplate = false">
      <f7-page>
        <f7-navbar :title="popupTitle">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <!-- New templates -->
        <f7-block>
          <f7-list media-list no-hairlines>
            <f7-list-input 
              :value="thisTemplate.id" 
              @input="thisTemplate.id=$event.target.value"
              label="Short ID" 
              :readonly="thisTemplate.idreadonly">
            </f7-list-input>

            <!--
            <f7-list-input type="texteditor" 
              resizable
              :value="thisTemplate.description"
              :textEditorParams="{mode:'popover'}"
              @texteditor:change="(v) => thisTemplate.description = v"
              label="Description" required>
            </f7-list-input>
            -->

            <f7-list-input label="Description" :input="false">
              <vue-editor slot="input" 
                id="templateDescription" 
                v-model="thisTemplate.description">
              </vue-editor>
            </f7-list-input>

            <f7-list-input label="Recipients" 
              :value="thisTemplate.recipients"
              @input="thisTemplate.recipients=$event.target.value">
            </f7-list-input>

            <f7-list-input label="CC"
              :value="thisTemplate.cc"
              @input="thisTemplate.cc=$event.target.value">
            </f7-list-input>

            <f7-list-input label="When to send? (suggestion only)"
              :value="thisTemplate.when_to_send"
              @input="thisTemplate.when_to_send=$event.target.value">
            </f7-list-input>

            <f7-list-item>
              <f7-row>
                <f7-col>
                  <f7-button color=red raised @click="deleteTemplate">Delete</f7-button>
                </f7-col>
                <f7-col>
                  <f7-button raised @click="submitTemplate">Submit</f7-button>
                </f7-col>
              </f7-row>
            </f7-list-item>
          </f7-list>
        </f7-block>
      </f7-page>
    </f7-popup>

  </f7-page>

</template>

<script>
export default {
  data() {
    const self = this;
    return {
      templates: {},
      popupTitle: 'Add Template',
      popupTemplate: false,
      thisTemplate: {id:'', description:'', recipients:'', cc:'', when_to_send:
        '', idreadonly:false}
    };
  },
  mounted: function()
  {
    const self = this;
    self.fetchTemplates();
  },
  methods : {
    fetchTemplates: function() 
    {
      const self = this;
      self.postWithPromise('admin/templates/list')
        .then(function(x) {
          self.templates = JSON.parse(x.data).data;
        });
    },
    submitTemplate: function() 
    {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('admin/templates/submit', self.thisTemplate)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Successfully updated template.");
            self.fetchTemplates();
            self.popupTemplate = false;
          }
        });
    },
    addNewTemplate: function()
    {
      const self = this;
      self.thisTemplate = {id:'', description:'', recipients:'', cc:'',
        when_to_send: '', idreadonly:false}
      self.popupTitle = "Add a new template";
      self.popupTemplate = true;
    },
    updateTemplate: function(templ)
    {
      const self = this;
      self.thisTemplate = templ;
      self.thisTemplate.idreadonly = true;
      self.popupTitle = "Update template";
      self.popupTemplate = true;
    },
    deleteTemplate: function() 
    {
      const self = this;
      self.promiseWithAuth('admin/templates/delete', self.thisTemplate)
        .then( function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Sucessfully delete holiday");
            self.fetchTemplates();
            self.popupTemplate = false;
          }
        });
    },
  },
}
</script>
