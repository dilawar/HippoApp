<template>

  <f7-page @page:init="fetchMyBooking" @page:refresh="fetchMyBooking">
  <f7-navbar title="My Bookings" back-link="Back"></f7-navbar>

  <!--  Show venues as grid or list. -->
  <f7-page-content>

    <!-- Date and time -->
    <f7-list no-hairlines>
       <f7-list-item label="Date">
          <date-picker v-model="startDate" 
                       lang="en"
                       format="MMM DD, YYYY"
                       append-to-body
                       :popupStyle="{'z-index':10000}"
                       type="date"> 
          </date-picker>
         <f7-button title="Referesh" filled raised
                    @click="fetchMyBooking"
            >Refresh</f7-button>
       </f7-list-item>
    </f7-list>

    <f7-block-title>Pending requests</f7-block-title>
    <f7-list title="Select to cancel">
       <f7-list-item v-for="(val, item) in requests" 
                     swipeout  
                     @swipeout:deleted="deleteThisRequest(val.gid, val.rid)"
                     :footer="val.date+', '+val.start_time+' (' + val.venue + ')'"
                     :key="val.gid+val.rid"
                     :title="val.title"
                     >
         <f7-swipeout-actions right>
            <f7-swipeout-button title="Deleting request?" delete 
               confirm-text="Are you sure you want to delete this item?">Delete</f7-swipeout-button>
         </f7-swipeout-actions>
         <f7-swipeout-actions left>
            <f7-swipeout-button edit 
                                @click="editThisRequest(val.gid, val.rid)"
                               >Edit</f7-swipeout-button>
         </f7-swipeout-actions>
       </f7-list-item>
    </f7-list>

  </f7-page-content>
</f7-page>

</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
   data() {
      return {
         requests: [],
         events: [],
         startDate: moment(),
         endDate: '',
      };
   },
   methods: { 
      fetchMyBooking: function(data) 
      {
         const self         = this;
         const app          = self.$f7;
         self.isOpen        = false;

         var link = self.$store.state.api+'/mybooking/list/' +
            moment(self.startDate).format('X');
         console.log('Link is', link);
         app.request.post(link, this.apiPostData(),
            function(json) {
               var res = JSON.parse(json);
               self.requests = res.data.requests;
               self.events = res.data.events;
            }
         );
      },
      deleteThisRequest: function(gid, rid)
      {
         const self = this;
         const app = this.$f7;
         console.log( "Deleting ", gid, rid );
         var link = self.$store.state.api+'/mybooking/delete/request/'+gid+'.'+rid;
         console.log('Link is', link);
         app.request.post(link, this.apiPostData(), 
            function(json) {
               var res = JSON.parse(json);
               console.log(res);
               if( res.status == 'ok')
               {
                  app.notification.create( {
                     title: "Deleted",
                     subtitle: res.data[0],
                     closeButton: true,
                     closeOnClick: true,
                     closeTimeout: 3000,
                  }).open();
                  return;
               }
            }
         );
      },
      editThisRequest: function(gid, rid) {
         const self = this;
         const app = self.$f7;
         app.notification.create( {
            title: "Not implemented yet",
            closeTimeout: 3000,
            closeOnClick: true,
            closeButton: true,
         }).open();
      },
   },
};

</script>
