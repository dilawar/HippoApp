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
      zoom:18,
      bounds: null,
      map: null,
      center: L.latLng(13.071081, 77.58025),
      mapStyle: 'width:100%; height:100%',
      venues: [],
      mapVenues : [],
      venueIcon: L.divIcon( {className: 'fa fa-map-marker fa-2x' }),
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
              let found = [];
              for(let k in self.mapVenues)
              {
                let venue = self.mapVenues[k];
                if( venue.id.toLowerCase().includes(name.toLowerCase()) )
                  found.push(venue);
              }
              // Flash these venues
              found.map( venue => {
                // Find its reference.
                let p = self.$refs['marker'+venue.id][0].mapObject;
                p.bindPopup(venue.html).openPopup();
              });
            }
          }

          return container;
        },
      }),
    };
  },
  mounted: function() {
    const self = this;
    self.postWithPromise("/venue/list/all").then(function(x) {
      let res = JSON.parse(x.data);
      self.venues = res.data;
      // Reformat to create mapVenues
      for(var k in self.venues) {
        var venue = self.venues[k];
        if(venue.longitude > 0 && venue.latitude > 0) {
          var mapV = { 
            id: venue.id
            , xy: L.latLng(parseFloat(venue.latitude), parseFloat(venue.longitude))
            , html: venue.id + "<sup>" + venue.floor + "</sup>"
            , size: parseInt(venue.strength),
          };
          self.mapVenues.push(mapV);
        }
      };
    });

    // Once venues have been fetched, add them to controller.
    self.map = this.$refs.map.mapObject;
    new self.CustomControl({position:'topright'}).addTo(self.map);
  },
  methods: { 
    refreshVenues: function() {
      self.fetchVenues();
    },
    onResize: function() { },
    refreshMap: function() {
      const map = this.$refs.map.mapObject;
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
    getIcon: function( strength ) {
      strength = 10+2*Math.sqrt(strength);
      return L.icon({
        iconUrl: "static/leaf-green.png",
        iconSize:     [strength, 2*strength],
        iconAnchor:   [strength*0.5, 2*strength],
        popupAnchor:  [0, 10]
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
