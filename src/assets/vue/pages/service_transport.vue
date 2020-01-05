<template>
  <f7-page page-content>
    <f7-navbar title="Transport" back-link="Back"></f7-navbar>

  <!-- Select days buttons. -->
  <f7-block>
  <f7-row class="margin-top">
    <f7-col v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="'col'+d">
      <f7-button small :key="d" :fill="(d==thisDay)?true:false" @click="changeDay(d)">
        {{d}}
      </f7-button>
    </f7-col>
  </f7-row>
  <f7-row></f7-row>
  <f7-row>
    <f7-col width="50" medium="33" 
            v-for="(route, key) in routes" :key="key">
      <f7-button small @click="selectRoute(route)"
                 :fill="isSameRoute(thisRoute,route)">
        {{route.pickup_point}}→{{route.drop_point}}
      </f7-button>
    </f7-col>
  </f7-row>
  </f7-block>

  <f7-block inset>
    <f7-block-header class="align-items-center">
    </f7-block-header>

    <f7-list>
      <f7-list-button @click="addNewEntryPopup()">
        Add New Trip
      </f7-list-button>
      <f7-list-item v-for="(t, key) in theseEntries" @click="editEntry(t)" :key="key">
        <f7-icon slot="media" :icon="transportIcon(t.vehicle)">
        </f7-icon>
        <div slot="title">
          {{str2Moment(t.trip_start_time, 'HH:mm:ss').format('hh:mm A')}}
        </div>
        <div slot="footer">{{t.comment}}</div>
      </f7-list-item>
      <f7-list-item></f7-list-item>
    </f7-list>
  </f7-block>

  <!-- POPUP  -->
  <f7-popup :opened="popupEdit" @popup:close="popupEdit = false">
    <f7-page>
      <f7-navbar :title="thisRoute.is_new?'Edit Entry':'Add new entry'">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

      <f7-block>
        <f7-block-title medium>
          {{thisEntry.day}} | {{thisEntry.pickup_point}} to {{thisEntry.drop_point}}.
        </f7-block-title>

        <f7-list no-hairlines>

          <f7-list-input label="Start time" 
                         inline-label
                         type="time"
                         id="start_time"
                         :value="thisEntry.trip_start_time"
                         @change="thisEntry.trip_start_time=$event.target.value">
          </f7-list-input>

          <f7-list-input label="End time"
                         inline-label
                         type="time"
                         :value="thisEntry.trip_end_time"
                         @change="thisEntry.trip_end_time=$event.target.value">
          </f7-list-input>

          <f7-list-input label="Vehicle"
                         inline-label
                         type="select"
                         :value="thisEntry.vehicle"
                         @change="thisEntry.vehicle=$event.target.value">
            <option>Select a vehicle</option>
            <option v-for="(veh, key) in vehicles" :value="veh">{{veh}}</option>
          </f7-list-input>

          <f7-list-input label="URL/RouteMap"
                         inline-label
                         type="url"
                         :value="thisEntry.url"
                         @change="thisEntry.url=$event.target.value">
          </f7-list-input>

          <f7-list-input label="Comment"
                         inline-label
                         type="text"
                         :value="thisEntry.comment"
                         @change="thisEntry.comment=$event.target.value">
          </f7-list-input>

        </f7-list>

        <f7-row>
          <f7-col>
            <f7-button color=red 
                       fill
                       raised 
                       outline 
                       @click="deleteEntry()">
              Delete
            </f7-button>
          </f7-col>
          <f7-col>
            <f7-button raised outline v-if="! thisEntry.is_new" @click="updateEntry()">
              Update
            </f7-button>
            <f7-button raised outline
                       :dsabled="! thisEntryStatus==='OK'" 
                       v-else @click="addNewEntry()">
              <span v-if="thisEntryStatus=='OK'">Add</span>
              <span v-else>{{thisEntryStatus}}</span>
            </f7-button>
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-page>
  </f7-popup>

</f7-page>

</template>

<script>
import moment from 'moment'

