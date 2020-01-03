<template>
  <f7-page page-content ptr @ptr:refresh="fetchAccomodations">
    <f7-navbar title="Accomodation" back-link="Back">
      <f7-nav-right>
        <f7-link class="searchbar-enable" 
                 data-searchbar=".searchbar-acc" 
                 icon-ios="f7:search" icon-aurora="f7:search" icon-md="material:search"
                                                              >
        </f7-link>
      </f7-nav-right>
      <f7-searchbar class="searchbar-acc"
                    expandable
                    search-container=".search-list-acc"
                    search-in=".item-title,.item-subtitle,.item-footer,.acc-content,.accordian-item-content"
                    >
      </f7-searchbar>
    </f7-navbar>

   <!-- List of accomodations -->
    <f7-photo-browser ref="standalone"></f7-photo-browser>

    <f7-block-title medium>Available Accomodations</f7-block-title>
    <f7-card v-for="(acc, key) in accomodations.list" 
             :key="key"
             v-if="acc.status=='AVAILABLE'"
             >

             <!-- header -->
      <f7-card-header
        :style="`font-size:90%;background-color:${stringToColour(acc.status)}`" 
        >
        <div>
          {{acc.type}}, Available from {{humanReadableDate(acc.available_from)}}
        </div>
        <div> {{acc.address}} </div>
      </f7-card-header>

      <!-- Card content -->
      <f7-card-content v-linkified>
        <br />
        <span v-for="(val, key) in acc">
          <span v-if="showKeys.find(k => k===key) && val.length > 0">
            <span style="font-size:70%">{{formatKey(key)}}</span>
            <!-- filter does not work with v-html. moutache doesn't
              render html. Hence this hack: see
              https://github.com/vuejs/vue/issues/4352
            -->
            <span style="margin-right:2ex;"
                  v-html="$options.filters.phone(val)"></span>
            <br />
          </span>
        </span>

        <div  style="font-size:x-small;">
          <f7-icon icon="fa fa-bell fa-fw"></f7-icon>
          Posted by: {{acc.created_by}}, {{str2Moment(acc.created_on).fromNow()}}
          <span v-if="acc.last_modified_on">
            (modified {{str2Moment(acc.last_modified_on
            , 'YYYY-MM-DD HH:mm:ss').fromNow()}})
          </span>
        </div>
      </f7-card-content>

      <!-- Card footer -->
      <f7-card-footer style="font-size:small;padding:0px">
        <f7-button small @click="updateAction(acc)" >Update </f7-button>
        <f7-button small :href="'/osm/accomodation/'+acc.id+'/'">Locate</f7-button>
        <f7-button small 
                   v-if="isUserAuthenticated()" 
                   @click="addComment(acc)"
                   >Comment ({{acc.num_comments}})
        </f7-button>

      </f7-card-footer>
    </f7-card>

    <f7-block-title>Unavailable Accomodations</f7-block-title>
    <f7-card v-for="(acc, key) in accomodations.list" 
             :key="key"
             v-if="acc.status!='AVAILABLE'"
             >

             <!-- header -->
      <f7-card-header
        :style="`font-size:90%;background-color:${stringToColour(acc.status)}`" 
        >
        <div>
          {{acc.type}}, Available from {{humanReadableDate(acc.available_from)}}
        </div>

        <div> {{acc.address}} </div>
      </f7-card-header>

      <!-- Card content -->
      <f7-card-content v-linkified>
        <span v-for="(val, key) in acc">
          <span v-if="showKeys.find(k => k===key) && val.length > 0">
            <span style="font-size:70%">{{formatKey(key)}}</span>
            <!-- filter does not work with v-html. moutache doesn't
              render html. Hence this hack: see
              https://github.com/vuejs/vue/issues/4352
            -->
            <span style="margin-right:2ex;"
                  v-html="$options.filters.phone(val)"></span>
            <br />
          </span>
        </span>

        <div class="watermark">{{acc.status}}</div>

        <div  style="font-size:x-small;">
          <f7-icon icon="fa fa-bell fa-fw"></f7-icon>
          Posted by: {{acc.created_by}}, {{str2Moment(acc.created_on).fromNow()}}
          <span v-if="acc.last_modified_on">
            (modified {{str2Moment(acc.last_modified_on
            , 'YYYY-MM-DD HH:mm:ss').fromNow()}})
          </span>
        </div>
      </f7-card-content>
      <!-- Card footer -->
      <f7-card-footer style="font-size:small;padding:0px">
        <f7-button small @click="updateAction(acc)" >Update </f7-button>
        <f7-button small :href="'/osm/accomodation/'+acc.id+'/'">Locate</f7-button>
        <f7-button small 
                   v-if="isUserAuthenticated()" 
                   @click="addComment(acc)"
                   >Comment ({{acc.num_comments}})
        </f7-button>

      </f7-card-footer>
    </f7-card>

  <!-- FAB to create accomodation -->
  <f7-fab v-if="isUserAuthenticated()"
          position="right-top" 
          slot="fixed" 
          @click="popupOpened=true"
          color="green"
          >
     <f7-icon ios="f7:add" aurora="f7:add" md="material:add"></f7-icon>
  </f7-fab>

  <f7-popup :opened="commentPopupOpened" @popup:closed="commentPopupOpened = false">
     <f7-page>
        <f7-navbar title="Comments">
           <f7-nav-right>
              <f7-link popup-close>Cancel</f7-link>
           </f7-nav-right>
        </f7-navbar>


        <f7-block>

        <!-- Submit comment. -->
        <f7-block>
           <f7-card v-for="(c, key) in comments" :key="key">
              <f7-card-content :padding="false" style="margin:2px"> 
                 {{c.comment}} 
              </f7-card-content>
              <f7-card-footer style="font-size:small">
                 <div> By {{c.commenter}} </div>
                 <div>
                    <f7-button small  v-if="c.commenter===getLogin()"
                                      slot="after"
                                      @click="deleteComment(c.id)"
                                      >Delete
                    </f7-button>
                 </div>
              </f7-card-footer>
           </f7-card>
        </f7-block>

        <!-- Input comment -->

        <f7-list media-list no-hairlines>
           <f7-list-input :value="thisComment"
                          @input="thisComment = $event.target.value"
                          :resizable="true"
                          placeholder="Your comment here"
                          required
                          type="textarea" 
                          >
           </f7-list-input>
           <f7-list-item>
              <f7-button raised 
                         popup-close
                         fill 
                         @click="submitComment(thisAccomodation.id)" 
                         slot="after"
                         >
                         Submit
              </f7-button>
              <f7-button raised popup-close slot="title">Cancel</f7-button>
           </f7-list-item>
        </f7-list>

     </f7-block>
  </f7-page>

