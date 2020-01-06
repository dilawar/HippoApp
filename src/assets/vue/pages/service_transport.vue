<template>
  <f7-page page-content>
    <f7-navbar title="Transport" back-link="Back"></f7-navbar>

  <!-- Select days buttons. -->
  <f7-row style="margin:2px;padding:1px;" noGap>
    <f7-col v-for="d in alldays" :key="'col'+d">
      <f7-button small 
                 :key="d" 
                 color="gray"
                 :fill="selectedDays.includes(d)"
                 @click="changeDay(d)">
        {{d}}
      </f7-button>
    </f7-col>
  </f7-row>
  <f7-row>
    <f7-col width="50" medium="33" v-for="(route, key) in routes" :key="key">
      <f7-button small 
                 color="gray"
                 @click="selectRoute(route)"
                 :fill="isSameRoute(thisRoute,route)">
        {{route.pickup_point}}→{{route.drop_point}}
      </f7-button>
    </f7-col>
  </f7-row>

  <!-- <strong>Route: </strong>{{thisRoute.pickup_point}} to {{thisRoute.drop_point}} -->
  <div style="margin-left:auto; margin-right:auto">
    <table v-for="(tt, veh, id) in timetable">
      <thead>
        <tr>
          <th></th>
          <th v-for="(d, key) in selectedDays">{{d}}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(trips, startTime, index) in tt" :key="'row'+startTime">
          <td><font>{{startTime | clockTime}}</font></td>
          <td v-for="(day, k2) in selectedDays" :key="'td'+k2" 
              style="border:1px dotted gray">
            <span v-for="(trip,k3) in tt[startTime][day]">
              <f7-icon :icon="transportIcon(trip.vehicle)"></f7-icon>
            </span>
          </td>
          <td>
            <f7-link icon="fa fa-gear" @click="updateTripsPopup(trips, startTime)"></f7-link>
          </td>
        </tr>
        <tr></tr>
      </tbody>
    </table>
    <f7-block-footer>
      Click on <f7-icon icon="fa fa-gear"></f7-icon> to do more.
    </f7-block-footer>
  </div>

  <!-- POPUP TRIPS  -->
  <f7-popup :opened="popupTrips" @popup:close="popupTrips = false">
    <f7-page>
      <f7-navbar title="Update Trips">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

      <f7-block-title medium>
        {{thisRoute.pickup_point}} to {{thisRoute.drop_point}}.
      </f7-block-title>

      <f7-row>
        <f7-col v-for="(day, key) in alldays">
          {{day}}
          <f7-checkbox :checked="theseTrips">
          </f7-checkbox>
        </f7-col>
      </f7-row>



    </f7-page>
  </f7-popup>

  <!-- POPUP Single entry.  -->
  <f7-popup :opened="popupEdit" @popup:close="popupEdit = false">
    <f7-page>
      <f7-navbar :title="thisRoute.is_new?'Edit Entry':'Add new entry'">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

      <f7-block>
        <f7-block-title medium>
          {{thisEntry.pickup_point}} to {{thisEntry.drop_point}}
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

          <f7-list-input label="Running On" inline-label :input=false>
            <f7-row slot="input">
              <f7-col v-for="(day, key) in alldays">
                <f7-checkbox :checked="thisEntry.days.includes(day.toLowerCase())"
                      @change="addRemoveEntry(thisEntry.trip_start_time, day)"> 
                </f7-checkbox>
                <font style="font-size:x-small">
                  {{day}}
                </font>
              </f7-col>
            </f7-row>
          </f7-list-input>

          <f7-list-input label="URL"
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
      alldays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      selectedDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      thisRoute: self.loadStore('thisRoute'),
      nowTime: moment(),
      thisDay: 'all',
      timetable: {},
      routes: self.thisRoute,
      vehicles: ['Buggy', "Shuttle"],
      popupEdit: false,
      // This goes onto a poup showing route map.
      thisRouteMap: '<p>No route found.</p>',
      thisEntry: {'pickup_point':'NCBS', 'drop_point':'IIsc', 'is_new':false, days:[]},
      thisEntryStatus: "OK",
      theseTrips: {'days':'', 'trip_start_time':'', 'timetable':{}},
      popupTrips: false,
    };
  },
  mounted: function() {
    const self = this;
    if(! self.thisRoute || ! self.thisRoute.hasOwnProperty('pickup_point'))
      self.thisRoute = { 'pickup_point': 'NCBS', 'drop_point': 'IISc'};
    self.fetchRoutes();
    self.fetchVehicles();
    self.fetchTransport();
  },
  watch: {
    'thisEntry': {
      handler: function(val, oldval)
      {
        const self = this;
        return 'OK';
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
    transportIcon: function(vehicle, extra=' fa-fw') {
      const self = this;
      var icon = 'fa ';
      vehicle = vehicle.toLowerCase();
      if(vehicle == 'shuttle')
        icon += ' fa-bus'
      else if(vehicle == 'buggy')
        icon += ' fa-bug';
      else
        icon += ' fa-bus';
      icon += extra;
      return icon;
    },
    changeDay: function(day) {
      const self = this;
      if(self.selectedDays.includes(day))
        self.selectedDays = self.selectedDays.filter(e => e !== day);
      else
        self.selectedDays.push(day);

      self.selectedDays = self.selectedDays.sort(self.sortDays);
      self.fetchTransport();
    },
    addRemoveEntry: function(tripStartTime, day) {
      day = day.toLowerCase();
      const self = this;
      if(self.thisEntry.days.includes(day))
      {
        self.thisEntry.days = self.thisEntry.days.filter(e => e !== day);
        // Remove this entry.
        self.thisEntry = self.timetable[tripStartTime][day];
        self.deleteEntry(false);
      }
      else {
        // Add new entry.
        self.thisEntry.days.push(day);
        self.thisEntry.day = day;
        self.addNewEntry(false);
      }
      self.thisEntry.days = self.thisEntry.days.sort(self.sortDays);
    },
    fetchTransport: function() 
    {
      const self         = this;
      const app          = self.$f7;
      var endpoint = self.selectedDays.join(',');
      if(self.thisRoute.pickup_point)
        endpoint += '/' + self.thisRoute.pickup_point;
      if(self.thisRoute.drop_point)
        endpoint +=  '/' + self.thisRoute.drop_point;

      self.postWithPromise('/transportation/timetable/'+endpoint)
        .then( function(x) {
          var res = JSON.parse(x.data);
          self.timetable = res.data;
        });
    },
    editEntry: function(t) {
      const self = this;
      self.thisEntry = JSON.parse(JSON.stringify(t));
      self.thisEntry['is_new'] = false;
      // Select all days at which this trip.
      self.thisEntry['days'] = Object.keys(self.timetable[t.trip_start_time]);
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
    addNewEntry: function(popupClose=true) {
      const self = this;
      const app = self.$f7;
      app.dialog.preloader('Adding new trip...');
      self.promiseWithAuth('transportation/schedule/add', self.thisEntry)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Successfully added new entry.");
            if(popupClose)
              self.popupEdit = false;
          }
          else
            self.notify("Failed", res.msg, 5000);
          app.dialog.close();
        });
      setTimeout(() => app.dialog.close(), 1000);
    },
    updateEntry: function(entry) {
      const self = this;
      const app = self.$f7;
      console.log("Updating entry.", self.thisEntry);
      var msg = "";
      for(var day of self.thisEntry.days) {
        console.log("Day is ", day);
        self.thisEntry.day = day;
        self.promiseWithAuth('transportation/schedule/update', self.thisEntry)
          .then(function(x) {
            let res = JSON.parse(x.data).data;
            if(res.success)
              msg += day + ", ";
            else
              msg += res.msg;
          });
      }
      self.notify("Update", msg, 5000);
      self.fetchTransport();
    },
    deleteEntry: function(popupClose = true) {
      const self = this;
      const app = self.$f7;
      console.log("Deleting this entry.", self.thisEntry);
      app.dialog.confirm("Are you sure?",  "Deleting entry"
        , function(x) {
          self.postWithPromise('transportation/schedule/delete/'+self.thisEntry.id)
            .then(function(x) {
              if(popupClose)
                self.popupEdit = false;
              self.fetchTransport();
            });
        }, null);
    },
    inTimetable: function(tripStartTime, day) {
      const self = this;
      day = day.toLowerCase();
      if( ! self.timetable.hasOwnProperty(tripStartTime))
        return false;
      if(! self.timetable[tripStartTime].hasOwnProperty(day))
        return false;
      return true;
    },
    updateTripsPopup: function(timetable, startTime) {
      const self = this;
      self.theseTrips.days = self.thisDay;
      self.theseTrips.trip_start_time = startTime;
      self.theseTrips.timetable = timetable;
      self.popupTrips = true;
    },
  },
};

</script>
