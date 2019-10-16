<template>
  <f7-page page-content ptr @ptr:refresh="fetchProfile">
    <f7-navbar title="Profile" back-link="Back"></f7-navbar>

    <!--
      <f7-fab position="right-bottom" slot="fixed" color="blue">
      <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
      <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
      <f7-fab-buttons position="top">
      </f7-fab-buttons>
      </f7-fab>
    -->

    <f7-block>
      <f7-block-title small>Currently profile is readonly.</f7-block-title>

      <f7-list no-hairlines sortable inner>
        <f7-list-item
          v-for="(val, key) in profile"
          :key="key"
          :header="formatKey(key)"
          :title="val"
          >
          <!-- <f7-icon slot="media" icon="fa fa-check-square-o fa-fw"></f7-icon> -->
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
      profile: [],
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
    self.profile = JSON.parse(self.$localStorage.get('me.profile', '[]'));
  },
  methods: {
  },
}
</script>
