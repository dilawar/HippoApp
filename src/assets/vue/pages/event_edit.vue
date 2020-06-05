<template>
  <f7-page>
    <f7-navbar title="Editing event" back-link="Back">
    </f7-navbar>

    <f7-block>
      <f7-block-header>
        You can edit only few values here. Ask the booking party to edit other
        fields or create a fresh new booking.
      </f7-block-header>
      <f7-list no-hairlines>
        <template v-for="val, key in thisEvent" >
          <f7-list-item :key="key" :title="key" 
            v-if="! (key in editables)">
            <div v-html="val"></div>
          </f7-list-item>
          <f7-list-input :label="key"
            :value="val" 
            :type="editables[key]"
            @change="thisEvent[key] = $event.target.value"
            v-else>
          </f7-list-input>
        </template>
        <f7-list-item>
          <f7-button raised fill 
            @click="updateEvent"
            slot="after">Submit</f7-button>
        </f7-list-item>
      </f7-list>
    </f7-block>

    <!-- THESE ARE CONFIRMED EVENTS -->

    <!-- POPUPS -->
    <!-- POPUP  -->
    <f7-popup >
      <f7-page>
        <f7-navbar title="Update Booking(s)">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
  data() {
    const self = this;
    return {

      thisGid : self.$f7route.params.gid,
      thisEid : self.$f7route.params.eid,
      thisBooking: {confirmed:false, title:'', description:'', 'vc_url':''},
      thisEvent: [],
      theseEvents : [],
      updateGroup: false,
      popupEditBooking: false,
      editables : { vc_url:'url', url:'url' },

      // Classes of events.
      classes: [],
    };
  },
  mounted: function() {
    const self = this;

    var endpoint = '/events/get/'+self.thisGid;
    self.updateGroup = true;
    if(self.thisEid) {
      endpoint += '/'+self.thisEid;
      self.updateGroup = false;
    }

    self.postWithPromise(endpoint).then(function(x) {
      let res = JSON.parse(x.data).data;
      // First item represent the group. When updating group, just update the
      // first guy.
      self.thisEvent = self.updateGroup ? res[0] : res;
      self.theseEvents = self.updateGroup ? res : [ res ];
    });

    self.promiseWithAuth('info/bmv/bookingclasses')
      .then( function(x) {
        self.classes = JSON.parse(x.data).data.all;
      });
  },
  methods: { 
    updateEvent: function() {
      const self = this;
      let endpoint = '/bmvadmin/event/update';
      self.theseEvents.forEach(ev => {

        Object.keys(self.editables).forEach(x => ev[x] = self.thisEvent[x]);

        self.promiseWithAuth(endpoint, ev).then( function(x) {
            let res = JSON.parse(x.data).data;
            if(res.success)
              self.notify('Success', 'Updated successfully.');
            else
              self.notify('Failed', 'Could not update.');
          });
      });
    }
  }
};
</script>
