<template>
   <f7-page page-content>
      <f7-navbar title="Map" back-link="Back"></f7-navbar>
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

//import {GeoSearchControl, OpenStreetMapProvider} from 'leaflet-geosearch';
//import "leaflet-geosearch/assets/css/leaflet.css";
//
//// Add search control.
//const provider = new OpenStreetMapProvider();
//const searchControl = new GeoSearchControl({ provider: provider, }); 
//searchControl.setPosition('topright');

export default {
   data() {
      const self = this;
      return {
         zoom:17,
         bounds: null,
         map: null,
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
         geosearchOptions: {},
         CustomControl :  L.Control.extend({
            onAdd: function (map) {
               var container = L.DomUtil.create('input');
               container.type="input";
               container.placeholder="Search venues";
               container.value = "";

               container.style.backgroundColor = 'white';     
               //container.style.backgroundImage = "url(https://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
               container.style.backgroundSize = "100px 100px";
               container.style.width = '110px';
               container.style.height = '15px';

               container.onmouseover = function(){
                  container.style.backgroundColor = 'pink'; 
               }
               container.onmouseout = function(){
                  container.style.backgroundColor = 'white'; 
               }

               container.oninput = function( ){
                  if(container.value.length > 1){
                     let name = container.value;
                     console.log( 'Trigger autocomplete');
                     console.log( name );
                     let found = [];
                     for(let k in self.mapVenues)
                     {
                        let venue = self.mapVenues[k];
                        if( venue.id.toLowerCase().includes(name.toLowerCase()) )
                           found.push(venue);
                     }
                     console.log( 'Total ', found.length, ' venues found.');
                     // Flash these venues
                     found.map( venue => {
                        L.popup().setLatLng(venue.xy).setContent(venue.id).addTo(self.map);
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
            popupAnchor:  [0, 10]
         });
      },
   },
};

</script>
