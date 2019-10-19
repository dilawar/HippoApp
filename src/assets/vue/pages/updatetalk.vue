<template>
  <f7-page>
    <f7-navbar title="title" back-link="Back">
    </f7-navbar>

    <f7-block>
      <f7-list>
        <f7-list-group media-list no-hairlines>
          <f7-list-item header="Speaker" 
                        :title="thisTalk.speaker"
                        footer="You can't change the speaker">
          </f7-list-item>
          <f7-list-item label="Class" 
                        :title="thisTalk.class"
                        :smart-select-params="{openIn:'popover', closeOnSelect:true}"
                        smart-select>
            <select v-model="thisTalk.class">
              <option v-for="(cls, key) in classes" 
                      :value="cls"
                      :key="key">
              {{cls}}
              </option>
            </select>
          </f7-list-item>
          <f7-list-input label="Title" 
                         type="textarea" 
                         :value="thisTalk.title">
          </f7-list-input>
          <f7-list-input label="Decription" :input="false">
            <vue-editor slot="input" v-model="thisTalk.description">
            </vue-editor>
          </f7-list-input>
        </f7-list-group>

        <f7-list-group v-if="thisTalk.booking" media-list>
          <f7-list-item :header="thisTalk.booking_status">
            <div slot="text" v-if="thisTalk.booking">
              {{ thisTalk.booking.date | date }},
              {{ thisTalk.booking.start_time | clockTime }} to
              {{thisTalk.booking.end_time | clockTime}},
              {{ thisTalk.booking.venue }}
            </div>

            <!-- TASKS -->
            <f7-button raised small
                       color="red" slot="footer" class="float-right" v-if="thisTalk.booking">
              Remove Booking
            </f7-button>
            <f7-button raised small class="float-right" slot="footer" v-else>
              Schedule
            </f7-button>
          </f7-list-item>

          <f7-list-item>
            <f7-button @click="updateTalk()" popup-close raised fill slot="after">
              Update This Talk
            </f7-button>
          </f7-list-item>

        </f7-list-group>
      </f7-list>
    </f7-block>
  </f7-page>
</template>

<script>
  export default {
    data() {
      const self = this;
      return {
        talkid : self.$f7route.params.talkid,
        classes: [],
        thisTalk: [],
      };
    },
    mounted()
    {
      const self = this;
      console.log(self.$f7route.params);
      self.promiseWithAuth('info/bmv/bookingclasses')
        .then( function(x) {
          self.classes = JSON.parse(x.data).data.public;
        });
      self.promiseWithAuth('talk/get/'+self.talkid)
        .then( function(x) {
          self.thisTalk = JSON.parse(x.data).data;
        });
    },
    methods : {
      refreshData: function( ) {
        const self = this;
      },
      updateTalk: function()
      {
        const self = this;
        self.promiseWithAuth('talk/update', self.thisTalk)
          .then( function(x) {
            var res = JSON.parse(x.data).data;
          });
      },
    }
  }
</script>
