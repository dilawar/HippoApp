<template>
   <f7-page ptr @ptr:refresh="refreshNotification">
    <f7-navbar title="Notifications" back-link="Back">
    </f7-navbar>
    <span style="font-size:small;float:right;">Swipe left/right to do more.</span>

    <!-- <f7-block-title>Unread notifications</f7-block-title> -->
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

   <f7-block>
   <f7-block-header>
     <f7-row>
       <f7-col noGap width="25" v-for="(tag, key) in boards" :key="key">
         <f7-link @click="unsubscribeForum(tag)" icon="fa fa-bell-o" v-if="subscriptions.includes(tag)">{{tag}}</f7-link>
         <f7-link @click="subscribeForum(tag)" icon="fa fa-bell-slash-o" v-else>{{tag}}</f7-link>
       </f7-col>
     </f7-row>
   </f7-block-header>

   <f7-block-title medium>Notifications</f7-block-title>
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
      boards: [],
      subscriptions: [],
    };
  },
  mounted() {
    const self = this;
    self.notifications = self.loadStore('notifications');
    self.refreshForum();
  },
  methods: { 
    refreshNotification: function(e, done) {
      const self = this;
      setTimeout( () => {
        self.fetchNotifications();
        done();
      }, 1500);
    },
    refreshForum: function() {
      const self = this;
      self.postWithPromise('/forum/alltags').then( function(x) {
        self.boards = JSON.parse(x.data).data;
      });
      self.postWithPromise('/forum/subscriptions').then( function(x) {
        self.subscriptions = JSON.parse(x.data).data;
      });
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
    subscribeForum: function(board) {
      const self = this;
      self.postWithPromise('/forum/subscribe/'+board).then( function(x) {
        self.refreshForum();
        cordova.plugins.firebase.messaging.subscribe(board);
      });
    },
    unsubscribeForum: function(board) {
      const self = this;
      self.postWithPromise('/forum/unsubscribe/'+board).then( function(x) {
        self.refreshForum();
        cordova.plugins.firebase.messaging.unsubscribe(board);
      });
    },
  },
};
</script>
