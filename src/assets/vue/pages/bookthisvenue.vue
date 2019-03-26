<template>
  <f7-page @page:init="oninit" @page:refresh="oninit">

    <f7-navbar title="Booking" back-link="Back"></f7-navbar>

    <f7-page-content>

      <f7-block>

        <form id="booking_request_form" class="list form-store-data">
        <f7-list no-hairlines-md>

          <f7-list-item  title="Venue"
                         smart-select 
                         :smart-select-params="{closeOnSelect: true}">
            <select v-model="venueID" name="venue_id">
              <option v-for="(vid, index) in venueIDs" :value="vid">{{vid}}</option>
            </select>
          </f7-list-item>

          <f7-list-item title="Start">
            <date-picker 
                      name="start_date_time"
                      v-model="startDateTime" 
                      format="MMM DD hh:mm A"
                      :minute-step="15"
                      type="datetime" 
                      lang="en"
                      >
            </date-picker>
          </f7-list-item>

          <f7-list-item title="End">
            <date-picker name="end_date_time"
                      v-model="endDateTime" 
                         format="MMM DD hh:mm A"
                         type="datetime" 
                         :minute-step="15"
                         :not-before="startDateTime"
                         lang="en"
                         >
            </date-picker>
          </f7-list-item>

          <f7-list-item title="Class of event" smart-select
                        :smart-select-params="{closeOnSelect: true}"
                        >
            <select name="class">
              <option v-for="(cl, index) in classes" :key="cl" :value="cl">{{ cl }}</option>
            </select>
          </f7-list-item>

          <f7-list-input name="title" ref="title" type="text" placeholder="Title of your event">
          </f7-list-input>

          <f7-list-input name="description" ref="description" type="textarea" placeholder="Description">
          </f7-list-input>

          <f7-list-input name="url" ref="url" type="url" placeholder="External Link (URL)">
          </f7-list-input>

          <f7-list-input name="is_public_event"
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
      return {
        venueID: params.venueId,
        venueIDs: [params.venueId],
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
      checkAndSubmit : function()
      {
        const self = this;
        const app = self.$f7;
        var fdata = app.form.convertToData('#booking_request_form');

        var errorMsg = '';
        if(fdata.title.trim().length == 0)
          errorMsg += ' Title is empty.';
        if(fdata.class.trim().length == 0)
          errorMsg += ' You have not selected class of event';
        if(fdata.class.trim() == 'UNKNOWN')
          errorMsg += " Selected class is 'UNKNOWN'";

        if( errorMsg.length > 0)
        {
          console.log('Error msg', errorMsg);
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
        var okToBook = true;
        var link = self.$store.state.api +
            '/venue/status/'+this.venueID
            +'/'+moment(this.startDateTime).format('X')
            +'/'+moment(self.endDateTime).format('X');

        app.request.post(link, this.apiPostData(), 
          function(data) 
          {
            const res = JSON.parse(data);
            console.log( res.data[self.venueID] );
            if(res.data[self.venueID].length > 0)
            {
              app.notification.create({ 
                icon: '<i class="fa fa-exclamation-circle"></i>',
                title: "This venue is already occupied.",
                subtitle: errorMsg,
                closeButton: true,
                closeTimeout: 3000,
              }).open();
              okToBook = false;
            }
          }
        );

        if(! okToBook)
          return;

        // Else submit booking request.
        console.log('OK', 'Ok to book');
        link = self.$store.state.api+'/venue/book/'+this.venueID 
          +'/'+moment(this.startDateTime).format('X') 
          +'/'+moment(self.endDateTime).format('X');

        var data = Object.assign(fdata, self.apiPostData());

        console.log('booking link', link);
        console.log(data);
        app.request.post(link, data,
          function(data) 
          {
            console.log("Success", data);
          }
          , function(data) 
          {
            console.log( "Failed to send query.");
          }
        );
      },
    }, 
  }; 
</script>
