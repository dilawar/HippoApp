<template>
  <f7-page page-content>
    <f7-navbar title="COVID19 Information" back-link="Back"></f7-navbar>

    <f7-row style="background-color:rgba(255,255,255,0.8);
      position:absolute; width:100vw; bottom:60px; left:0px; z-index:1000">

      <f7-col v-if="alerts.length > 0">
        <small>
          {{alerts.length}} alerts (click on circle to remove);
        </small>
      </f7-col>
      <f7-col>
        <span v-if="lastUpdated">
          <small>
            Last updated: {{toNowDatetime(lastUpdated)}} ago.
          </small>
        </span>
        <f7-link external target="_system" href="https://covid19.bbmpgov.in"> 
          Data source BBMP
        </f7-link>
      </f7-col>
      <f7-col>
      </f7-col>
    </f7-row>

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
        :icon="toCovidIcon(v.dateOfIdent)"> 
        <l-tooltip>{{v.address}}</l-tooltip>
      </l-marker>

      <!-- Draw distances -->
      <l-circle @click="removeAlert(alert)"
        v-for="alert, key in alerts" 
        :key="'alert'+key" :radius="1000" 
        :opacity="0.5" 
        color="red"
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

  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
  data() {
    const self = this;
    return {
      zoom:12,
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
      lastUpdated: null,
      alerts: [],
      covidIcon: L.divIcon({className: 'fas fa-disease fa-1x'
        , iconSize: [20, 20], iconAnchor:[10,10]}),

      textControl :  L.Control.extend({
        onAdd: function (map) {
          var container = L.DomUtil.create('div');
          container.value = "ABCF";
          return container;
        },
      }),

      currLocControl :  L.Control.extend({
        onAdd: function (map) {
          var container = L.DomUtil.create('button', 'leaflet-control');
          container.innerHTML = "<i class='fa fa-map-marker-alt'></i>";
          container.style = "width:34px; height:34px;";
          container.tooltip = "Go to my current location";
          container.onclick = function() {
            navigator.geolocation.getCurrentPosition( function(loc) {
              self.myLocation = L.latLng(loc.coords.latitude, loc.coords.longitude);
              // recenter
              self.center = self.myLocation;

            }, function(x) {
              const app = self.$f7;
              self.notify("Failed"
                , "Hippo could not retrieve your current location");
              console.log("Can't fetch position");
            });
          }
          return container;
        },
      }),

      alertControl :  L.Control.extend({
        onAdd: function (map) {
          var container = L.DomUtil.create('button', 'leaflet-control');
          container.innerHTML = "<i class='fa fa-bell'></i>";
          container.style = "width:34px; height:34px;";
          container.tooltip = "Add an alert on location";
          container.onclick = function() {
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
          };
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
      self.center = self.myLocation;
    }, function(x) {
      //
    });

    let res = await self.fetchData();
    res = await self.fetchAlerts();

    self.map = this.$refs.map.mapObject;
    new self.currLocControl({position:'topleft'}).addTo(self.map);

    new self.alertControl({position:'topleft'}).addTo(self.map);

  },
  methods: { 
    onResize: function() { },
    refreshMap: function() {
      const map = this.$refs.map.mapObject;
    },
    toCovidIcon: function(dateOfIdent) {
      const self = this;
      let ts = moment(dateOfIdent, 'YYYY-MM-DD');
      console.log('xx', moment().diff(ts, 'hours'), dateOfIdent);

      // 1 week olk
      let html = '<i class="fas fa-disease"></i>';
      if(moment().diff(ts, 'days') < 7)
        html = '<i class="fas fa-disease fa-2x fa-spin"></i>';
      return L.divIcon({html: html, iconSize: [20, 20], iconAnchor:[10,10]});
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

          let ts = self.datetime2Moment(item.timestamp);

          // Check if timestamp is newer than the last updated.
          if(ts > self.lastUpdated)
            self.lastUpdated = ts;

          if(item.pstatus.toLowerCase() !== 'active')
            continue;

          let loc = L.latLng(L.latLng(item.latitude, item.longitude));
          self.coronaXY.push({latlng: loc, address: item.address
            , dateOfIdent : item.date_of_identification});
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
    addNewCovidAlert: function(x) {
      const self = this;
      const app = self.$f7;
      app.dialog.confirm("Tip! You can drag the marker to more precise " 
        + "location."
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
