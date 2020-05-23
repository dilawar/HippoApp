<template>
  <f7-page page-content @page:afterout="clearAll" >
    <f7-navbar :title="title" back-link="Back"></f7-navbar>

    <l-map ref="osm" :zoom="zoom" :center="center" :style="mapStyle"
           @update:center="centerUpdated" @update:zoom="zoomUpdated"
           @update:bounds="boundsUpdated">

       <l-control-layers position="topright"></l-control-layers>

       <l-tile-layer v-for="tileProvider in $store.state.OSM.tileProviders"
         :key="tileProvider.name"
         :name="tileProvider.name"
         :visible="tileProvider.visible"
         :url="tileProvider.url"
         :attribution="tileProvider.attribution"
         layer-type="base">
       </l-tile-layer>

       <!-- Show hotlines -->
       <l-polyline v-for="(arr, key) in hotlines" 
         :lat-lngs="arr" 
         :key="key"
         color="blue"
         :weight="8"
         :smoothFactor="3.0">
       </l-polyline>

       <l-marker :lat-lng="myPos">
       </l-marker>

       <!-- Latest position -->
       <l-marker v-for="(p, key) in latestPos" :key="p.id" 
         :lat-lng="p.xy" :icon="p.options.icon"> 
         <l-tooltip :options="{permanent: false}"
           style="white-space:normal;width:50px">
           <div v-html="p.html"></div>
         </l-tooltip>
       </l-marker>

       <l-marker :ref="v.id" v-for="v in markers" :key="v.id" 
         :lat-lng="v.xy" :options="v.options"> 
         <l-tooltip :options="$store.state.OSM.toolTipOpts" 
           style="white-space:normal;width:100px">
           <div v-html="v.html"></div>
         </l-tooltip>
       </l-marker>

    </l-map>
  </f7-page>
</template>

<script>
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
      myPos: [0, 0],
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
    const app = self.$f7;
    self.map = self.$refs.osm.mapObject;
    navigator.geolocation.getCurrentPosition( function(loc) {
      self.myPos = [ loc.coords.latitude, loc.coords.longitude];
      console.log( "Current location: ", self.myPos, loc.coords)
    }, function(x) {
      console.log( "Failed to locate.");
    });

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
    if(action === 'accomodation')
    {
      self.title = "Use it at your own risk...";
      let id = self.$f7route.params.arg2;
      let accs = self.loadStore('accomodations');
      let acc = accs.list.find(x=> x.id.toString() === id.toString());
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
          let uri = self.locationIQ.url +
            "&q="+encodeURI(addr)+"&format=json&country=IN";
          app.request.promise({url: uri}).then( function(x) {
            let results = JSON.parse(x.data);
            results.map((place, index) => {
              self.markers.push({
                id: index, xy: L.latLng(place.lat, place.lon)
                , html: `<font style='color:red'> This position is found by
                                 a map service for given address. Use it at your
                                 own risk! <br /> </font>`
                + place.display_name
              });
            });
          });

          //self.googleMapProvider.search({query: addr}).then( (results) => {
          //  console.log( "Found many results ", results);
          //  results.map((place, index) => {
          //    self.markers.push({
          //      id: index, xy: L.latLng(place.y, place.x)
          //      , html: `<font style='color:red'> This position is found by
          //                       Google Map as per given address. Use it at your
          //                       own risk! <br /> </font>`
          //      + place.label
          //    });
          //  });
          //  console.log( 'Total markers ' + self.markers.length);
          //  // Add the address on the 
          //});
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

      self.postWithPromise("/geolocation/latest/60")
        .then(function(x) {
          let res = JSON.parse(x.data);
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
                  html: '<i class="fa fa-bus fa-2x"></i>'
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
