<template>
  <f7-page @page:init="oninit" @page:refresh="oninit">

    <f7-navbar title="Booking" back-link="Back"></f7-navbar>

    <f7-page-content>

      <f7-block>

        <form id="booking_request_form" class="list form-store-data">
        <f7-list no-hairlines-md>

          <f7-list-item :title="`${venueID}`" smart-select >
            <select v-model="venueID" name="venueid">
              <option v-for="(vid, index) in venueIDs" :value="vid">{{vid}}</option>
            </select>
          </f7-list-item>

          <f7-list-item>
            <date-picker 
                      name="start_date_time"
                      v-model="startDateTime" 
                      format="MMM DD hh:mm A"
                      type="datetime" 
                      lang="en"
                      >
            </date-picker>
          </f7-list-item>

          <f7-list-item>
            <date-picker name="end_date_time"
                      v-model="endDateTime" 
                         format="MMM DD hh:mm A"
                         type="datetime" 
                         lang="en"
                         >
            </date-picker>
          </f7-list-item>

          <f7-list-item title="Class of event" smart-select>
            <select v-model="selectedClass" name="class">
              <option v-for="(cl, index) in classes" :key="cl" :value="cl">{{ cl }}</option>
            </select>
          </f7-list-item>

          <f7-list-input name="title" ref="title" type="text" placeholder="Title of your event">
          </f7-list-input>

          <f7-list-input name="description" ref="description" type="textarea" placeholder="Description">
          </f7-list-input>

          <f7-list-input name="url" ref="url" type="url" placeholder="External Link (URL)">
          </f7-list-input>

          <f7-list-input ref="is_public_event"
            label="Add to NCBS calendar?" type="select" defaultValue="NO">
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </f7-list-input>

          <f7-list-item>
            <f7-button raised filled @click="checkAndSubmit"> Send Booking Request </f7-button>
          </f7-list-item>
        </f7-list>
        </form>
      </f7-block>
    </f7-page-content>
  </f7-page>

</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD hh:mm';

  export default {
    data() {
      const params = this.$f7route.params;
      console.log('init data', params);

      return {
        selectedClass: 'UNKNOWN',
        venueID: params.venueId,
        venueIDs: [params.venueID],
        startDateTime: moment(params.startDateTime, 'x'),
        endDateTime: moment(params.endDateTime, 'x'),
        classes: new Set(this.$localStorage.get('classes').split(',')),
      };
    },
    methods: {
      oninit: function() {
        const self = this;
        const app = self.$f7;
        self.venueIDs = self.$localStorage.get('venueIDs').split(',');
      },
      checkAndSubmit : function( ){
        const self = this;
        const app = self.$f7;
        var fdata = app.form.convertToData('#booking_request_form');
        console.log(fdata);

        var errorMsg = '';
        if(fdata.title.trim().length == 0)
          errorMsg += ' Title is empty.';
        if(fdata.class.trim().length == 0)
          errorMsg += ' You have not selected class of event';
        if(fdata.class.trim() == 'UNKNOWN')
          errorMsg += " Selected class is 'UNKNOWN'";

        if( errorMsg.length > 0)
        {
          app.notification.create({ 
            icon: '<i class="fa fa-exclamation-circle"></i>',
            title: "Something is wrong!",
            subtitle: errorMsg,
            closeButton: true,
            closeTimeout: 3000,
          }).open();
          return;
        }

        // Now check if venue is free at this time and date.
        var status = false;
        app.request.post( self.$store.state.api + '/status/venue/'+venueID+'/'+startDateTime+'/'+endDateTime
          , { }
          , function(data) {
          });

      },
    },
  }; 

</script>
