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
                         color="green"
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
               <l-tooltip :options="{permanent: false}"
                   style="white-space:normal;width:50px">
                   <div v-html="p.html"></div>
               </l-tooltip>
             </l-marker>

             <l-marker :ref="v.id" 
                        v-for="v in markers" 
                        :key="v.id" 
                        :lat-lng="v.xy"
                        :options="v.options"
                        > 
                <l-tooltip 
                        :options="$store.state.OSM.toolTipOpts"
                        style="white-space:normal;width:100px"
                        >
                   <div v-html="v.html"></div>
                </l-tooltip>
             </l-marker>
      </l-map>
   </f7-page>
</template>

<script>


import hotline from 'leaflet-hotline';
import moment from 'moment';

export default {
   data() {
      const self = this;
      return {
         zoom:13,
         title: 'Please wait ...',
         bounds: null,
         map: null,
         center: L.latLng(13.071081, 77.58025),
         mapStyle: 'width:100%; height:100%',
         markers: [],
         venues: [],
         geosearchOptions: {},
         hotlines: {},
         latestPos: [],
         repeat: 0,
         lastUpdatedOn: [],
         CustomControl :  L.Control.extend({
            onAdd: function (map) {
               var container = L.DomUtil.create('div');
               container.innerHTML = "Please wait ...";
               container.style.backgroundColor = 'white';     
               container.style.width = '180px';
               container.style.height = '15px';
               return container;
            },
         }),
         flashDiv : null,
      };
   },
   mounted: function() {
      const self = this;
      self.map = self.$refs.osm.mapObject;

      if( self.map )
         self.flashDiv = new self.CustomControl().addTo(self.map);

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

         // Refresh it every 10 seconds.
         if( self.repeat != 0 )
            return;

         self.repeat = setInterval(() => {
            self.fetchLatestRoute( ) 
            self.title = "OSM: Live location";
         }, 5000);
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
      fetchLatestRoute: function() {
         const self = this;

         self.postWithPromise("/geolocation/latest/10")
            .then(function(json) {
               let res = JSON.parse(json);
               if(res.status !== "ok") 
                  return

               console.log( "Creating hotlines ...");
               self.latestPos = [];
               self.lastUpdatedOn = [];
               for(let k in res.data) {
                  let pts = res.data[k];
                  let coords = pts.map(x => [x.latitude, x.longitude]);
                  let lastPCoord = coords[0];
                  self.hotlines[k] = coords;
                  self.lastUpdatedOn.push(self.datetime2Moment(pts[0].timestamp));
                  self.latestPos.push({
                     id: 'latest'+k, 
                     xy: L.latLng(lastPCoord[0], lastPCoord[1]),

                     html: self.str2Moment(pts[0].timestamp, 'YYYY-MM-DD HH:mm:ss').fromNow(),
                     options: { 
                        icon: L.divIcon({
                           className : 'location-head-icon',
                           html: '<i class="fa fa-map-pin fa-2x"></i>'
                           }),
                        },
                     });

                  self.flashDiv._container.innerHTML = "Position updated: " +
                     moment.max(self.lastUpdatedOn).fromNow();
               }
            });
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
         const self = this;
         console.log( "Clearing events " )
         clearInterval(self.repeat);
         console.log( self.repeat, 'repeat');
         self.repeat = 0;
      },
   },
};

</script>