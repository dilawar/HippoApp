<template>
  <f7-page>
    <f7-navbar title="Send Email" back-link="Back">
    </f7-navbar>
    <f7-block>

      You can edit the email before sending it.

      <f7-list no-hairlines>

        <f7-list-input label="Recipients"
                       floating-label
                       type="text"
                       :value="thisEmail.recipients"
                       @change="thisEmail.recipients=$event.target.value">
        </f7-list-input>

        <f7-list-input label="CC"
                       type="text"
                       floating-label
                       :value="thisEmail.cc"
                       @change="thisEmail.cc=$event.target.value">
        </f7-list-input>

        <f7-list-input label="Subject"
                       type="textarea"
                       floating-label
                       resizable
                       @change="thisEmail.subject=$event.target.value"
                       :value="thisEmail.subject">
        </f7-list-input>

        <f7-list-input label="Email Body"
                       :value="thisEmail.email_body"
                       resizable
                       @texteditor:change="(v)=>thisEmail.email_body=v"
                       type="texteditor">
        </f7-list-input>

        <f7-list-input label="Attachments" readonly :value="thisEmail.attachments">
        </f7-list-input>

        <f7-list-item>
          <f7-col width="45">
            <f7-button raised color=red fill back>Close</f7-button>
          </f7-col>
          <f7-col width="45">
            <f7-button raised fill back @click="sendEmail()">
              Send Email
            </f7-button>
          </f7-col>
        </f7-list-item>

        <f7-list-input></f7-list-input>

      </f7-list>

    </f7-block>
  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    const params = this.$f7route.params;
    console.log('params: ', params);

    return {
      thisData: [],
      thisType: params.table,
      thisID : params.id,
      thisEmail: {},
    };
  },
  mounted()
  {
    const self = this;
    const app = self.$f7;
    self.promiseWithAuth('/email/'+self.thisType+'/'+self.thisID)
      .then(
        function(x) {
          self.thisEmail = JSON.parse(x.data).data;
        }
      );
  },
  methods : {
    refreshData: function( ) {
      const self = this;
    },
    sendEmail: function()
    {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('email/post', self.thisEmail)
        .then(function(x) {
          var res = JSON.parse(x.data).data;
        });

    },
  }
}
</script>
