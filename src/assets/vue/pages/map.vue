<template>
   <f7-page page-content>
      <f7-navbar title="Map" back-link="Back"></f7-navbar>


      <!-- FAB Right Bottom (Orange) -->
      <f7-fab position="right-bottom" slot="fixed" color="orange">
         <f7-icon ios="f7:add" aurora="f7:add"
                               md="material:add"></f7-icon>
         <f7-icon ios="f7:close" aurora="f7:close"
                                 md="material:close"></f7-icon>
         <f7-fab-buttons position="top">
            <f7-fab-button label="Action
            1">1</f7-fab-button>
            <f7-fab-button label="Action
            2">2</f7-fab-button>
         </f7-fab-buttons>
      </f7-fab>

   

      <l-map ref="map" 
             :zoom="zoom" 
             :center="center"
             :style="mapStyle"
             @update:center="centerUpdated"
             @update:zoom="zoomUpdated"
             @update:bounds="boundsUpdated"
             >
             <l-control-layers position="topright"></l-control-layers>
             <l-tile-layer v-for="tileProvider in tileProviders"
                           :key="tileProvider.name"
                           :name="tileProvider.name"
                           :visible="tileProvider.visible"
                           :url="tileProvider.url"
                           :attribution="tileProvider.attribution"
                           :token="token"
                           layer-type="base"
                           >
             </l-tile-layer>
             <l-marker v-for="v in mapVenues" :key="v.id" :lat-lng="v.xy"> 
                <l-tooltip :options="toolTipOpts">
                   <span v-html="v.html"></span>
                </l-tooltip>
             </l-marker>
      </l-map>

   </f7-page>
</template>

<script>

export default {
   data() {
      return {
         zoom:17,
         bounds: null,
         tileProviders: [
            {
               name: 'OpenStreetMap',
               visible: true,
               attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
               url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            },
            {
               name: 'OpenTopoMap',
               visible: false,
               url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
               attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            }
         ],
         toolTipOpts: {permanent:false, interactive:true},
         center: L.latLng(13.071081, 77.58025),
         url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
         attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
         mapStyle: 'width:100%; height:100%',
         venues: [],
         mapVenues : [],
         leafIcon: L.icon({
            iconUrl: 'http://leafletjs.com/examples/custom-icons/leaf-green.png',
            shadowUrl: 'http://leafletjs.com/examples/custom-icons/leaf-shadow.png',
            iconSize:     [38, 95],
            shadowSize:   [50, 64],
            iconAnchor:   [22, 94],
            shadowAnchor: [4, 62],
            popupAnchor:  [-3, -76]
         }),
         venueIcon: L.divIcon({className: 'fa fa-map-pin fa-2x'}),
      };
   },
   mounted() {
      // Periodically show the markers.

      const self = this;
      self.$refs.map.mapObject.invalidateSize();
      console.log( "Fetching venues... ");
      self.fetchVenues();
      self.venues = JSON.parse( self.$localStorage.get('venues', '[]'));
      console.log( " ... got ", self.venues.length);
      // Reformat to create mapVenues
      for(var k in self.venues)
      {
         console.log( 'Adding a venue ... ', k);
         var venue = self.venues[k];
         if( venue.longitude > 0 && venue.latitude > 0)
         {
            var mapV = { 
               xy: L.latLng(parseFloat(venue.latitude), parseFloat(venue.longitude))
               , html: venue.id + '<sup>' + venue.floor + '</sup>'
            };
            self.mapVenues.push(mapV);
         }
      }
   },
   methods: { 
      refreshVenues: function() {

      },
      onResize: function() { },
      refreshMap: function() {
         const map = this.$refs.map.mapObject;
         //this.venues.map( x => x );
      },
      zoomUpdated (zoom) {
         this.zoom = zoom;
      },
      centerUpdated (center) {
         this.center = center;
      },
      boundsUpdated (bounds) {
         this.bounds = bounds;
      },
   },
};

</script>
