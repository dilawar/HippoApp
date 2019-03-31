<template>
<f7-page page-content ptr @ptr:refresh="fetchMap" >
  <f7-navbar title="Map" back-link="Back"></f7-navbar>

  <!-- Days related -->
  <f7-block>
     <no-ssr>
        <l-map :zoom="zoom" :center="center">
           <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
           <l-marker :lat-lng="marker"></l-marker>
        </l-map>
     </no-ssr>
  </f7-block>

</f7-page>
</template>

<script>

import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
   data() {
      return {
         zoom:20,
         center: L.latLng(13.0714215, 77.5810642),
         url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
         attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
         marker: L.latLng(13.0714215, 77.5810642),
      };
   },
   computed: {
   },
   mounted: function() {
      const self = this;
   },
   methods: { 
      fetchMap: function() {
      },
   },
};

</script>
