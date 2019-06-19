<template >
   <f7-page page-content>
      <f7-navbar title = "Booking" back-link = "Back" > </f7-navbar >
      <f7-block>
         <f7-list no-hairlines-md>

            <f7-list-input name="venue" 
                           type="text"
                           label="Selected Venue"
                           v-model="request.venue"
                           disabled
                           readonly>
            </f7-list-input>

            <f7-list-item>
               <date-picker v-bind:value="startDateTime"
                            format="MMM DD, HH:mm A"
                            lang="en" 
                            type="datetime"
                            label="Start Datetime"
                            disabled
                            readonly>
               </date-picker>
            </f7-list-item>

            <f7-list-item>
               <date-picker v-bind:value="endDateTime"
                            format="MMM DD, HH:mm A"
                            type="datetime"
                            lang="en"
                            label="End Datetime"
                            disabled
                            readonly>
               </date-picker>
            </f7-list-item>

            <f7-list-item title="Class of event" smart-select :smart-select-params="{closeOnSelect:true}">
               <select v-model="request.class">
                  <option v-for="(cl, index) in classes" :key="cl" :value="cl">{{ cl }}</option>
               </select>
            </f7-list-item>

            <f7-list-input :value="request.title"
                          @input="request.title=$event.target.value"
                          type="text" placeholder="Title of your event">
            </f7-list-input>

            <f7-list-input :value="request.description" 
                           @input="request.description=$event.target.value"
                           type="textarea" 
                           placeholder="Description">
            </f7-list-input>

            <f7-list-input v-model="request.url" type="url" placeholder="External Link (URL)">
            </f7-list-input>

            <f7-list-input :value="request.is_public_event"
                           label="Add to NCBS calendar?" type="select" defaultValue="NO">
               <option value="YES">Yes</option>
               <option value="NO">No</option>
            </f7-list-input>

            <f7-list-item>
               <f7-button slot="after" 
                  raised fill @click="checkAndSubmit">Send Booking Request</f7-button>
            </f7-list-item>
         </f7-list>

      </f7-block>
   </f7-page>
</template>

<script>

import moment from 'moment';

export default {
   data() {
      const routeP = this.$f7route.params;
      console.log('route', routeP.startDateTime, routeP.endDateTime);
      console.log('route'
         , moment(routeP.startDateTime, 'X').format('YYYY-MM-DD HH:mm')
         , moment(routeP.endDateTime, 'X').format('YYYY-MM-DD HH:mm')
      );
      return {
         startDateTime: moment(routeP.startDateTime, 'X'),
         startDateTimeStamp: routeP.startDateTime,
         endDateTime: moment(routeP.endDateTime, 'X'),
         endDateTimeStamp: routeP.endDateTime,
         venueIDs: [routeP.venue],
         request: {
            venue: routeP.venue,
            class: 'UNKNOWN',
            title: '',
            description: '',
            url: '',
            is_public_event: "NO",
         },
         classes: new Set(this.$localStorage.get('classes').split(',')),
      };
   },
   methods: {
      checkAndSubmit : function()
      {
         const self = this;
         const app = self.$f7;
         const fdata = this.request;

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
            '/venue/status/'+fdata.venue+'/'+self.startDateTimeStamp+'/'+self.endDateTimeStamp;

         app.request.post(link, this.apiPostData(), 
            function(data) 
            {
               const res = JSON.parse(data);
               if(res.data[self.request.venue].length > 0)
               {
                  app.notification.create({ 
                     icon: '<i class="fa fa-2x fa-exclamation-circle"></i>',
                     title: "This venue is already occupied.",
                     subtitle: errorMsg,
                     closeButton: true,
                     closeTimeout: 3000,
                  }).open();
                  okToBook = false;
                  self.$f7router.back();
                  return;
               }
            }
         );

         if(! okToBook)
            return;

         // Everything looks fine. Submit the booking request.
            console.log('OK', 'Ok to book');

         link = self.$store.state.api+'/venue/book/'+self.request.venue 
            +'/'+self.startDateTimeStamp+'/'+self.endDateTimeStamp;

         // Collect form data and authentication data into a POST request.
         var data = Object.assign(fdata, self.apiPostData());
         data['created_by'] = data['login'];

         app.request.post(link, data,
            function(json) 
            {
               var res = JSON.parse(json);
               if(res.data.success)
               {
                  app.notification.create({ 
                     icon: '<i class="fa fa-thumbs-up"></i>',
                     title: "Success",
                     subtitle: "Your request is successfully submitted. No email is sent!",
                     closeButton: true,
                     closeTimeout: 3000,
                  }).open();

                  self.$f7router.navigate('/');
               }
               else
               {
                  console.log( "Failure . " + res.data.msg );
                  app.notification.create({ 
                     icon: '<i class="fa fa-thumbs-down"></i>',
                     title: "Failure",
                     subtitle: res.data.msg,
                     closeButton: true,
                     closeTimeout: 5000,
                  }).open();

                  self.$f7router.navigate('/');
               }
            }, 
         );
      },
   }, 
}; 
</script>
