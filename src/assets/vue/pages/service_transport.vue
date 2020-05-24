<template>
  <f7-page page-content>
    <f7-navbar title="Timetable" back-link="Back"></f7-navbar>

  <!-- Timetable -->
  <f7-block>

    <!-- Select days buttons. -->
    <f7-row>
      <f7-col v-for="d in alldays" :key="'col'+d">
        <template v-if="selectedDays.includes(d)">
          <f7-button small 
            raised icon="fa fa-check"
            :key="d" @click="changeDay(d)" tooltip="Click to unselect">
            <small>{{d}}</small>
          </f7-button>
        </template>
        <template v-else>
          <f7-button small :key="d" @click="changeDay(d)" tooltip="Click to
            select">{{d}}</f7-button>
        </template>
      </f7-col>
    </f7-row>

    <f7-block-header>
      If your route is not listed below, add it first by visting the section
      <tt>Route</tt> below.
    </f7-block-header>

    <f7-row>
      <f7-col width=50 medium=25 v-for="(route, key) in routes" :key="key">
        <template v-if="isSameRoute(thisRoute,route)">
          <f7-button small @click="selectRoute(route)" 
            raised icon="fa fa-check"
            tooltip="Seleced route">
            {{route.pickup_point}}→{{route.drop_point}}
          </f7-button>
        </template>
        <template v-else>
          <f7-button small @click="selectRoute(route)" 
            tooltip="Click to select this route">
            {{route.pickup_point}}→{{route.drop_point}}
          </f7-button>
        </template>
      </f7-col>
    </f7-row>

    <f7-block-title medium>All Transport</f7-block-title>
    <f7-block-header>Current route: {{routeToHtml(thisRoute)}}</f7-block-header>
    <f7-row>
      <f7-col class="margin-top" 
        v-for="(tt, veh, id) in timetable" :key="'col'+id" width=100 medium=50>

        <f7-button fill icon="fa fa-plus" @click="addNewVehicleTripPopup(veh)">
          Add {{veh}} trip
        </f7-button>
        <table style="border:1px gray solid;width:90%; margin:auto">
          <thead>
            <tr>
              <th></th>
              <th v-for="(d, key) in selectedDays">{{d}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trips, startTime, index) in tt" :key="'row'+startTime">
              <td>
                <f7-link icon="fa fa-edit" 
                  @click="updateTripsPopup(trips, startTime, veh)">
                  <small>{{startTime | clockTime}}</small>
                </f7-link>
              </td>
              <td v-for="(day, k2) in selectedDays" :key="'td'+k2" 
                style="background-color:lightyellow; border:1px dotted;
                padding-left:3px">
                <span v-for="(trip,k3) in tt[startTime][day]">
                  <f7-icon :icon="transportIcon(trip.vehicle)"></f7-icon>
                </span>
              </td>
            </tr>
            <tr></tr>
          </tbody>
        </table>
      </f7-col>
    </f7-row>
    <f7-block-footer>
      Click on time to edit/remove the entry.
    </f7-block-footer>
  </f7-block>

  <!-- Routes -->
  <f7-block inset strong>
    <f7-block-title medium>Routes</f7-block-title>
    <f7-list>
      <f7-row style="list-style-type:none">
        <f7-list-input label="Pickup Point" class="col-40"
          @change="thisNewRoute.pickup_point=$event.target.value">
        </f7-list-input>
        <f7-list-input label="Drop Point" class="col-40"
          @change="thisNewRoute.drop_point=$event.target.value">
        </f7-list-input>
        <f7-button class="col-20" raised fill @click="addNewRoute(thisNewRoute)">
          Add Route
        </f7-button>
      </f7-row>
      <f7-list-item label="Available routes" group-title>
      </f7-list-item>
      <f7-list-item v-for="route, key in routes" :key="key"
        :title="route.pickup_point + ' to ' + route.drop_point">
        <f7-button fill color=red small 
          @click="deleteRoute(route)">Delete</f7-button>
      </f7-list-item>
    </f7-list>
  </f7-block>


  <!-- Vehicle management -->
  <f7-block inset strong>
    <f7-block-title medium>Vehicle</f7-block-title>
    <f7-list>
      <f7-row style="list-style-type:none">
        <f7-list-input class="col-70"
          placeholder="Vehicle name"
          @change="newVehicleName=$event.target.value">
        </f7-list-input>
        <f7-list-item class="col-30">
          <f7-button raised small @click="addNewVehicle(newVehicleName)">
            Add New Vehicle
          </f7-button>
        </f7-list-item>
      </f7-row>
      <f7-list-item title="Available Vehicles" group-title></f7-list-item>
      <f7-list-item v-for="veh in vehicles" :key="veh" :title="veh">
        <f7-button slot="after" color=red fill small 
          @click="deleteVehicle(veh)">Delete</f7-button>
      </f7-list-item>
    </f7-list>

  </f7-block>


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
                  Remove Selected
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

          <!--
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
          -->

          <f7-list-input :input="false" label="Trip Start Time" inline-label>
            <date-picker slot="input" type="time" lang="en"
                         value-type="format" format="HH:mm" :minute-step="5"
                         placeholder="Select time"
                         :time-picker-options="{start:'6:00',step:'00:15', end:'5:00'}"
                         v-model="theseTrips.trip_start_time">
            </date-picker>
          </f7-list-input>

          <f7-list-input label="Duration" inline-label
                         :value="theseTrips.duration"
                         @change="theseTrips.duration=$event.target.input"
                         type="number">
          </f7-list-input>

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
      thisNewRoute: {pickup_point:'', drop_point:''},
      thisDay: 'all',
      timetable: {},
      routes: [],
      vehicles: ["Shuttle"],
      newVehicleName: '',
      popupEdit: false,
      // This goes onto a poup showing route map.
      thisRouteMap: '<p>No route found.</p>',
      thisEntry: {day:'', pickup_point:'NCBS', drop_point:'IIsc', 'is_new':false},
      thisEntryStatus: "OK",
      theseTrips: {vehicle: '', days:[]
        , trip_start_time:'', trip_end_time:'', duration: 30
        , timetable:{}, comment:'', is_new:false
      },
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
    changeDay: async function(day) {
      const self = this;
      if(self.selectedDays.includes(day))
        self.selectedDays = self.selectedDays.filter(e => e !== day);
      else
        self.selectedDays.push(day);

      self.selectedDays = self.selectedDays.sort(self.sortDays);
      let t = await self.fetchTransport();
    },
    fetchTransport: async function() 
    {
      const self         = this;
      const app          = self.$f7;
      app.preloader.show();
      var endpoint = self.selectedDays.join(',');
      if(self.thisRoute.pickup_point)
        endpoint += '/' + self.thisRoute.pickup_point;
      if(self.thisRoute.drop_point)
        endpoint +=  '/' + self.thisRoute.drop_point;

      let x = await self.postWithPromise('/transportation/timetable/'+endpoint)
        .then( function(x) {
          var res = JSON.parse(x.data);
          app.preloader.hide();
          return self.createTimetable(res.data);
        });
      setTimeout(() => app.preloader.hide());
    },
    createTimetable: async function(trips) {
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
    selectRoute: async function(route) {
      const self = this;
      self.thisRoute = route;
      self.saveStore('thisRoute', route);
      let t = await self.fetchTransport();
    },
    isSameRoute: function(a, b) {
      if(a.pickup_point == b.pickup_point && a.drop_point == b.drop_point)
        return true;
      return false;
    },
    addNewEntry: async function(entry, refresh=true, notify=true) {
      const self = this;
      const app = self.$f7;
      if(notify)
        app.dialog.preloader('Adding new trip...');
      var promise = self.promiseWithAuth('transportation/schedule/add', entry)
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
      return promise;
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
      app.preloader.show();
      self.postWithPromise('transportation/schedule/delete/'+ids)
        .then(function(x) {
          self.fetchTransport();
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 5000);
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
        console.log('delete');
        self.theseTrips.days = self.theseTrips.days.filter(d => d !== day);
      }
      else {
        console.log('add');
        self.theseTrips.days.push(day)
      }
      console.log('Days ', self.theseTrips.days);
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
        var entry = {'day': day, 'is_new':true
          , 'trip_start_time': self.theseTrips.trip_start_time
          , 'duration': self.theseTrips.duration
          , 'vehicle': self.theseTrips.vehicle, ...self.thisRoute};
        self.addNewEntry(entry);
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
      self.theseTrips.duration = 30;
      self.theseTrips.timetable = {};
      self.theseTrips.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      self.popupAddTrips = true;
    },
    addTheseNewTrips: async function() {
      const self = this;
      console.log("Adding followiing trips: ", self.theseTrips);
      for(var day of self.theseTrips.days) {
        console.log("Adding on day : ", day);
        var entry = {day: day, is_new:true
          , trip_start_time: self.theseTrips.trip_start_time
          , duration: self.theseTrips.duration
          , comment: self.theseTrips.comment
          , vehicle: self.theseTrips.vehicle
          , ...self.thisRoute};
        await self.addNewEntry(entry, true, false);
      }
      self.popupAddTrips = false;
    },
    addNewVehicle: function(veh) {
      const self = this;
      const app = self.$f7;
      console.log("Adding vehicle ", veh);
      self.postWithPromise('transportation/vehicle/add/'+veh)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Sucessfully Added.");
            self.fetchVehicles();
          }
          else 
            app.dialog.alert("Failed.", res.msg); 
        });

    },
    deleteVehicle: function(veh) {
      const self = this;
      const app = self.$f7;
      console.log("Deleting vehicle ", veh);
      self.postWithPromise('transportation/vehicle/delete/'+veh)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Sucessfully deleted");
            self.fetchVehicles();
          }
          else 
            app.dialog.alert("Failed.", res.msg); 
        });
    },
    routeAction: function(route, action) {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('transportation/route/'+action, route)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Sucessfully "+action+"ed.");
            self.fetchRoutes();
          }
          else 
            app.dialog.alert("Failed to "+action, res.msg); 
        });
    },
    deleteRoute: function(route) {
      const self = this;
      self.routeAction(route, 'delete');
    },
    addNewRoute: function(route) {
      const self = this;
      self.routeAction(route, 'add');
    },
    routeToHtml: function(route) {
      return route.drop_point + ' → ' + route.pickup_point;
    },
  },
};

</script>
