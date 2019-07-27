<template>
   <f7-page ptr @ptr:refresh="refreshForum">
    <f7-navbar title="Forum" back-link="Back">
    </f7-navbar>


    <f7-fab position="right-bottom" 
            slot="fixed" 
            color="blue"
            @click="postToForum">
            <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
            <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
    </f7-fab>

    <!-- Popup for updating. . -->
    <f7-popup :opened="updatePopup" ref="update_popup" @popup:closed="updatePopup = false">
      <f7-page>
         <f7-navbar title="Post to forum">
            <f7-nav-right>
               <f7-link popup-close>Cancel</f7-link>
            </f7-nav-right>
         </f7-navbar>

         <f7-block>
            <f7-list id="forum_post" form-store-data no-hairlines-md>
               <f7-list-item smart-select
                             :value="item.tags"
                             :smart-select-params="{ 
                                 openIn: 'popover'
                                 , pageTitle: 'Tags for your post'
                                 , routableModals: false
                             }" 
                             >
                             <select name="tags" v-model="item.tags" multiple>
                                <option v-for="tag in alltags" :value="tag">{{tag}}</option>
                             </select>
                     <div slot="title" style="font-size:x-small"
                        >Select at leasst one tag</div>
               </f7-list-item>

               <f7-list-input title="Informative title"
                              placeholder="Informative title"
                              :value="item.title"
                              @input="item.title = $event.target.value"
                              required 
                              validate
                              >
               </f7-list-input>


               <f7-list-input title="Description"
                              :value="item.description"
                              placeholder="Optional description"
                              @input="item.description = $event.target.value"
                              :resizable="true"
                              type="textarea" 
                              >
               </f7-list-input>

               <f7-list-item>
                  <f7-button raised fill
                             popup-close
                             @click="deleteCard(item.id)"
                             >Delete
                  </f7-button>
                  <f7-button raised fill
                             popup-close
                             @click="postToForumSubmit()"
                             >Submit
                  </f7-button>
               </f7-list-item>
            </f7-list>
         </f7-block>
      </f7-page>
    </f7-popup>

    <!-- Popup for positing . -->
    <f7-popup :opened="postPopup" ref="post_popup" @popup:closed="postPopup = false">
      <f7-page>
         <f7-navbar title="Post to forum">
            <f7-nav-right>
               <f7-link popup-close>Cancel</f7-link>
            </f7-nav-right>
         </f7-navbar>

         <f7-block>
            <f7-list id="forum_post" form-store-data no-hairlines-md>
               <f7-list-item smart-select
                             :value="item.tags"
                             :smart-select-params="{ 
                                 openIn: 'popover'
                                 , pageTitle: 'Tags for your post'
                                 , routableModals: false
                             }" 
                             >
                             <select name="tags" v-model="item.tags" multiple>
                                <option v-for="tag in alltags" :value="tag">{{tag}}</option>
                             </select>
                     <div slot="title" style="font-size:x-small"
                        >Select at leasst one tag</div>
               </f7-list-item>

               <f7-list-input title="Informative title"
                              placeholder="Informative title"
                              :value="item.title"
                              @input="item.title = $event.target.value"
                              required 
                              validate
                              >
               </f7-list-input>


               <f7-list-input title="Description"
                              :value="item.description"
                              placeholder="Optional description"
                              @input="item.description = $event.target.value"
                              :resizable="true"
                              type="textarea" 
                              >
               </f7-list-input>

               <f7-list-item>
                  <f7-button raised fill
                             popup-close
                             @click="postToForumSubmit()"
                             >Submit
                  </f7-button>
               </f7-list-item>
            </f7-list>
         </f7-block>
      </f7-page>
    </f7-popup>

  <f7-popup :opened="commentPopup" @popup:closed="commentPopup = false">
     <f7-page>
        <f7-navbar title="Comments">
           <f7-nav-right>
              <f7-link popup-close>Cancel</f7-link>
           </f7-nav-right>
        </f7-navbar>

        <f7-block>
           <f7-list no-hairlines>
              <f7-list-input label="Add comment"
                             :value="thisComment.comment"
                             @input="thisComment.comment = $event.target.value"
                             :resizable="true"
                             required
                             type="textarea" 
                             >
              </f7-list-input>
              <f7-list-item>
                 <f7-button raised 
                            popup-close
                            fill 
                            @click="addComment()" 
                            slot="after"
                            >
                            Submit
                 </f7-button>
                 <f7-button raised popup-close slot="title">Cancel</f7-button>
              </f7-list-item>
           </f7-list>
        </f7-block>
        <f7-block>
           <f7-block-title small>Existing comments</f7-block-title>
           <f7-list media-list no-hairlines>
              <!-- Existing comments. -->
              <f7-list-item v-for="(c, key) in comments"
                            :key="key"
                            :text="c.comment"
                            :footer="'By ' + c.commenter"
                            style="background-color:Ivory"
                            >
                            <f7-link v-if="c.commenter===getLogin()"
                                     slot="after"
                                     @click="deleteComment(c.id)"
                                     >Delete</f7-link>
              </f7-list-item>
           </f7-list>
        </f7-block>

     </f7-page>
  </f7-popup>


    <!-- Show current cards -->
    <f7-block>
       <f7-card v-for="(card, key) in forumCards" :key="key"
                swipe-to-close
                :padding="false"
                >
          <f7-card-header style="font-size:small">
             <div>
                <span v-for="(tag,key) in card.tags"
                        :key="key"><strong>r/{{tag}}</strong>&nbsp;</span>
             </div>
             <span style="color:gray">
                Posted by <tt>{{card.created_by}}</tt>
                {{datetime2Moment(card.created_on).fromNow()}}
             </span>
          </f7-card-header>
          <f7-card-content>
             <div style="font-size:small"> {{card.title}} </div>
             <div> {{card.description}} </div>
          </f7-card-content>
          <f7-card-footer no-border>
             <f7-button @click="updateCard(card)"
                          v-if="getLogin() == card.created_by">
                Update
             </f7-button>
             <f7-button @click="showCommentPopup(card)" float-right>
                ({{card.num_comments}}) Comments
             </f7-button>
          </f7-card-footer>
       </f7-card>
    </f7-block>

  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
   data() {
      return {
         forumCards: [],
         postPopup: false,
         commentPopup: false,
         updatePopup: false,
         thisComment: { 
            external_id: '' 
            , comment: ''
         },
         comments: [],
         alltags: [],
         item: {
            id: 0,
            title : '',
            description: '',
            created_by: '',
            tags: [],
            num_comments: 0,
         },
      };
   },
   mounted() {
      const self = this;
      self.forumCards = self.loadStore('forum.cards');
      self.alltags = self.loadStore('forum.alltags');
      if( ! self.forumCards || self.forumCards.length == 0)
      {
         setTimeout( () => {
            self.postWithPromise( '/forum/list/100').then(
               function(json) 
               {
                  self.forumCards = JSON.parse(json).data;
                  self.saveStore('forum.cards', self.forumCards);
               }
            );
            self.postWithPromise('/forum/alltags').then(
               function(json) {
                  self.alltags = JSON.parse(json).data;
                  self.saveStore('forum.alltags', self.alltags);
               }
            );
         }, 1000);
   },
   methods: { 
      // METHODS:
      getForumPosts: function() {
         console.log( "Fetching lists." );
         const self = this;
         self.promiseWithAuth( "/forum/list/20", []).then(
            function(json) {
               var res = JSON.parse(json).data;
               self.forumCards = res;
               self.saveStore('forum.cards', self.forumCards);
            }
         )
      },
      refreshForum: function(ev, done) {
         const self = this;
         setTimeout( () =>  {
            self.getForumPosts();
            self.fetchAllTags();
            done();
         }, 1000);
      },
      fetchAllTags: function() {
         const self = this;
         self.postWithPromise( '/forum/alltags').then(
            function(json) {
               self.alltags = JSON.parse(json).data;
               self.saveStore('forum.alltags', self.alltags);
            }
         );
      },
      postToForum: function() {
         const self = this;
         self.postPopup = true;
      },
      showCommentPopup: function( item ) {
         const self = this;

         self.thisComment.external_id = "forum." + item.id;

         // Get all previous comments to show as well.
         setTimeout( () => {
            self.promiseWithAuth("/comment/get/forum."+item.id).then(
               function(json) {
                  let res = JSON.parse(json).data;
                  self.comments = res;
               }
            )}, 1000);
         self.commentPopup = true;
      },
      addComment: function() {
         const self = this;
         setTimeout( () => {
            self.promiseWithAuth("/comment/post", self.thisComment)
         }, 1000);
      },
      postToForumSubmit: function() {
         const self = this;
         setTimeout(() => self.sendRequest('/forum/post', self.item), 500);
         self.commentPopup = false;
         self.item.num_comments += 1;
      },
      updateCard: function(card) {
         const self = this;
         self.item = card;
         self.updatePopup = true;
      },
      deleteCard: function(cid) {
         const self = this;
         self.sendRequest('/forum/delete/' + cid );

         // Remove the card from the list.
         self.forumCards = self.forumCards.filter( c => c.id != cid );
         self.saveStore('forum.cards', self.forumCards);
      },
   },
};
</script>
