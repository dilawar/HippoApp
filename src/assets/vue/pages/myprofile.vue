<template>
  <f7-page page-content ptr @ptr:refresh="fetchProfile">
    <f7-navbar title="Profile" back-link="Back"></f7-navbar>

    <f7-block-title medium>Profile is readonly.</f7-block-title>

    <f7-block inset>
      <f7-row>
        <f7-col width="100" 
                medium="50" 
                style="border-top:1px solid lightgray"
                v-for="(val, key) in profile"
                :key="key">
          <div>
            <small>
              <tt class="text-color-gray">{{formatKey(key)}}</tt> 
            </small>
            <strong>{{val}}</strong>
          </div>
        </f7-col>
      </f7-row>
    </f7-block>
    <f7-block-footer>
      If you are not <tt>ELIGIBLE FOR AWS</tt>, please write to Academic office
      to include your name.
    </f7-block-footer>
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
