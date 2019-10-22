<template>
  <f7-page>
    <f7-navbar title="Manage talk" back-link="Back">
    </f7-navbar>

    <f7-block>
      <f7-list>
        <f7-list-group media-list no-hairlines>
          <f7-list-item header="Speaker" 
                        :title="thisTalk.speaker"
                        footer="You can't change the speaker">
          </f7-list-item>
          <f7-list-item header="Class" 
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
                         @input="thisTalk.title = $event.target.value"
                         :value="thisTalk.title">
          </f7-list-input>

          <f7-list-input label="Decription" 
                         type="texteditor"
                         resizable
                         @input="thisTalk.description=$event.target.value"
                         :value="thisTalk.description">
          </f7-list-input>

          <!--
          <f7-list-input :input="false" label="Description">
            <vue-editor slot="input" 
                        id="description_editor"
                        v-model="thisTalk.description">
            </vue-editor>
          </f7-list-input>
          -->

        </f7-list-group>

        <f7-list-group v-if="thisTalk.booking" media-list>
          <f7-list-item>
            <div slot="title" style="font-size:small">
              Booking status: {{thisTalk.booking_status}}
            </div>
            <div slot="text" v-if="thisTalk.booking_status !== 'UNSCHEDULED'">
              {{ thisTalk.booking.date | date }},
              {{ thisTalk.booking.start_time | clockTime }} to
              {{thisTalk.booking.end_time | clockTime}},
              {{ thisTalk.booking.venue }}
            </div>

            <!-- TASKS -->
            <f7-button small
                       color="red"
                       slot="after"
                       class="float-right" 
                       @click="removeBooking()"
                       v-if="thisTalk.booking_status!=='UNSCHEDULED'">
              Remove Booking
            </f7-button>
            <f7-button raised
                       small
                       class="float-right" 
                       slot="after"
                       :href="'/bookevent/talks.'+thisTalk.id+'/'+thisTalk.class+'/'"
                       v-else>
              Schedule
            </f7-button>
          </f7-list-item>

          <f7-list-item>
            <f7-row>
              <f7-col>
                <f7-button @click="removeTalk()"
                       small
                       fill
                       popup-close 
                       color="red"
                       raised>
                  Remove Talk
                </f7-button>
              </f7-col>
              <f7-col>
                <f7-button @click="updateTalk()" 
                       small
                       popup-close 
                       raised>
                  Update Talk
                </f7-button>
              </f7-col>
            </f7-row>
          </f7-list-item>

          <f7-list-item></f7-list-item>

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
        const app = self.$f7;
        self.promiseWithAuth('talk/update', self.thisTalk)
          .then( function(x) {
            var res = JSON.parse(x.data).data;
            var popup = {title: 'Success', subtitle: res.msg
              , closeButton: true, closeOnSelect:true
              , closeTimeout: 2000
            };
            if(! res.success) {
              popup.title = 'Failed'
              popup.closeTimeout = 10000;
            }
            app.notification.create(popup).open();
          });
      },
      removeBooking: function() 
      {
        const self = this;
        const app = self.$f7;
        var bk = self.thisTalk.booking;
        var endpoint = '';
        if(self.thisTalk.booking_status === 'PENDING')
          endpoint = 'mybooking/delete/request/'+bk.gid+'.'+bk.rid;
        else
          endpoint = 'mybooking/delete/event/'+bk.gid+'.'+bk.eid;

        // Prmise with auth.
        self.promiseWithAuth(endpoint)
          .then(function(x) {
            let res = JSON.parse(x.data).data;
            app.notification.create({
              title: res.success?"Success":"Failed",
              subtitle: res.msg, closeButton: true, closeOnClick: true,
              closeTimeout: res.success?2000:10000,
            }).open();
            self.promiseWithAuth('talk/get/'+self.thisTalk.id)
              .then( function(x) {
                self.thisTalk = JSON.parse(x.data).data;
              });
          });
      },
      removeTalk: function()
      {
        const self = this;
        const app = self.$f7;

        app.dialog.confirm( "Removing this talk", "Are you sure?"
          , function(x) {
              self.promiseWithAuth('talk/remove/'+self.thisTalk.id)
                .then( function(x) {
                  let res = JSON.parse(x.data).data;
                  self.$f7router.back({ignoreCache:true, force:true});
                  app.notification.create({ title: res.success?'Success':'Failed'
                    , subtitle: res.msg
                    , closeButton: true
                    , closeTimeout:5000 
                  }).open();
                });
          }, null);
      },
    },
  }
</script>
