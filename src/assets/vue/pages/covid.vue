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
          <f7-button small raised class="float-right"
            @click="notifyNewCovidAlert"
            tooltip="Hippo will send you email alert if a new case is found in
            your locality (1KM radius)">
            Send Me Email Alert
          </f7-button>
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
        <l-circle :lat-lng="myLocation" :radius="1000">
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

    self.map = this.$refs.map.mapObject;
    // new self.CustomControl({position:'topright'}).addTo(self.map);

  },
  methods: { 
    onResize: function() { },
    refreshMap: function() {
      const map = this.$refs.map.mapObject;
    },
    fetchData: async function( ) {
      const self = this;
      const app = self.$f7;
      var map = self.$refs.map.mapObject;

      app.preloader.show();
      // URL is from BBMP map; available in public.
      self.postWithPromise('config/BBMP_COVID_DATA_URL').then(function(x) {
        let url = JSON.parse(x.data).data.value;
        app.request.promise.get(url).then( function(x) {
          var cases = JSON.parse(x.data).features;
          for(var k in cases) {
            let item = cases[k].attributes;
            let loc = L.latLng(L.latLng(parseFloat(item.Y), parseFloat(item.X)));
            self.coronaXY.push({latlng: loc, address: item.Address});

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
          console.log(self.polylines);

          app.preloader.hide();
        });
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
          console.log("Confirmed yet");
          let data = {login: self.whoAmI(), loc: self.myLocation};
          self.promiseWithAuth('/covid/alert/add/', data).then(function(x) {
              console.log('Added alert: ', data);
            });
        }, function(no) {
          console.log("Rejected");
        });
    },
  },
};

</script>
