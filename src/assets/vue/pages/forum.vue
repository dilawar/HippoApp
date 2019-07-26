<template>
   <f7-page ptr @ptr:refresh="refreshForum">
    <f7-navbar title="Forum" back-link="Back">
    </f7-navbar>

    <f7-block>
    </f7-block>

  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
   data() {
      return {
         forumCards: [],
      };
   },
   mounted() {
      const self = this;
      self.forumCards = self.loadStore('forumCards');
      if( ! self.forumCards || self.forumCards.length == 0)
      {
         console.log( "Fetching forum cards ... " );
         setTimeout( () => {
            self.postWithPromise( '/forum/list/100').then(
               function(json) 
               {
                  self.forumCards = JSON.parse(json).data;
                  self.saveStore('forumCards', self.forumCards);
               }
            )}, 2000);
      }
   },
   methods: { 
      // METHODS:
   },
};
</script>
