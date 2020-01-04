<template>
   <f7-page page-content ptr @ptr:refresh="refreshJC">
      <f7-navbar title="Journal Clubs" back-link="Back"></f7-navbar>

      <f7-block-header>
        <f7-row>
          <f7-col col="25" v-for="(jc,key) in alljcs" :key="key">
            <f7-button icon="fa fa-toggle-on fa-fw" 
                       tooltip="Subscribed."
                       @click="unsubscribeMeFromJC(jc.id)"
                       small 
                       v-if="Object.keys(myjcs).includes(jc.id)">
              {{jc.id}}
            </f7-button>
            <f7-button icon="fa fa-toggle-off fa-fw" 
                       tooltip="Unsubscribed."
                       @click="subscribeMeToJC(jc.id)"
                       small 
                       v-else>
              {{jc.id}}
            </f7-button>
          </f7-col>
        </f7-row>
      </f7-block-header>

      <f7-block-header v-if="isAdminOfAnyJC()">
        <f7-row class="text-align-center">
          <f7-col>
            <f7-button small @click="managePresentation()">Assign
              Presentations</f7-button>
          </f7-col>
          <f7-col>
            <f7-button small @click="manageSubscription()">Manage
              Subscriptions</f7-button>
          </f7-col>
        </f7-row>
      </f7-block-header>

      <f7-block-header>Upcoming JCs</f7-block-header>
      <f7-list accordion-list no-hairlines>
        <f7-list-item v-for="(jc, key) in jcs" 
                      :key="key" 
                      accordion-item>

          <div slot="after" 
               v-if="Object.keys(myjcs).includes(jc.jc_id)"
               class="text-color-black"
               >
            <strong>{{jc.jc_id}}</strong>
          </div>
          <div slot="after" v-else class="text-color-gray">{{jc.jc_id}}</div>

          <div slot="footer">By {{jc.presenter}}, Acknowleged: {{jc.acknowledged}} </div>
          <div slot="header"> 
            {{humanReadableDateTime(jc.date,jc.time)}} at {{jc.venue}}
          </div>
          <div slot="title"> {{jc.title}} </div>
          <f7-accordion-content style="background-color:Ivory">
            <span inset style="font-size:small" v-html="jc.description"></span>

            <div style="background-color:white">
            <f7-row>
              <f7-col v-if="isPresenterMe(jc.presenter) && jc.acknowledged==='NO'">
                <f7-button small @click="acknowledgeJC(jc.id)">Acknowledge</f7-button>
              </f7-col>
              <f7-col v-if="amIJCAdmin(jc.jc_id)">
                <f7-button small color="red" @click="removeJC(jc.id)">Remove</f7-button>
              </f7-col>
              <f7-col v-if="isPresenterMe(jc.presenter) || amIJCAdmin(jc.jc_id)">
                <f7-button small @click="editJC(jc)">Edit</f7-button>
              </f7-col>
            </f7-row>
            </div>
          </f7-accordion-content>
        </f7-list-item>
        <f7-list-item>
        </f7-list-item>
      </f7-list>

      <!-- NORMAL POPUP -->
      <f7-popup :opened="popupOpened" @popup:closed="popupOpened = false">
        <f7-page>
          <f7-navbar :title="popupTitle">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>
          <f7-block>
             <f7-list media-list>
                <f7-list-input label="Title"
                               resizable
                               @input="thisJC.title = $event.target.value"
                               :value="thisJC.title"
                               >
                </f7-list-input>

                <f7-list-input label="Description"
                               resizable
                               :value="thisJC.description"
                               @input="thisJC.description = $event.target.value"
                               type="textarea"
                               >
                </f7-list-input>

                <f7-list-input label="Paper URL"
                               :value="thisJC.url"
                               @input="thisJC.url = $event.target.value"
                               >
                </f7-list-input>

                <f7-button small raised fill
                           @click="submitJCChanges()"
                   >Submit</f7-button>
             </f7-list>
          </f7-block>
        </f7-page>
      </f7-popup>

      <!-- ADMIN MANAGE PRESENTATIONS POPUP -->
      <f7-popup :opened="jcAdminPresentationPopup" @popup:closed="jcAdminPresentationPopup=false">
        <f7-page>
          <f7-navbar :title="popupTitle">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>

          <f7-block>
            <f7-list form no-hairlines>
              <!-- list of USER jc for which she is admin -->
              <f7-list-input label="Your JC"
                             type="select"
                             @input="fetchJCInfo($event.target.value)"
                             >
                             <option value="None">Please choose ... </option>
                             <option v-for="(jcid, key) in myJCWithAdminRights()"
                                     :selected="(jcid==thisJC.jc_id)?true:false"
                                     :value="jcid"
                                     >{{jcid}}
                             </option>
              </f7-list-input>

              <f7-list-input label="Presenter"
                             :value="thisJC.presenter"
                             @input="thisJC.presenter = $event.target.value"
                             :required="true"
                             >
              </f7-list-input>

                <!--
                  <f7-list-input label="Date"
                  type="date" 
                  placeholder="Select date" 
                  :value="thisJC.date"
                  @input="thisJC.date = $event.target.value"
                  :required="true"
                  >
                  </f7-list-input>
                -->

                <f7-list-item>
                  <date-picker lang="en" 
                               placeholder="Date"
                               value-type="format"
                               type="date"
                               format="YYYY-MM-DD" 
                               v-model="thisJC.date"
                               >
                  </date-picker>
                </f7-list-item>

                <f7-list-input label="Time"
                               type="time"
                               :value="thisJC.time"
                               @input="thisJC.time = $event.target.value"
                               >
                </f7-list-input>

                  <!--
                    <f7-list-item>
                    <date-picker v-model="thisJC.time" 
                    v-bind:value="thisJC.time"
                    lang="en"
                    placeholder="Time"
                    :minute-step="15"
                    format="HH:mm A"
                    type="time">
                    </date-picker>
                    </f7-list-item>
                  -->

                  <f7-list-input label="Venue" 
                                 type="select"
                                 @input="thisJC.venue = $event.target.value"
                                 >
                                 <option :value="thisJC.venue" selected> 
                                 {{thisJC.info.venue}}
                                 </option>
                    <option v-for="(venue, id) in venues" 
                            :key="id" :value="venue.id"
                            >
                            {{venue.id}}
                    </option>
                  </f7-list-input>

                  <f7-button small raised @click="assignPresenter()">
                    Assign
                  </f7-button>
            </f7-list>
          </f7-block>

        </f7-page>
      </f7-popup>


      <!-- ADMIN MANAGE SUBSCRIPTION POPUP -->
      <f7-popup :opened="jcAdminSubscriptionPopup" @popup:closed="jcAdminSubscriptionPopup=false">
        <f7-page>

          <f7-navbar :title="popupTitle">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>

          <f7-row>
            <f7-col v-for="(jc, id) in myjcs" :key="id">
              <f7-button small 
                         :fill="(jc.jc_id === thisJC.jc_id)?true:false" 
                         raised 
                         @click="fetchSubscriptions(jc.jc_id)"
                         >
                         {{jc.jc_id}}
              </f7-button>
            </f7-col>
          </f7-row>

          <!-- SUBSCRIPTION -->
          <f7-block-title v-if="thisJC.jc_id">
            Total subscription found for {{thisJC.jc_id}} {{thisJCSubscrptions.length}}.
          </f7-block-title>
          <f7-block strong tabs v-if="thisJC.jc_id" no-hairlines>
            <f7-list no-hairlines>
              <f7-list-item style="background-color:lightyellow">
                  <f7-col>
                    <f7-list-input type="text"
                                   placeholder="Login"
                                   :value="thisLogin"
                                   @input="thisLogin = $event.target.value"
                                   >
                    </f7-list-input>
                  </f7-col>
                  <f7-col>
                    <f7-button small fill @click="subscribeToJC(thisLogin, thisJC.jc_id)">
                      Subscribe to {{thisJC.jc_id}}
                    </f7-button>
                  </f7-col>
              </f7-list-item>
              <f7-list-item swipeout 
                            v-for="(sub, key) in thisJCSubscrptions" :key="key"
                            @swipeout:delete="unsubscribeFromJC(sub.login, thisJC.jc_id)"
                            >
                <div slot="title"> {{sub.login}} </div>
                <f7-swipeout-actions right>
                  <f7-swipeout-button delete
                          :confirm-text="`${sub.login} from ${thisJC.jc_id}?`"
                          confirm-title="Unsubscribe?"
                          >
                          Unsubscribe
                  </f7-swipeout-button>
                </f7-swipeout-actions>
                <f7-swipeout-actions left>
                  <f7-swipeout-button
                    @click="assignPresentationDateSwiper(sub.login, thisJC.jc_id)"
                    >
                    Assign presentation date
                  </f7-swipeout-button>
                </f7-swipeout-actions>
              </f7-list-item>
            </f7-list>
          </f7-block>
          <f7-block v-else>
            Please select a JC.
          </f7-block>
        </f7-page>
      </f7-popup>
   </f7-page>
