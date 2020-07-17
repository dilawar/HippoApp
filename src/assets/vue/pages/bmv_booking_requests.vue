<template>
  <f7-page @page:init="refreshData" @page:refresh="refreshData">
    <f7-navbar title="Hippo" back-link="Back">
      <f7-subnavbar :inner="false">
        <f7-searchbar search-container=".request-list"
          search-in=".item-subtitle,.item-header,.item-footer,.item-text">
        </f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <f7-block-title medium>
      Total {{requests.length}} requests are pending...
    </f7-block-title>

    <f7-block>
      <f7-list no-hairlines media-list class="request-list" accordion-list>
        <f7-list-item v-for="(request, id) in requests"
          :key="id" accordion-item
          :class="(request.is_public_event==='YES')?'bg-color-yellow':''"
          @click="openReviewPopup(request)">
          <div slot="header"> Created by {{request.created_by}} </div>
          <div slot="after">
            In {{toNow(request.date, request.start_time)}}
          </div>
          <div slot="title"> {{request.title}} </div>
          <div slot="footer">
            {{request.date | date}} |
            {{request.start_time | clockTime}} to 
            {{request.end_time | clockTime }}
          </div>
          <div slot="subtitle"> {{request.class}}, {{request.venue}} </div>
        </f7-list-item>

      </f7-list>

    </f7-block>

    <!-- Review POPUP -->
    <f7-popup :opened="reviewPopup" @popup:close="reviewPopup = false">
      <f7-page>
        <f7-navbar :title="popupTitle">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block>
          <!-- POPUP ACTION -->
          <f7-card>
            <f7-card-header>
              {{thisRequest.title}} 
              <span style="font-size:small; float:right">Created by {{thisRequest.created_by}} </span>
            </f7-card-header>
            <f7-card-content>
              <span v-html="thisRequest.description"></span>
            </f7-card-content>
            <f7-card-footer>
              {{thisRequest.date | date}}, 
              {{thisRequest.start_time | clockTime}} to 
              {{thisRequest.end_time | clockTime }}
              <br />
              {{thisRequest.venue}}
            </f7-card-footer>
          </f7-card>

          <f7-list media-list no-hairlines>
            <f7-list-item v-if="thisRequest.clashes && thisRequest.clashes.length > 0">
              <div slot="text">
                <strong>
                  This booking request is not clean. It might clash with
                  following JC/Labmeets in future. Please make sure that this is not the
                  face.
                  <f7-col v-for="(clash, key) in thisRequest.clashes" :key="key">
                    {{clash.title}}
                  </f7-col>
                </strong>
              </div>
            </f7-list-item>
            <f7-list-item v-else title="STATUS">
              <div slot="text">
                Hurray! This request looks clean.
              </div>
            </f7-list-item>
            <f7-list-item v-if="thisRequest.is_public_event==='NO'"
              checkbox
              title="Mark as PUBLIC EVENT"
              text="By marking it as PUBLIC EVENT, you are putting
              it on NCBS Public Calendar."
              @change="changeRequestPublic"
            >
            </f7-list-item>
            <f7-list-item>
              <f7-row>
                <f7-col>
                  <f7-button small fill color="red" @click="onReject">Reject</f7-button>
                </f7-col>
                <f7-col>
                  <f7-button small fill @click="onApprove">Approve</f7-button>
                </f7-col>
              </f7-row>
            </f7-list-item>
          </f7-list>

        </f7-block>
      </f7-page>
    </f7-popup>

  </f7-page>
</template>

<script>
  export default {
    data() {
      const self = this;
      return {
        requests: [],
        thisRequest: { clashes: [] },
        reviewPopup: false,
        popupTitle: 'Review request',
      };
    },
    mounted()
    {
      const self = this;
      self.fetchPendingRequests();
    },
    methods : {
      refreshData: function( ) {
        const self = this;
      },
      fetchPendingRequests: function() 
      {
        const self = this;
        const app = self.$f7;
        app.dialog.preloader('Fetching pending requests...');
        self.promiseWithAuth('bmvadmin/requests/pending').then(
          function(x) {
            self.requests = JSON.parse(x.data).data;
            app.dialog.close();
          });
        setTimeout(() => app.dialog.close(), 1000);
      },
      openReviewPopup: function(request) 
      {
        const self = this;
        self.thisRequest = request;
        self.thisRequest.clashes = [];
        setTimeout(() => self.checkRequest(request), 100);
        self.reviewPopup = true;
      },
      checkRequest: function(request) 
      {
        const self = this;
        self.promiseWithAuth('bmvadmin/request/clash', request)
          .then(function(x) {
            self.thisRequest.clashes = JSON.parse(x.data).data;
          });
      },
      onReject: function() {
        const self = this;
        const app = self.$f7;
        app.dialog.prompt("Reason for rejection ...", "Rejecting.."
          , function(value) 
          {
            console.log("Rejecting with reason:", value);
            if(value.length < 8)
            {
              app.dialog.alert("Please give a decent reason.."
                , "Min 8 chars required", null);
              return;
            }
            // Else reject.
            self.promiseWithAuth('bmvadmin/request/reject/', self.thisRequest)
              .then( function(x) {
                console.log("Rejected request ... ");
                // Update list.
                self.fetchPendingRequests();
              });
            self.reviewPopup = false;
          }
          , function(value)
          {
            console.log( "User cancelled");
          }, "");

      },
      onApprove: function() {
        const self = this;
        self.promiseWithAuth('bmvadmin/request/approve', self.thisRequest)
          .then( function(x) {
            console.log("Approving request ...");
            self.fetchPendingRequests();
          });
        self.reviewPopup = false;
      },
      changeRequestPublic: function(value) 
      {
        const self = this;
        if(value.target.checked)
          self.thisRequest.is_public_event = "YES";
        else
          self.thisRequest.is_public_event = "NO";
      },
    },
  }
</script>
