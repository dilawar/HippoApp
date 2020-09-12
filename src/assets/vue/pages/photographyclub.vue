<template>
<f7-page page-content>
  <f7-navbar title="NCBS Photography Club" back-link="Back"></f7-navbar>

  <f7-block-title v-if="isPBAdmin()">
    <f7-link href="/admin_photographyclub">Admin Link</f7-link>
  </f7-block-title>

</f7-page>
</template>

<script>
import moment from 'moment';

export default {

  data() {
    const self = this;
    return {
      data: [],
    };
  },
  mounted: async function() {
    const self = this;
    const app = self.$f7;

    self.postWithPromise('/photographyclub/list').then( function(x) {
      var res = JSON.parse(x.data).data;
      console.log(res);
    });

  },
  methods: { 
    isPBAdmin: function() {
      return true;
    },
  },

};
</script>
