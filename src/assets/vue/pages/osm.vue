<template>
   <f7-page page-content @page:afterout="clearAll" >
      <f7-navbar :title="title" back-link="Back"></f7-navbar>
      <l-map ref="osm" 
             :zoom="zoom" 
             :center="center"
             :style="mapStyle"
             @update:center="centerUpdated"
             @update:zoom="zoomUpdated"
             @update:bounds="boundsUpdated"
             >
             <l-control-layers position="topright"></l-control-layers>


             <l-tile-layer v-for="tileProvider in $store.state.OSM.tileProviders"
                           :key="tileProvider.name"
                           :name="tileProvider.name"
                           :visible="tileProvider.visible"
                           :url="tileProvider.url"
                           :attribution="tileProvider.attribution"
                           layer-type="base"
                           >
             </l-tile-layer>

             <!-- Show hotlines -->
             <l-polyline v-for="(arr, key) in hotlines" 
                         :lat-lngs="arr" 
                         :key="key"
                         color="blue"
                         :weight="5"
                         :smoothFactor="2.0"
                         >
             </l-polyline>

             <!-- Latest position -->
             <l-marker v-for="(p, key) in latestPos" 
                        :key="p.id" 
                        :lat-lng="p.xy"
                        :icon="p.options.icon"
                        > 
             </l-marker>

             <l-marker :ref="v.id" 
                        v-for="v in markers" 
                        :key="v.id" 
                        :lat-lng="v.xy"
                        :options="v.options"
                        > 
                <l-tooltip :options="$store.state.OSM.toolTipOpts"
                   style="white-space:normal;width:100px">
                   <div v-html="v.html"></div>
                </l-tooltip>
             </l-marker>
      </l-map>
   </f7-page>
</template>

<script>

import hotline from 'leaflet-hotline';

export default {
   data() {
      const self = this;
      return {
         zoom:13,
         title: 'OSM',
         bounds: null,
         map: null,
         center: L.latLng(13.071081, 77.58025),
         mapStyle: 'width:100%; height:100%',
         markers: [],
         venues: [],
         geosearchOptions: {},
         hotlines: {},
         latestPos: [],
         repeat: null,
      };
   },
   mounted: function() {
      const self = this;
      self.map = self.$refs.osm.mapObject;

      // Add NCBS to default.
      /*
      self.markers.push({ id: 'NCBS', xy: self.center
         , html: "NCBS Bangalore"
         , options: {opacity: 0.75}}
      );
       */

      // Check what we got from router.
      let action = self.$f7route.params.arg1;
      let id = self.$f7route.params.arg2;
      if(action === 'accomodation')
      {
         let acc = self.loadStore('accomodations').list.find(x=> x.id === id);
         if(acc)
         {
            let addr = acc.address;
            let loc = acc.location;
            if(loc) 
            {
               // Location found. It is coordinates.
               self.markers.push({
                  id: index, xy: L.latLng(place.y, place.x)
                  , html: place.label
               });
            }
            else 
            {
               self.googleMapProvider.search({query: addr}).then( (results) => {
                  console.log( "Found many results ", results);
                  results.map((place, index) => {
                     self.markers.push({
                        id: index, xy: L.latLng(place.y, place.x)
                        , html: `<font style='color:red'> This position is found by
                                 Google Map as per given address. Use it at your
                                 own risk! <br /> </font>`
                        + place.label
                     });
                  });
                  console.log( 'Total markers ' + self.markers.length);
                  // Add the address on the 
               });
            }
         }
      }
      else if(action === "liveroute")
      {
         const self = this;
         const app = self.$f7;
         self.map = self.$refs.osm.mapObject;

         // Refresh it every 10 seconds.
         self.repeat = setInterval( () => {
            // Show location of all available tracks.
            self.title = "OSM: Live location";
            self.postWithPromise( "/geolocation/latest/10").then(
               function(json) {
                  let res = JSON.parse(json);
                  if(res.status !== "ok") 
                     return

                  console.log( "Drawing hotline");
                  self.latestPos = [];
                  for(let k in res.data) 
                  {
                     let pts = res.data[k].map(x => [x.latitude, x.longitude]);
                     self.hotlines[k] = pts;
                     self.latestPos.push({
                        id: 'latest'+k, 
                        xy: L.latLng(pts[0][0], pts[0][1]),
                        options: { 
                           icon: L.divIcon({
                              className : 'location-head-icon',
                              html: '<i class="fa fa-bus fa-2x"></i>'
                              }),
                           },
                        }
                     );
                  }
               });
            }, 7000
         );
      }
      else
      {
         console.log("Not supported:"+action+"/"+id);
      }
   },
   methods: { 
      refreshVenues: function() {
         self.fetchVenues();
      },
      onResize: function() { },
      refreshMap: function() {
         // const map = this.$refs.osm.mapObject;
         // this.venues.map( x => x );
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
      clearAll: function( ) {
         console.log( "Clearing events " )
         if(self.repeat)
            clearInterval(self.repeat);
      },
   },
};

</script>
