<template>
   <f7-page page-content>
      <f7-navbar title="Map" back-link="Back"></f7-navbar>

      <l-map ref="map" :zoom="zoom" 
             :center="center"
             :style="mapStyle"
             @update:center="centerUpdated"
             @update:zoom="zoomUpdated"
             @update:bounds="boundsUpdated"
             >
             <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      </l-map>

   </f7-page>
</template>

<script>
export default {
   data() {
      return {
         zoom:17,
         bounds: null,
         center: L.latLng(13.071081, 77.58025),
         url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
         attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
         mapStyle: 'width:100%; height:100%',
         venues: [ 
            { xy: L.latLng(13.0714215, 77.5810642), 'name' : 'Reception'},
            { xy: L.latLng(13.071081, 77.58025), 'name' : 'SLC'},
         ],
      };
   },
   computed: {
   },
   mounted () {
      this.$refs.map.mapObject.invalidateSize();
   },
   methods: { 
      onResize: function() {
      },
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