</template>

<script>
export default {
  data()
  {
    const self = this;
    return {
      jcs: {},
      venues: {},
      myjcs: {},
      alljcs: {},
      popupOpened: false,
      jcAdminPresentationPopup: false,
      jcAdminSubscriptionPopup: false,
      popupTitle: 'Invalid title',
      subscriptions: {},
      thisJCSubscrptions: [],
      thisLogin: '',
      thisJC: { title: ''
        , jc_id: ''
        , presenter: ''
        , description: '' 
        , url: ''
        , paperurl: ''
        , date: ''
        , time: ''
        , venue: ''
        , info: {venue: '', time:''}  // Store default parameters and other info.
      },
    };
  },
  mounted()
  {
    const self = this;
    if(! self.venues)
      self.fetchVenues();
    else
      self.venues = self.loadStore('venues');
    self.fetchJC();
  },
  methods: {
    fetchJC: function() 
    {
      const self = this;
      const app = self.$f7;

      // Name of JCs for which I am a member.
      app.dialog.preloader('Fetching JCs...');
      self.postWithPromise('/me/jc/list').then( function(x) {
        self.myjcs = JSON.parse(x.data).data;
        console.log('MyJCS', self.myjcs);
      });

      self.postWithPromise('/jc/info/all').then( function(x) {
        self.alljcs = JSON.parse(x.data).data;
      });

      self.postWithPromise('/me/jc').then( function(x) {
        let res = JSON.parse(x.data);
        self.jcs = res.data;
        app.dialog.close();
      });
      setTimeout(() => app.dialog.close(), 3000);
    },
    myJCWithAdminRights: function() {
      const self = this;
      if(! self.myjcs)
        return [];
      var adminJCS = Object.keys(self.myjcs).filter( 
        x => self.myjcs[x]['subscription_type'] === 'ADMIN'
      );
      return adminJCS;
    },
    fetchSubscriptions: function(jcid) 
    {
      const self = this;
      const app = self.$f7;
      self.thisJC.jc_id = jcid;
      self.postWithPromise('/jc/subscriptions/'+jcid)
        .then( function(x) {
          let res = JSON.parse(x.data);
          self.thisJCSubscrptions = res.data;
          self.subscriptions[jcid] = res.data;
        });
    },
    fetchJCInfo: function(jcid)
    {
      const self = this;
      self.thisJC.jc_id = jcid;

      self.postWithPromise('/jc/info/'+jcid)
        .then(function(x) {
          let res = JSON.parse(x.data);
          self.thisJC.info = res.data;
          // Add time.
          self.thisJC.time = self.thisJC.info.time;
          self.thisJC.venue = self.thisJC.info.venue;

          if(! self.subscriptions.hasOwnProperty(jcid))
            self.fetchSubscriptions(jcid);
        });
    },
    refreshJC: function(e, done) {
      const self = this;
      setTimeout(() => self.fetchJC(), 1000);
      done();
    },
    isMyJC: function(jc) {
      const self = this;
      if(self.myjcs)
        return Object.keys(self.myjcs).includes(jc);
      return false;
    },
    isPresenterMe: function(presenter) {
      const self = this;
      return presenter === self.whoAmI();
    },
    isAdminOfAnyJC: function() {
      const self = this;
      let isAdmin = false;
      if(! self.myjcs)
        return isAdmin;
      Object.keys(self.myjcs).forEach( function(key) {
        console.log('Subs type ', self.myjcs[key]['subscription_type']);
        if(self.myjcs[key]['subscription_type'] === 'ADMIN')
          isAdmin = true;
      });
      return isAdmin;
    },
    amIJCAdmin: function(jcid) {
      const self = this;
      if(! self.myjcs)
        return false;
      if( ! Object.keys(self.myjcs).includes(jcid))
        return false;
      return self.myjcs[jcid]['subscription_type'] === 'ADMIN';
    },
    editJC: function(jc) {
      const self = this;
      self.thisJC = jc;
      console.log('This JC: ', self.thisJC);
      self.popupTitle = 'Editing JC entry';
      self.popupOpened = true;
    },
    submitJCChanges: function() {
      const self = this;
      self.popupOpened = false;
      self.promiseWithAuth('/jc/update', self.thisJC).then(
        function(x) {
          self.fetchJC();
        }
      );
    },
    acknowledgeJC: function(jcid) {
      const self = this;
      const app = self.$f7;
      self.postWithPromise('/jc/acknowledge/' + jcid)
        .then( function(x) {
          self.fetchJC();
        });
    },
    removeJC: function(jcid) {
      const self = this;
      const app = self.$f7;
      app.notification.confirm( "Are you sure?", "Removing JC",
        function( ) {
          self.promiseWithAuth('/jcadmin/remove/' + jcid)
            .then( function(x) {
              self.fetchJC();
            })}
        , null);
    }, 
    managePresentation: function() {
      const self = this;
      self.popupTitle = "Assign presenter";
      self.jcAdminPresentationPopup = true;
    },
    manageSubscription: function() {
      const self = this;
      self.popupTitle = "Manage subscriptions";
      self.jcAdminSubscriptionPopup = true;
    },
    assignPresenter: function() {
      const self = this;
      // console.log('Submitting', self.thisJC);
      self.promiseWithAuth('/jcadmin/assign', self.thisJC)
        .then( function(x) {
          self.fetchJC();
        });
      self.jcAdminPresentationPopup = false;
    },
    unsubscribeFromJC: function(login, jcid) {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('/jcadmin/unsubscribe/'+jcid+'/'+login)
        .then( function(x) {
          if(login === self.$store.login)
            self.fetchJC();
          else
            self.fetchSubscriptions(jcid);
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 1000);
    },
    unsubscribeMeFromJC: function(jcid) {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader("Unsubscribing you from " + jcid);
      self.promiseWithAuth('/me/jc/unsubscribe/'+jcid)
        .then( function(x) {
          self.fetchJC();
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 1000);
    },
    subscribeToJC: function(login, jcid) {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader();
      self.promiseWithAuth('/jcadmin/subscribe/'+jcid+'/'+login)
        .then( function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            app.dialog.alert(res.msg, "Success", null);
            self.fetchSubscriptions(jcid);
          }
          else
            app.alert(res.msg, "Failed", null);
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 1000);
    },
    subscribeMeToJC: function(jcid) {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader("Subscribing you to " + jcid);
      self.promiseWithAuth('/me/jc/subscribe/'+jcid)
        .then( function(x) {
          self.fetchJC();
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 1000);
    },
    assignPresentationDateSwiper: function(login, jcid) 
    {
      const self = this;
      console.log("Assigning " + login + " to " + jcid );
      self.jcAdminSubscriptionPopup = false;
      self.popupTitle = "Assigning " + login + " a presentation date";
      self.fetchJCInfo(jcid);
      setTimeout( () => {
        self.thisJC.presenter = login;
        self.thisJC.jc_id = jcid;
        self.jcAdminPresentationPopup = true;
      }, 500);
    },
  },
}
</script>
