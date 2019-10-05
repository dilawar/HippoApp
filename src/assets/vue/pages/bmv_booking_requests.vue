<template>
   <f7-page @page:init="refreshData" @page:refresh="refreshData">
      <f7-navbar title="Hippo" back-link="Back">
      </f7-navbar>

      <f7-block-title small>
        Total {{requests.length}} requests are pending...
      </f7-block-title>
      <f7-block v-if="getRoles().includes('BOOKMYVENUE_ADMIN')">
        <f7-list no-hairlines media-list accordion-list>

          <f7-list-item v-for="(request, id) in requests"
                        accordion-item
                        :bg-color="(request.is_public_event=='YES')?'yellow':''"
                        >
            <div slot="header"> {{request.venue}} | {{request.class}} </div>
            <div slot="header"> Created by {{request.created_by}} </div>
            <div slot="title"> {{request.title}} </div>
            <div slot="footer">
              {{request.date | date}} |
              {{request.start_time | clockTime}} to 
              {{request.end_time | clockTime }}
            </div>
            <f7-accordion-content>
               <div v-html="request.description"> </div>
               <f7-button small raised fill @click="openReviewPopup(request)">
                 Review Request
               </f7-button>
            </f7-accordion-content>
          </f7-list-item>
        </f7-list>

      </f7-block>

      <!-- Review POPUP -->
      <f7-popup :opened="reviewPopup" @popup:close="reviewPopup = false">
        <f7-page>
          <f7-navbar title="Popup Title">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>
          <f7-block>
            <!-- POPUP ACTION -->
            <f7-card>
              <f7-card-header>{{thisRequest.title}}</f7-card-header>
              <f7-card-content>
                <span v-html="thisRequest.description"></span>
                When: 
                <strong> {{thisRequest.date | date}}, 
                  {{thisRequest.start_time | clockTime}} to 
                  {{thisRequest.end_time | clockTime }}
                </strong>
                <br />
                Where: 
                <strong> 
                  {{thisRequest.venue}}
                </strong>
              </f7-card-content>
              <f7-card-footer>
                Created by {{thisRequest.created_by}}
              </f7-card-footer>
            </f7-card>

            <f7-card>
              <f7-card-content>
                <f7-row v-if="thisRequest.clashes.length == 0">
                  <f7-col >
                    Hurray! This request is clean.
                  </f7-col>
                </f7-row>
                <f7-row v-else>
                  <f7-col v-for="(clash, key) in thisRequest.clashes" :key="key">
                    {{clash.title}}
                  </f7-col>
                </f7-row>
              </f7-card-content>
            </f7-card>

            <f7-row>
              <f7-col>
                <f7-button fill color="red" @click="onReject">Reject</f7-button>
              </f7-col>
              <f7-col>
                <f7-button fill @click="onApprove">Approve</f7-button>
              </f7-col>
            </f7-row>

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
        self.promiseWithAuth('bmvadmin/requests/pending').then(
          function(json) {
            self.requests = JSON.parse(json).data;
          });
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
          .then( function(json) {
            self.thisRequest.clashes = JSON.parse(json).data;
            console.log(data);
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
            this.promiseWithAuth('bmvadmin/request/reject/', request)
              .then( function(json) {
                console.log("Rejected request ... ");
              });
            this.reviewPopup = false;
          }
          , function(value)
          {
            console.log( "User cancelled");

          }, "");

      },
      onApprove: function() {
        const self = this;
        self.log("Approving request ...");
        this.promiseWithAuth('bmvadmin/request/approve', request)
          .then( function(json) {
            console.log("Rejected request ... ");
          });
        self.thisRequest = false;
      },
    },
  }
</script>