export default {
  data() {
    const self = this;
    return {
      thisRoute: self.loadStore('thisRoute'),
      nowTime: moment(),
      thisDay: moment().format('ddd'),
      timetable: {},
      routes: self.thisRoute,
      vehicles: ['Buggy', "Shuttle"],
      popupEdit: false,
      // This goes onto a poup showing route map.
      thisRouteMap: '<p>No route found.</p>',
      thisEntry: {'pickup_point':'NCBS', 'drop_point':'IIsc', 'is_new':false},
      thisEntryStatus: "OK",
      theseEntries: {},
    };
  },
  mounted: function() {
    const self = this;
    self.fetchTransport();
    if(! self.thisRoute || ! self.thisRoute.hasOwnProperty('pickup_point'))
      self.thisRoute = { 'pickup_point': 'NCBS', 'drop_point': 'IISc'};

    self.fetchRoutes();
    self.fetchVehicles();
  },
  watch: {
    'thisEntry': {
      handler: function(val, oldval)
      {
        const self = this;
        return 'OK';

        // Fixme: following does not work.
        // if(! val.trip_start_time) {
        //   self.thisEntryStatus = 'No start time';
        //   return;
        // }
        // if(! val.trip_end_time) {
        //   self.thisEntryStatus = 'No end time';
        //   return;
        // }
        // if(! val.vehicle) {
        //   self.thisEntryStatus = 'No vehicle selected';
        //   return;
        // }
        // self.thisEntryStatus = 'OK';
        // return;
      },
      deep: true
    },
  },
  methods: { 
    fetchRoutes: function() {
      const self = this;
      self.postWithPromise('transportation/route/list').then( function(x) {
        self.routes = JSON.parse(x.data).data;
      });
    },
    fetchVehicles: function() {
      const self = this;
      self.postWithPromise('transportation/vehicle/list').then( function(x) {
        self.vehicles = JSON.parse(x.data).data;
      });
    },
    isUpcomingTrip: function(t) {
      const self = this;
      console.log('x', t.day, self.thisDay );
      if(t.day.toLowerCase() === self.thisDay.toLowerCase())
        if(self.str2Moment(t.trip_start_time, 'HH:mm:ss') >= self.str2Moment())
          return true;
      if(self.str2Moment(t.day,"ddd") > self.str2Moment(self.thisDay,"ddd"))
        return true;
      return false;
    },
    transportIcon: function(vehicle) {
      const self = this;
      var icon = 'fa ';
      vehicle = vehicle.toLowerCase();
      if(vehicle == 'shuttle')
        icon += ' fa-bus'
      else if(vehicle == 'buggy')
        icon += ' fa-bug';
      else
        icon += ' fa-bus';
      icon += ' fa-2x';
      return icon;
    },
    changeDay: function(data) {
      const self = this;
      self.thisDay = data;
      self.fetchTransport();
    },
    fetchTransport: function() 
    {
      const self         = this;
      const app          = self.$f7;
      var endpoint = self.thisDay;
      if(self.thisRoute.pickup_point)
        endpoint += '/' + self.thisRoute.pickup_point;
      if(self.thisRoute.drop_point)
        endpoint +=  '/' + self.thisRoute.drop_point;

      self.postWithPromise('/transportation/timetable/'+endpoint)
        .then( function(x) {
          var res = JSON.parse(x.data);
          self.timetable = res.data;
          self.getTimetable();
        });
    },
    getTimetable: function() {
      const self = this;
      if( ! self.timetable)
        return {};

      var t = self.timetable[self.thisDay.toLowerCase()];
      var pickup = self.thisRoute.pickup_point.toLowerCase();
      var drop = self.thisRoute.drop_point.toLowerCase();
      t = t[pickup];
      t = t[drop];
      self.theseEntries = Object.values(t);
    },
    editEntry: function(t) {
      const self = this;
      self.thisEntry = JSON.parse(JSON.stringify(t));
      self.thisEntry['is_new'] = false;
      self.popupEdit = true;
    },
    routeMap: function(url) {
      const self = this;
      self.thisRouteMap = url;
      self.openPopup = true;
    },
    showRoute: function() {
      console.log( "Show me this route" );
    },
    selectRoute: function(route) {
      const self = this;
      self.thisRoute = route;
      console.log('selected route: ', route);
      self.fetchTransport();
    },
    isSameRoute: function(a, b) {
      if(a.pickup_point == b.pickup_point && a.drop_point == b.drop_point)
        return true;
      return false;
    },
    addNewEntryPopup: function() {
      const self = this;
      self.thisEntry = {...{'day': self.thisDay, 'is_new':true
        , 'trip_start_time': '', 'trip_end_time':''
        , 'vehicle':''}, ...self.thisRoute};
      self.thisEntry.is_new = true;
      self.popupEdit = true;
    },
    addNewEntry: function() {
      const self = this;
      const app = self.$f7;
      console.log('new entry: ', self.thisEntry);
      self.promiseWithAuth('transportation/schedule/add', self.thisEntry)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Successfully added new entry.");
            self.popupEdit = false;
          }
          else
            self.notify("Failed", res.msg, 5000);
        });
    },
    updateEntry: function() {
      const self = this;
      const app = self.$f7;
      console.log("Updating entry.", self.thisEntry);
      self.promiseWithAuth('transportation/schedule/update', self.thisEntry)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success)
            self.notify("Success", "Successfully updated");
          else
            self.notify("Failed", res.msg, 5000);
          self.fetchTransport();
        });
    },
    deleteEntry: function() {
      const self = this;
      const app = self.$f7;
      console.log("Deleting this entry.", self.thisEntry);
      app.dialog.confirm("Are you sure?",  "Deleting entry"
        , function(x) {
          self.postWithPromise('transportation/schedule/delete/'+self.thisEntry.id)
            .then(function(x) {
              self.popupEdit = false;
              self.fetchTransport();
            });
        }, null);
    },
  },
};

</script>
