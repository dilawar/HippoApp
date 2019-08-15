<template>
   <f7-page ptr @ptr:refresh="refreshNotification">
    <f7-navbar title="Notifications" back-link="Back">
    </f7-navbar>
    <span style="font-size:small">Swipe left/right to do more.</span>

    <f7-block-title>Unread notifications</f7-block-title>
    <f7-block style="background-color:red">
    <f7-list media-list>
      <f7-list-item v-for="(item, key) in notifications.filter(x=>x.is_read==false)"
               :key="'U'+key"
               :title="item.title"
               :text="item.text"
               swipeout
      >
         <div slot="footer"> Recieved {{toNow(item.created_on)}} ago.</div>
         <f7-swipeout-actions left>
            <f7-swipeout-button close 
               @click="markNotificationRead(item.id)">
               Mark Read
            </f7-swipeout-button>
         </f7-swipeout-actions>
      </f7-list-item>
   </f7-list>
   </f7-block>

   <f7-block-title>Read notifications</f7-block-title>
   <f7-block>
   <f7-list media-list>
      <!-- Read items. -->
      <f7-list-item v-for="(item, key) in notifications.filter(x=>x.is_read==true)"
               :key="'R'+key"
               :text="item.text"
               swipeout
      >
         <div slot="footer"> Recieved {{toNow(item.created_on)}} ago.</div>
         <div slot="title" style="font-color:gray"> {{item.title}} </div>
         <f7-swipeout-actions left>
            <f7-swipeout-button close
               @click="markNotificationUnread(item.id)">
               Mark Unread
            </f7-swipeout-button>
         </f7-swipeout-actions>
      </f7-list-item>
    </f7-list>
    </f7-block>
  </f7-page>

</template>

<script>
import moment from 'moment';

export default {
   data() {
      const self = this;
      return {
         notifications: self.loadStore('notifications'),
      };
   },
   mounted() {
      const self = this;
      self.notifications = self.loadStore('notifications');
   },
   methods: { 
      refreshNotification: function(e, done) {
         const self = this;
         setTimeout( () => {
            self.fetchNotifications();
            done();
         }, 1500);
      },
      markNotificationRead: function(nid) {
         const self = this;
         setTimeout( () => {
            self.sendRequest( '/notifications/markread/'+nid);
            // Mark it read.
            self.notifications.forEach((v, i) => {
               if( v.id == nid )
                  self.notifications[i].is_read = true;
            });
         }, 1000);

      },
      markNotificationUnread: function(nid) {
         const self = this;
         setTimeout( () => {
            self.sendRequest( '/notifications/markunread/'+nid);
            // Mark it unread.
            self.notifications.forEach((v, i) => {
               if( v.id == nid )
                  self.notifications[i].is_read = false;
            });
         }, 1000);
      },
   },
};
</script>
