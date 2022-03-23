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
          <div slot="subtitle">
            {{request.class}}, {{request.venue}}
          </div>
        </f7-list-item>

      </f7-list>

    </f7-block>

    <!-- Review POPUP -->
    <f7-popup tablet-fullscreen :opened="reviewPopup" @popup:close="reviewPopup = false">
      <f7-page>
        <f7-navbar :title="popupTitle">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block strong>
          "{{thisRequest.title}}" created by {{thisRequest.created_by}}

          <f7-block-header v-html="thisRequest.description"></f7-block-header>

        </f7-block>

        <f7-block>
          <f7-block-header v-if="groupRequests.length > 1" text-color=blue>
            This looks like a recurrent booking. Total {{ groupRequests.length }} bookings
            found.
          </f7-block-header>

          <!-- list of clashes -->
          <f7-block-header v-if="groupRequestsClashes.length > 0">
            This booking request is not clean. It might clash with
            following JC/Labmeets in future. Please make sure that this is not the
            case.
            <span item v-for="(clash, key) in groupRequestsClashes" :key="key">
              {{clash.title}}
            </span>
          </f7-block-header>
          <f7-block-header text-color=blue v-else>
            I could not find any conflict with any other booking.
          </f7-block-header>

          <!-- Approve selected and reject selected. -->
          <f7-list media-list inset>
            <f7-list-item
                :checked="thisRequest.is_public_event==='YES'"
                checkbox
                title="Mark all 'PUBLIC EVENT'"
                text="By marking it as PUBLIC EVENT, you are putting it on NCBS Public Calendar."
                @change="changeRequestPublic">
            </f7-list-item>

            <f7-list-item>
              <f7-button slot="after" color=red @click="rejectSelected">
                <small> Reject Selected </small>
              </f7-button>
              <f7-button raised slot="title" fill color=blue @click="approveSelected">
                Approve Selected
              </f7-button>
            </f7-list-item>
          </f7-list>

          <!-- list of bookings. -->
          <f7-list simple-list>
            <f7-list-item v-for="(req, key) in groupRequests" :key="key">
              <span>{{req.date | date}}
                <strong>{{req.start_time | clockTime}}</strong> to
                <strong>{{req.end_time | clockTime }}</strong>
                | {{req.venue}}
                <f7-link external v-if="req.vc_url" :url="req.vc_url">{{req.vc_url}}</f7-link>
                <span v-if="req.vc_extra"> ({{req.vc_extra}})</span>
              </span>

              <f7-toggle checked @toggle:change="toggleSelected(req.rid)">
              </f7-toggle>
            </f7-list-item>

          </f7-list>
          <!-- list of booking ends here. -->

        </f7-block>

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
        groupRequests: [],
        groupRequestsClashes: {},
        selectedRids: [],
        thisRequest: { },
        thisRequestClashes : [],
        reviewPopup: false,
        popupTitle: 'Review request(s)',
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
      toggleSelected: function(rid) {
        const self = this;
        // console.log(110, rid);
        if(self.selectedRids.includes(rid))
          self.selectedRids = self.selectedRids.filter(x => x !== rid);
        else
          self.selectedRids.push(rid);
        // console.log(111, self.selectedRids);
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
      fetchRequestsWithGID: function(gid)
      {
        const self = this;
        const app = self.$f7;
        app.dialog.preloader('Fetching pending requests for gid ' + gid + ".");
        self.selectedRids = [];
        self.promiseWithAuth('bmvadmin/requests/pending/' + gid).then(
          function(x) {
            self.groupRequests = JSON.parse(x.data).data;
            Object.values(self.groupRequests).forEach(function(req) {
              // console.log(101, req.rid);
              self.selectedRids.push(req.rid);
              // self.checkRequest(req);
            });
            app.dialog.close();
          });
        setTimeout(() => app.dialog.close(), 10000);
      },
      openReviewPopup: function(request)
      {
        const self = this;
        self.thisRequest = request;
        // self.thisRequestClashes = [];
        // setTimeout(() => self.checkRequest(request), 1000);
        // Fetch all pending requests for a given GID.
        self.fetchRequestsWithGID(self.thisRequest.gid);
        self.reviewPopup = true;
      },
      checkRequest: function(request)
      {
        const self = this;
        self.promiseWithAuth('bmvadmin/request/clash', request)
          .then(function(x) {
            const clashes = JSON.parse(x.data).data.clashes;
            self.thisRequestClashes = clashes;
            self.groupRequestsClashes[request.gid] = clashes;
            // console.log('clashes', self.thisRequestClashes);
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
              app.dialog.alert("Can you add a bit more?"
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
      approveSelected: function() {
        const self = this;
        console.log("Approving ", self.selectedRids);
        let rids = self.selectedRids.join(',');
        let gid = self.groupRequests[0].gid;
        self.promiseWithAuth('bmvadmin/requests/approve/' + gid + '/' + rids).then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            console.log("Successfully approved.");
            self.notify("Success", "Message from server: " + JSON.stringify(res.details));
            self.fetchPendingRequests();
            self.reviewPopup = false;
          }
          else
            self.notify("Failure", "Failed to approve: <br>" + res.msg);
        });
        setTimeout( () => self.reviewPopup = false, 1000);
      },
      rejectSelected: function() {
        const self = this;
        const app = self.$f7;
        app.dialog.confirm("Do you want to reject selected requests", "Are you sure?",
          function() {
            console.log("Rejecting ", self.selectedRids);
            let rids = self.selectedRids.join(',');
            let gid = self.groupRequests[0].gid;
            self.promiseWithAuth('bmvadmin/requests/reject/' + gid + '/' + rids).then(function(x) {
              let res = JSON.parse(x.data).data;
              if(res.success) {
                console.log("Successfully rejected.");
                self.notify("Success", "Message from server: " + JSON.stringify(res.details));
                self.fetchPendingRequests();
                self.reviewPopup = false;
              }
              else
                self.notify("Failure", "Failed to reject: <br>" + res.msg);
            });
          }, null);
        setTimeout( () => self.reviewPopup = false, 1000);
      },
      onApprove: function() {
        const self = this;
        const app = self.$f7;

        self.promiseWithAuth('bmvadmin/request/approve', self.thisRequest)
          .then( function(x) {
            let res = JSON.parse(x.data).data;
            if(res.success) {
              console.log("Successfully approved.");
              self.notify("Success", "Successfully approved request : " + self.thisRequest.title);
              self.fetchPendingRequests();
            }
            else
              self.notify("Failure", "Failed to approve: <br>" + res.msg);
          });
        self.reviewPopup = false;
      },
      changeRequestPublic: function(value)
      {
        const self = this;
        if(value.target.checked) {
          self.thisRequest.is_public_event = "YES";
        }
        else
          self.thisRequest.is_public_event = "NO";

        self.promiseWithAuth('bmvadmin/request/update', self.thisRequest)
          .then( function(x) {
            self.notify("Success", "Successfully changed the 'is_public_event' value");
            self.fetchPendingRequests();
          });
      },
    },
  }
</script>
