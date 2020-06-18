<template>
  <f7-page page-content>
    <f7-navbar title="COVID19 Information" back-link="Back"></f7-navbar>

    <f7-block-header>
      <f7-row>
        <f7-col width="70">
          Data shown here is scraped from BBMP website every hour.
          <f7-link external target="_system"
            href="https://covid19.bbmpgov.in"> 
            https://covid19.bbmpgov.in
          </f7-link>.
        </f7-col>
        <f7-col v-if="isUserAuthenticated()" width="30">
          <f7-button small raised 
            @click="notifyNewCovidAlert"
            tooltip="Hippo will send you email alert if a new case is found in
            your locality (1KM radius)">
            Add Alert
          </f7-button>
          <div v-if="alerts.length > 0">
            <small>
              {{alerts.length}} active alerts (click on circle to remove);
            </small>
          </div>

        </f7-col>
      </f7-row>
    </f7-block-header>

    <div style="width=100%; height:800px">
      <l-map ref="map" 
        :zoom="zoom" 
        :center="center"
        :style="mapStyle"
        @update:center="centerUpdated"
        @update:zoom="zoomUpdated"
        @update:bounds="boundsUpdated">
        <l-control-layers position="topright">
        </l-control-layers>
        <l-tile-layer v-for="tileProvider in $store.state.OSM.tileProviders"
          :key="tileProvider.name"
          :name="tileProvider.name"
          :visible="tileProvider.visible"
          :url="tileProvider.url"
          :attribution="tileProvider.attribution"
          layer-type="base">
        </l-tile-layer>

        <l-marker v-for="v, key in coronaXY" :lat-lng="v.latlng"
          :key="key" :visible="true" 
          :icon="covidIcon"> 
          <l-tooltip>{{v.address}}</l-tooltip>
        </l-marker>

        <!-- Draw distances -->
        <l-circle 
          @click="removeAlert(alert)"
          v-for="alert in alerts"
          :radius="1000" 
          :opacity="0.1"
          :lat-lng="[alert.latitude, alert.longitude]">
        </l-circle>

        <l-circle :lat-lng="myLocation" :radius="200">
        </l-circle>
        <l-marker :lat-lng="myLocation" 
          @update:latLng="updateMyLocation"
          key="mylocation" 
          :draggable="true">
        </l-marker>
      </l-map>
    </div>
  </f7-page>
</template>

<script>

export default {
  data() {
    const self = this;
    return {
      zoom:14,
      bounds: null,
      map: null,
      center: L.latLng(13.07083, 77.58014),
      myLocation: L.latLng(13.07083, 77.58014),
      mapStyle: 'width:100%; height:100%',
      venues: [],
      distances: {},
      polylines: {},
      mapVenues : [],
      coronaXY: [],
      alerts: [],
      covidIcon: L.divIcon( {className: 'fas fa-disease fa-1x'
        , iconSize: [20, 20], iconAnchor:[10,10]}),
      geosearchOptions: {},
      CustomControl :  L.Control.extend({
        onAdd: function (map) {
          var container = L.DomUtil.create('input');
          container.type="input";
          container.placeholder="Search venues";
          container.value = "";

          container.style.backgroundColor = 'white';     
          container.style.backgroundSize = "100px 100px";
          container.style.width = '110px';
          container.style.height = '15px';

          container.onmouseover = function(){
            container.style.backgroundColor = 'pink'; 
          }
          container.onmouseout = function(){
            container.style.backgroundColor = 'white'; 
          }

          container.oninput = function()
          {
            if(container.value.length >= 2){
              let name = container.value;
            }
          }

          return container;
        },
      }),
    };
  },
  mounted: async function() {
    const self = this;
    const app = self.$f7;

    navigator.geolocation.getCurrentPosition( function(loc) {
      self.myLocation = L.latLng(loc.coords.latitude, loc.coords.longitude);
    }, function(x) {
      //
    });

    let res = await self.fetchData();
    res = await self.fetchAlerts();

    //self.map = this.$refs.map.mapObject;
    // new self.CustomControl({position:'topright'}).addTo(self.map);

  },
  methods: { 
    onResize: function() { },
    refreshMap: function() {
      const map = this.$refs.map.mapObject;
    },
    fetchAlerts: async function() {
      const self = this;
      const app = self.$f7;
      self.postWithPromise('/covid19/alert/mylist').then(function(x) {
        self.alerts = JSON.parse(x.data).data;
      });
    },
    fetchData: async function( ) {
      const self = this;
      const app = self.$f7;
      var map = self.$refs.map.mapObject;

      app.preloader.show();
      // URL is from BBMP map; available in public.
      self.postWithPromise('covid19/data').then(function(x) {
        let cases = JSON.parse(x.data).data;
        for(var k in cases) {
          let item = cases[k];
          let loc = L.latLng(L.latLng(item.latitude, item.longitude));
          self.coronaXY.push({latlng: loc, address: item.address});
          var distance = loc.distanceTo(self.myLocation);
          self.distances[loc] = distance;
          if(distance < 2000 ) {
            self.polylines[loc] = {
              loc: loc
              , distance: distance
              , latlngs : [self.myLocation, loc]
              , color: 'red'
            };
          }
        }
        app.preloader.hide();
      });
      setTimeout( () => app.preloader.hide(), 10000);
    },
    zoomUpdated (zoom) {
      const self = this;
    },
    centerUpdated (center) {
      this.center = center;
    },
    boundsUpdated (bounds) {
      this.bounds = bounds;
    },
    updateMyLoc: function() {
      navigator.geolocation.getCurrentPosition( function(loc) {
        self.myLocation = L.latLng(loc.coords.latitude, loc.coords.longitude);
      }, function(x) {
        self.notify("Failed", "Could not get your location.", 1000);
      });
    },
    markerClicked: function(loc) {
      const self = this;

      const map = self.$refs.map.mapObject;
      const distance = self.distances[loc];
    },
    updateMyLocation: function(loc) {
      const self = this;
      self.myLocation = L.latLng(loc.lat, loc.lng);
    },
    notifyNewCovidAlert: function(x) {
      const self = this;
      const app = self.$f7;
      app.dialog.confirm("Tip! You can drag the marker to more precise location."
        , "Continue?"
        , function(x) {
          let data = {login: self.whoAmI(), latitude: self.myLocation.lat
            , longitude: self.myLocation.lng};
          self.promiseWithAuth('/covid19/alert/add', data).then(function(x) {
            let res = JSON.parse(x.data).data;
            if(res.success) {
              self.notify("Success", "Added alert");
              self.fetchAlerts();
            }
          });
        }, function(no) {
          console.log("Rejected");
        });
    },
    removeAlert: function(alt) {
      const self = this;
      const app = self.$f7;
      console.log("Removing alert ", alt);
      app.dialog.confirm("Are you sure?", "Removing this alert?"
        , function(sure) { 
          self.promiseWithAuth('/covid19/alert/delete', alt)
            .then(function(x) {
              let res = JSON.parse(x.data).data;
              if(res.success) {
                self.notify("Success", "Successfully removed alert");
                self.fetchAlerts();
              }
            });
        }, null);
    },
  },
};

</script>