</f7-popup>

  <f7-popup :opened="popupOpened" @popup:closed="popupOpened = false">
     <f7-page>
        <f7-navbar :title="`${popupAction} Accomodation`">
           <f7-nav-right>
              <f7-link popup-close>Cancel</f7-link>
           </f7-nav-right>
        </f7-navbar>

        <f7-block>

           <f7-list no-hairlines-md inset>
              <f7-list-input label="Type"
                             :value="accomodation.type"
                             @input="accomodation.type = $event.target.value"
                             type="select"
                             defaultValue="1BHK"
                             placeholder="Please choose ..."
                             required 
                             validate
                             >
                  <option v-for="typ in accomodations.types" :value="typ">
                     {{typ}}
                  </option>
              </f7-list-input>

              <f7-list-input label="Available From" :input="false">
                 <date-picker lang="en"
                              v-model="accomodation.available_from"
                              slot="input"
                              type="date"
                              format="YYYY-MM-DD"
                              readonly
                              >
                  </date-picker>
              </f7-list-input>

              <f7-list-input label="Open Vacancies"
                             @input="accomodation.open_vacancies=$event.target.value"
                             type="int"
                             :defaultValue="1"
                             required
                             >
              </f7-list-input>

              <f7-list-input label="Available For (Gender)"
                             @input="accomodation.available_for=$event.target.value"
                             type="select"
                             required
                             >
                  <option v-for="(val, key) in accomodations.available_for" 
                          :value="val" :key="key"
                          > {{val}} </option>
              </f7-list-input>

               <f7-list-input label="Address"
                              type="text"
                              :input="false" 
                              >
                  <input id="autocomplete-dropdown-expand"  
                         :value="accomodation.address"
                         slot="input" type="text" />
               </f7-list-input>

              <f7-list-input label="Description"
                             :value="accomodation.description"
                             @input="accomodation.description = $event.target.value"
                             :resizable="true"
                             type="textarea" 
                             >
              </f7-list-input>
              <f7-list-input label="Owner Contact"
                             :value="accomodation.owner_contact"
                             @input="accomodation.owner_contact = $event.target.value"
                             :resizable="true"
                             required
                             type="textarea" 
                             >
              </f7-list-input>
              <f7-list-input label="Rent"
                             :value="accomodation.rent"
                             @input="accomodation.rent = $event.target.value"
                             required
                             validate
                             pattern="[0-9]{3,7}"
                             >
              </f7-list-input>

              <f7-list-input label="Extra e.g. elecricity water"
                               :value="accomodation.extra"
                               @input="accomodation.extra = $event.target.value"
                               type="text" 
                               >
              </f7-list-input>

              <f7-list-input label="Advance"
                             :value="accomodation.advance"
                             @input="accomodation.advance = $event.target.value"
                             type="text" 
                             validate
                             pattern="[0-9]{3,7}"
                             >
              </f7-list-input>

              <f7-list-input v-if="popupAction == 'Update'"
                             label="Change status"
                             :value="accomodation.status"
                             @input="accomodation.status = $event.target.value"
                             type="select"
                             :defaultValue="accomodation.status"
                             info="To cancel change this field"
                             >
                             <option v-for="st in accomodations.status" :value="st">{{st}}</option>
              </f7-list-input>

              <f7-list-item>
                 <f7-button v-if="popupAction=='New'"
                            slot="after" raised fill
                            popup-close
                            @click="submitAccomodation"
                            >Submit</f7-button>
                 <f7-button v-if="popupAction=='Update'"
                            slot="after" raised fill
                            popup-close
                            @click="updateAccomodation(accomodation.id)"
                            >Submit</f7-button>
              </f7-list-item>

           </f7-list>
        </f7-block>

     </f7-page>
  </f7-popup>

  </f7-page>
