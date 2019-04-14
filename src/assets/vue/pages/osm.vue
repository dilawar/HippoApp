<template>
   <f7-page page-content>
      <f7-navbar title="Open Street Map" back-link="Back"></f7-navbar>
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

export default {
   data() {
      const self = this;
      return {
         zoom:13,
         bounds: null,
         map: null,
         center: L.latLng(13.071081, 77.58025),
         mapStyle: 'width:100%; height:100%',
         markers: [],
         venues: [],
         geosearchOptions: {},
      };
   },
   mounted: function() {
      const self = this;
      self.map = self.$refs.osm.mapObject;

      // Add NCBS to default.
      self.markers.push({ id: 'NCBS', xy: self.center
         , html: "NCBS Bangalore"
         , options: {opacity: 0.75}}
      );

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
                     console.log('x', place.x, place.y, place.label);
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
         const map = this.$refs.map.mapObject;
         //this.venues.map( x => x );
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
   },
};

</script>
