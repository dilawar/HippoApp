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
             <l-marker v-for="v in venues" :key="v.html"
                :lat-lng="v.xy"> 
                <l-tooltip :options="toolTipOpts"><span v-html="v.html"></span></l-tooltip>
             </l-marker>
      </l-map>

   </f7-page>
</template>

<script>
export default {
   data() {
      return {
         zoom:20,
         bounds: null,
         center: L.latLng(13.071081, 77.58025),
         url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
         attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
         mapStyle: 'width:100%; height:100%',
         venues: [ 
            {xy: L.latLng(13.0714215, 77.5810642), 'html' : 'Reception'},
            {xy:L.latLng(13.07088,77.58049),'html':'Dasheri'},
            {xy:L.latLng(13.07144,77.58071),'html':'Simon Center'},
            // Three in SLC
            {xy:L.latLng(13.07064,77.57989),'html':'Synapse<sup>1</sup><br/>Endosome'+
               '<sup>2</sup><br />Mitochondria<sup >3</sup>'},
            {xy:L.latLng(13.07067,77.57962),'html':'Raspuri'},
            {xy:L.latLng(13.07093,77.58094),'html':'Nucleus<sup>1</sup><br/>Golgi<sup>2</sup>'+
               '<br/>Chloroplast<sup>3</sup>'
            },
         ],
         toolTipOpts: {permanent:false, interactive:true},
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
