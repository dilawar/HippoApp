<template>
   <f7-page page-content>
      <f7-navbar title="Map" back-link="Back"></f7-navbar>

      <!-- FAB Right Bottom (Orange) 
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
      -->

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
                           layer-type="base"
                           >
             </l-tile-layer>
                <l-marker :ref="v.id" 
                           v-for="v in mapVenues" 
                           :key="v.id" 
                           :lat-lng="v.xy"
                           :icon="getIcon(v.size)"
                           > 
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
         venueIcon: L.divIcon( {className: 'fa fa-map-marker fa-2x' }),
      };
   },
   mounted: function() {
      const self = this;
      self.postWithPromise( '/venue/list/all').then(
         function(json) {
            self.venues = JSON.parse(json).data;
            self.saveStore('venues', self.venues);
            // Reformat to create mapVenues
            for(var k in self.venues)
            {
               var venue = self.venues[k];
               if(venue.longitude > 0 && venue.latitude > 0)
               {
                  var mapV = { 
                     id: venue.id
                     , xy: L.latLng(parseFloat(venue.latitude), parseFloat(venue.longitude))
                     , html: venue.id + '<sup>' + venue.floor + '</sup>'
                     , size: parseInt(venue.strength),
                  };

                  // Group venues according to coordinates. If two venues shares
                  // coordinate then stack them up onto each other.
                  let venueWithSameCoords = self.mapVenues.find(x=> x.xy.equals(mapV.xy));
                  if(venueWithSameCoords)
                     venueWithSameCoords.html += '<br/>' + mapV.html;
                  else
                     self.mapVenues.push(mapV);
               }
            };
         }
      );
   },
   methods: { 
      refreshVenues: function() {
         self.fetchVenues();
      },
      onResize: function() { },
      refreshMap: function() {
         const map = this.$refs.map.mapObject;
         //this.venues.map( x => x );
      },
      zoomUpdated (zoom) {
         const self = this;
         //self.map.eachLayer( function(l) {
         //   console.log(l);
         //   if(l.options.pane == 'markerPane')
         //   {
         //      setTimeout( () => l.togglePopup(), 1000);
         //   }
         //});
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
            popupAnchor:  [0, 0]
         });
      },
   },
};

</script>