</template>

<script>
import moment from 'moment';
import { OpenStreetMapProvider, GoogleProvider } from 'leaflet-geosearch'; 

export default {
   data() {
      const self = this;
      return {
         accomodations: [],
         favouriteAccomodations: self.loadStore('me.favourite.accomodations'),
         popupOpened: false,
         showKeys: "description,rent,advance,extra,owner_contact".split(','),
         popupAction: 'New',
         photos: [],
         locationMap : {
            center: L.latLng(13.071081, 77.58025),
            bounds: null,
            zoom: 16,
         },
         accomodation: {
            type: '',
            status: 'AVAILABLE',
            available_from: '',
            available_for: '',
            open_vacancies: 1,
            address: '',
            description: '',
            owner_contact: '',
            rent: 0,
            extra: '',
            advance: 0,
            url: '',
         },
         // Comments.
         thisComment: '',
         comments: [],
         thisAccomodation: '',
         commentPopupOpened: false,
         mapProvider: new GoogleProvider({
            params: {
               key: self.loadStoreStr('GOOGLE-MAP-API-KEY'), 
               client: 'HippoAndroidApp',
            },
         }),
      };
   },
  mounted() {
    const self = this;
    const app = self.$f7;

    // Get all accomodations.
    self.postWithPromise( '/accomodation/list').then(
      function(x) {
        app.dialog.preloader();
        self.accomodations = JSON.parse(x.data).data;
        self.saveStore('accomodations', self.accomodations);
        app.dialog.close();
      });
    setTimeout(() => app.dialog.close(), 1000);

    // Autocomplete.
    app.autocomplete.create({
      inputEl : '#autocomplete-dropdown-expand',
      openIn: 'dropdown',
      valueProperty: 'address',
      limit: 5,

      source: function(q, render) {
        var autocomplete = this;
        if(q.length === 0)
        {
          render(results);
          return;
        }
        autocomplete.preloaderShow();
        var res = [];
        self.accomodation.address = q;
        self.mapProvider.search({query: q}).then( (results) => {
          console.log(results);
          //render(results);
          res = results.map(x => x.label);
          autocomplete.preloaderHide();
          render(res);
        });
      },
      on: {
        change: function(val) {
          console.log('Changed to ', val);
          self.accomodation.address = val[0];
        },
      },
    });
  },
   methods: { 
      fetchAccomodations: function() {
         const self = this;
         const app = self.$f7;
         app.dialog.preloader();
         self.postWithPromise( '/accomodation/list/50' ).then( 
            function(x) 
            {
               let res = JSON.parse(x.data);
               if(res.status == "ok")
               {
                  self.accomodations = res.data;
                  self.saveStore('accomodations', self.accomodations);
               }
               else
                  self.accomodations = self.loadStore('accomodations');
               app.dialog.close();
            });
         setTimeout( () => app.dialog.close(), 1000);
         app.ptr.done();
      },
      locateAddress: function(event) {
         const self = this;
         let addr = event.target.value;
         event.preventDefault();
         //self.mapProvider.search({query: addr}).then( (results) => {
         //   console.log(results);
         //});
      },
      submitAccomodation: function() {
         const self = this;
         console.log( "submitting accomodation");
         // Save it before it goes away.
         self.$localStorage.set('me.accomodation', self.accomodation);
         self.accomodation.available_from = moment(self.accomodation.available_from).format('YYYY-MM-DD')
         let res = self.sendRequest('/accomodation/create', self.accomodation);
         if( res == 'ok')
            self.$localStorage.delete('me.accomodation');
      },
      updateAction: function(acc) {
         const self = this;
         self.accomodation = acc;
         self.popupAction = 'Update';
         self.popupOpened = true;
      },
      updateAccomodation: function(id) 
      {
         const self = this;
         self.popupAction = 'New';
         console.log( 'Updating id: ', id);
         self.accomodation.available_from = self.dbDate(self.accomodation.available_from);
         self.sendRequest('/accomodation/update/id', self.accomodation);
         return;
      },
      readMore: function(obj) {
         const self = this;
         console.log( obj );
      },
      getNumVotes: function(externalID) {
         return 0;
      },
      showPics: function(acc) {
         const self = this;
         self.$refs.standalone.photos = [ acc.url ];
         self.$refs.standalone.open();
      },
      // COMMENT SECTION.
      addComment: function(acc) {
         const self = this;
         const app = self.$f7;
         self.thisAccomodation = acc;

         self.postWithPromise('/accomodation/comment/list/'+acc.id).then(
            function(x) {
               let res = JSON.parse(x.data);
               if(res.status == 'ok')
                  self.comments = res.data.comments;
            });

         self.commentPopupOpened = true;
      },
      submitComment: function(id) {
         const self = this;
         let data =  {id:id, comment:self.thisComment};
         console.log('Sending data: ', data);
         self.sendRequest('/accomodation/comment/post', data);
         self.commentPopupOpened = false;
      },
      addToFavoriteAcc: function(id) {
         const self = this;
         self.favouriteAccomodations = self.loadStore('me.favourite.accomodations');
         if( ! self.favouriteAccomodations )
            self.favouriteAccomodations = [];

         if(! self.favouriteAccomodations.includes(id))
            self.favouriteAccomodations.push(id);
         self.saveStore('me.favourite.accomodations', self.favouriteAccomodations);
         console.log( 'Added ' + id + ' to favourite accomodations.');
      },
      removeFromFavoriteAcc: function(id) {
            const self = this;
            self.favouriteAccomodations = self.loadStore('me.favourite.accomodations');
            if(self.favouriteAccomodations.includes(id))
               self.removeFromArray(self.favouriteAccomodations, id);
            self.saveStore('me.favourite.accomodations', self.favouriteAccomodations);
      },
      refreshMap: function() {
         //const map = this.$refs.accmap.mapObject;
         //this.venues.map( x => x );
      },
      zoomUpdated (zoom) {
         const self = this;
      },
      centerUpdated (center) {
         this.locationMap.center = center;
      },
      boundsUpdated (bounds) {
         this.locationMap.bounds = bounds;
      },
   },
};
</script>
