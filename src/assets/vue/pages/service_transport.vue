<template>
  <f7-page page-content>
    <f7-navbar title="Timetable" back-link="Back"></f7-navbar>

  <!-- Select days buttons. -->
  <f7-row style="margin:2px;padding:1px;" noGap>
    <f7-col v-for="d in alldays" :key="'col'+d">
      <f7-button small :key="d" color="gray" 
                :fill="selectedDays.includes(d)" 
                @click="changeDay(d)">
        {{d}}
      </f7-button>
    </f7-col>
  </f7-row>
  <f7-row>
    <f7-col width="50" medium="33" v-for="(route, key) in routes" :key="key">
      <f7-button small color="gray" @click="selectRoute(route)"
                 :fill="isSameRoute(thisRoute,route)">
        {{route.pickup_point}}→{{route.drop_point}}
      </f7-button>
    </f7-col>
  </f7-row>

  <!-- Timetable -->
  <div style="margin:10px; margin-top:20px">
    <table v-for="(tt, veh, id) in timetable" style="margin:0px auto">
      <thead>
        <tr>
          <th></th>
          <th v-for="(d, key) in selectedDays">{{d}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(trips, startTime, index) in tt" :key="'row'+startTime">
          <td>
            <f7-link icon="fa fa-pencil-square-o fa-1x" 
                     @click="updateTripsPopup(trips, startTime, veh)">
              <small> {{startTime | clockTime}}</small>
            </f7-link>
          </td>
          <td v-for="(day, k2) in selectedDays" :key="'td'+k2" 
              style="background-color:lightyellow;border:1px dotted">
            <span v-for="(trip,k3) in tt[startTime][day]">
              <f7-icon :icon="transportIcon(trip.vehicle)"></f7-icon>
            </span>
          </td>
        </tr>
        <tr></tr>
      </tbody>
      <caption align="bottom">
        <f7-button small raised @click="addNewVehicleTripPopup(veh)">
          Add {{veh}} trip
        </f7-button>
      </caption>
    </table>
    <f7-block-footer>
      Click on <f7-icon icon="fa fa-pencil"></f7-icon> to do more.
    </f7-block-footer>
  </div>

  <!-- POPUP Modify trips  -->
  <f7-popup :opened="popupTrips" @popup:close="popupTrips = false">
    <f7-page>
      <f7-navbar title="Update Trips">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

      <f7-block-title>
        {{thisRoute.pickup_point}} to {{thisRoute.drop_point}}. 
        Vehicle: {{theseTrips.vehicle}}. 
        Start Time: {{theseTrips.trip_start_time | clockTime}}
      </f7-block-title>

      <f7-block inset>
        <f7-list media-list no-hairlines>
          <f7-list-item v-for="(day, key) in alldays" :key="key">
            <div slot="title">{{day}}</div>
            <f7-checkbox slot="after" 
                         :checked="theseTrips.days.includes(day)"
                         @change="addRemoveTrip(day)"> 
            </f7-checkbox>
          </f7-list-item>

          <f7-list-item>
            <f7-row>
              <f7-col>
                <f7-button raised color=red 
                           @click="popupTrips=false">
                  Close
                </f7-button>
              </f7-col>
              <f7-col>
                <f7-button raised @click="deleteTheseTrips()">
                  Delete All
                </f7-button>
              </f7-col>
            </f7-row>
          </f7-list-item>
        </f7-list>
      </f7-block>
    </f7-page>
  </f7-popup>

  <!-- POPUP Add trips  -->
  <f7-popup :opened="popupAddTrips" @popup:close="popupAddTrips = false">
    <f7-page>
      <f7-navbar :title="'Adding a new '+theseTrips.vehicle+' trip'">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>

      <f7-block-title>
        {{thisRoute.pickup_point}} to {{thisRoute.drop_point}}. 
        Vehicle: {{theseTrips.vehicle}}. 
      </f7-block-title>

      <f7-block inset>
        <f7-list media-list no-hairlines>
          <f7-list-input label="Trip Start Time" inline-label
                         :value="theseTrips.trip_start_time"
                         @input="theseTrips.trip_start_time=$event.target.value"
                         type="time">
          </f7-list-input>
          <f7-list-input label="Trip End Time" inline-label
                         :value="theseTrips.trip_end_time"
                         @input="theseTrips.trip_end_time=$event.target.value"
                         type="time">
          </f7-list-input>

          <!--
          <f7-list-input :input="false" label="Trip Start Time" inline-label>
            <date-picker slot="input" type="time" lang="en"
                         value-type="format" format="HH:mm" :minute-step="5"
                         placeholder="Select time"
                         :time-picker-options="{start:'6:00',step:'00:15', end:'5:00'}"
                         v-model="theseTrips.trip_start_time">
            </date-picker>
          </f7-list-input>

          <f7-list-input :input="false" label="Trip End Time" inline-label>
            <date-picker slot="input" type="time" lang="en"
                         value-type="format" format="HH:mm" :minute-step="5"
                         placeholder="hh:mm a"
                         v-model="theseTrips.trip_end_time">
            </date-picker>
          </f7-list-input>
          -->

          <f7-list-input label="Select days" :input="false" inline-label>
            <f7-row slot="input">
              <f7-col v-for="(day, key) in alldays" :key="key">
                <f7-checkbox :checked="theseTrips.days.includes(day)"
                             @change="addRemoveDays(day)"> 
                </f7-checkbox>
                <small>{{day}}</small>
              </f7-col>
              </f7-checkbox>
            </f7-row>
          </f7-list-input>
          <f7-list-input type="text" 
                         label="Comment" inline-label
                         :value="theseTrips.comment"
                         @change="theseTrips.comment=$event.target.value">
          </f7-list-input>

          <f7-list-item>
            <f7-row>
              <f7-col>
                <f7-button raised :disabled="! theseTrips.trip_start_time"
                           @click="addTheseNewTrips()">
                  Add These Trips
                </f7-button>
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
import moment from 'moment'

export default {
  data() {
    const self = this;
    return {
      alldays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      selectedDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      thisRoute: self.loadStore('thisRoute'),
      thisDay: 'all',
      timetable: {},
      routes: self.thisRoute,
      vehicles: ['Buggy', "Shuttle"],
      popupEdit: false,
      // This goes onto a poup showing route map.
      thisRouteMap: '<p>No route found.</p>',
      thisEntry: {day:'', pickup_point:'NCBS', drop_point:'IIsc'
        , 'is_new':false},
      thisEntryStatus: "OK",
      theseTrips: {vehicle: ''
        , days:[]
        , trip_start_time:'', trip_end_time:''
        , timetable:{}, comment:''
        , is_new:false},
      popupTrips: false,
      popupAddTrips: false,
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
          self.createTimetable(res.data);
        });
    },
    createTimetable: function(trips) {
      const self = this;
      self.timetable = {};
      trips.forEach( t => {
        let k1 = t.vehicle;
        if(! self.timetable.hasOwnProperty(k1))
          self.timetable[k1] = {};
        let k2 = t.trip_start_time;
        if(! self.timetable[k1].hasOwnProperty(k2))
          self.timetable[k1][k2] = {};
        let k3 = t.day;
        if(! self.timetable[k1][k2].hasOwnProperty(k3))
          self.timetable[k1][k2][k3] = [];
        self.timetable[k1][k2][k3].push(t);
      });
      return;
    },
    selectRoute: function(route) {
      const self = this;
      self.thisRoute = route;
      self.fetchTransport();
    },
    isSameRoute: function(a, b) {
      if(a.pickup_point == b.pickup_point && a.drop_point == b.drop_point)
        return true;
      return false;
    },
    addNewEntry: function(refresh=true, notify=true) {
      const self = this;
      const app = self.$f7;
      if(notify)
        app.dialog.preloader('Adding new trip...');
      self.promiseWithAuth('transportation/schedule/add', self.thisEntry)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            if(notify)
              self.notify("Success", "Successfully added new entry.");
            if(refresh) 
              self.fetchTransport();
          }
          else
            if(notify)
              self.notify("Failed", res.msg, 5000);

          if(notify)
            app.dialog.close();
        });
      if(notify)
        setTimeout(() => app.dialog.close(), 1000);
    },
    updateEntry: function(entry) {
      const self = this;
      const app = self.$f7;
      var msg = "";
      for(var day of self.thisEntry.days) {
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
    deleteEntry: function(entry, interactive=true) {
      const self = this;
      const app = self.$f7;
      if(interactive) {
        app.dialog.confirm("Are you sure?",  "Deleting entry"
          , function(x) {
            self.postWithPromise('transportation/schedule/delete/'+entry.id)
              .then(function(x) {
                self.fetchTransport();
              });
          }, null);
      }
      else {
        self.postWithPromise('transportation/schedule/delete/'+entry.id)
          .then(function(x) {
            self.fetchTransport();
          });
      }
    },
    deleteEntries: function(ids) {
      const self = this;
      const app = self.$f7;
      self.postWithPromise('transportation/schedule/delete/'+ids)
        .then(function(x) {
          self.fetchTransport();
        });
    },
    updateTripsPopup: function(trips, startTime, vehicle) {
      const self = this;
      self.theseTrips.vehicle = vehicle;
      self.theseTrips.trip_start_time = startTime;
      self.theseTrips.trip_end_time =  
        trips[Object.keys(trips)[0]][0].trip_end_time;
      self.theseTrips.timetable = trips;
      self.theseTrips.days = Object.keys(self.theseTrips.timetable);
      self.popupTrips = true;
    },
    addRemoveDays: function(day) {
      const self = this;
      if(self.theseTrips.days.includes(day)) {
        delete self.theseTrips.days[day];
      }
      else {
        self.theseTrips.days.push(day)
      }
    },
    addRemoveTrip: function(day) {
      const self = this;
      if(self.theseTrips.days.includes(day)) {
        for(var trip of self.theseTrips.timetable[day]) 
          self.deleteEntry(trip, false);
      } 
      else 
      {
        // Add new entry.
        self.thisEntry = {'day': day, 'is_new':true
          , 'trip_start_time': self.theseTrips.trip_start_time
          , 'trip_end_time': self.theseTrips.trip_end_time
          , 'vehicle': self.theseTrips.vehicle, ...self.thisRoute};
        self.addNewEntry();
      }
    },
    deleteTheseTrips: function() {
      const self = this;
      const app = self.$f7;

      var entries = [];
      for(var day in self.theseTrips.timetable) {
        for(var trip of self.theseTrips.timetable[day])
          entries.push(trip.id);
      }

      app.dialog.confirm("Are you sure?",  "Delete all entries."
        , function(x) { 
          self.deleteEntries(entries.join(','));
          self.popupTrips = false;
        }, null);

    },
    addNewVehicleTripPopup: function(vehicle) {
      const self = this;
      console.log("Adding new trip by ", vehicle);
      self.theseTrips.vehicle = vehicle;
      self.theseTrips.is_new = true;
      self.theseTrips.timetable = {};
      self.theseTrips.trip_start_time = '';
      self.theseTrips.trip_end_time = '';
      self.theseTrips.timetable = {};
      self.theseTrips.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      self.popupAddTrips = true;
    },
    addTheseNewTrips: function() {
      const self = this;
      console.log("Adding followiing trips: ", self.theseTrips);
      for(var day of self.theseTrips.days) {
        console.log("Adding on day : ", day);
        self.thisEntry = {day: day, is_new:true
          , trip_start_time: self.theseTrips.trip_start_time
          , trip_end_time: self.theseTrips.trip_end_time
          , comment: self.theseTrips.comment
          , vehicle: self.theseTrips.vehicle
          , ...self.thisRoute};
        self.addNewEntry(true, true);
      }
      self.popupAddTrips = false;
    },
  },
};

</script>
