<template>
  <f7-page>
    <f7-navbar title="title" back-link="Back">
    </f7-navbar>

    <!--
    <f7-block>
      <f7-list>
        <f7-list-group media-list no-hairlines>
          <f7-list-item header="Speaker" 
                        :title="thisTalk.speaker"
                        footer="You can't change the speaker">
          </f7-list-item>
          <f7-list-input label="Class" 
                         :title="thisTalk.class">
          </f7-list-input>
          <f7-list-input label="Title" 
                         type="textarea" 
                         :value="thisTalk.title">
          </f7-list-input>
          <f7-list-input label="Decription" :input="false">
            <vue-editor slot="input" v-model="thisTalk.description">
            </vue-editor>
          </f7-list-input>
        </f7-list-group>

      </f7-list>

      <f7-row>
        <f7-col>
          <f7-button popup-close raised outline>
          </f7-button>
        </f7-col>
      </f7-row>
    </f7-block>
    -->

  </f7-page>
  </f7-popup>
  </f7-page>
</template>

<script>
  export default {
    data() {
      const self = this;
      return {
        talkid : self.$f7router.params.talkid,
        thisTalk: [],
      };
    },
    mounted()
    {
      const self = this;
      self.promiseWithAuth('talk/get/'+self.talkid)
        .then( function(x) {
          self.thisTalk = JSON.parse(x.data).data;
        });
    },
    methods : {
      refreshData: function( ) {
        const self = this;
      },
    }
  }
</script>
