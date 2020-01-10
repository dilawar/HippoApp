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
      <f7-block-title medium>Profile is readonly.</f7-block-title>

      <f7-row>
        <f7-col width="50" medium="25" v-for="(val, key) in profile" :key="key">
          <div>
            <tt class="text-color-gray">{{formatKey(key)}}</tt> 
            <strong>{{val}}</strong>
          </div>
        </f7-col>
      </f7-row>

    </f7-block>
  </f7-page>

</template>

<script>
export default {
  data() {
    const self = this;
    return {
      profile: {},
      editables: ["alternative_email", "honorific"
        , "middle_name", "pi_or_host"]

    };
  },
  mounted()
  {
    const self = this;

    self.postWithPromise('me/profile')
      .then(function(x) {
        self.profile = JSON.parse(x.data).data;
        self.profile['jcs'] = Object.keys(self.profile.jcs).join(',');
      });
  },
  methods: {
  },
}
</script>
