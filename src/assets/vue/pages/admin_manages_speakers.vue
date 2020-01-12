<template>
  <f7-page>
    <f7-navbar title="Manage Speaker" back-link="Back">
    </f7-navbar>
    
    <f7-block-title></f7-block-title>

  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    const params = self.$f7route.params;
    console.log("Params ", params);
    return {
      speaker: {},
      thisSpeaker: {class:'UNKNOWN'},
    };
  },
  mounted()
  {
    const self = this;
  },
  methods : {

  },
}
</script>
