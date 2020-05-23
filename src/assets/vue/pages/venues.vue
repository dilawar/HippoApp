<template>
  <f7-page>
    <f7-navbar title="Venues" back-link="Back">
      <f7-subnavbar :inner="false">
        <f7-searchbar
          search-container=".venue-list"
          search-in=".item-title,.item-text,.item-subtitle,.item-header,.item-footer"
          :disable-button="!$theme.aurora">
        </f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <f7-block-title medium>List of Venues</f7-block-title>

    <!-- Venue Popup -->
    <f7-popup :opened="popupVenue" @popup:close="popupVenue = false">
      <f7-page>
        <f7-navbar :title="isNew?'Add a new venue':'Update Venue'">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block-header>
          To get the location of a venue, use OpenStreetMap.
        </f7-block-header>

        <f7-list media-list inline-labels no-hairlines>
          <f7-list-item>
            <!-- geolocation -->
            <l-map v-if="! isNew" :zoom="zoom" :center="center" :style="mapStyle">
              <l-control-layers position="topright"></l-control-layers>
              <l-tile-layer v-for="tileProvider in $store.state.OSM.tileProviders"
                :key="tileProvider.name"
                :name="tileProvider.name"
                :visible="tileProvider.visible"
                :url="tileProvider.url"
                :attribution="tileProvider.attribution"
                layer-type="base">
              </l-tile-layer>
              <l-marker v-if="thisVenue.xy" :lat-lng="thisVenue.xy">
              </l-marker>
            </l-map>
          </f7-list-item>

          <f7-list-input v-for="val, key in venueSchema" 
            :label="formatKey(key)" :value="thisVenue[key]"
            :readonly="nonEditables.includes(key)"
            :type="val[0]" 
            required
            @change="thisVenue[key] = $event.target.value"
            :key="key">
            <template v-if="val[0]==='select'">
              <option>Select One</option>
              <option v-for="opt, key in val[1]" :key="'opt'+key" :value="opt">
                {{opt}}
              </option>
            </template>
          </f7-list-input>
          <f7-list-item>
            <f7-row>
              <f7-col> 
                <f7-button v-if="! isNew" color=red fill @click="deleteVenue">Delete</f7-button> 
              </f7-col>
              <f7-col> 
                <f7-button v-if="! isNew" fill @click="updateVenue">Update</f7-button> 
                <f7-button v-else fill @click="addNewVenue">Add New</f7-button>
              </f7-col>
            </f7-row>
          </f7-list-item>
        </f7-list>

        <f7-block-footer>
        </f7-block-footer>

      </f7-page>
    </f7-popup>

    <!-- List of venues -->
    <f7-block>
      <f7-list media-list accordion-item no-hairlines class="venue-list">
        <f7-list-item>
          <f7-button raised @click="addNewVenuePopup">Add a new venue</f7-button>
        </f7-list-item>

        <f7-list-item v-for="venue, key in venues" :key="key" 
          @click="updateVenuePopup(venue)">
          <div slot="header">
            Strength {{venue.strength}} | VC {{venue.suitable_for_conference}}
          </div>
          <div slot="after" v-if="venue.status!=='ACTIVE'">{{venue.status}}</div>
          <div slot="title"> 
            {{venue.name}} <small> ({{venue.type}}) </small>
          </div>
          <div slot="text">
            {{venue.institute}},
            {{venue.building_name}}<sup>{{venue.floor}} floor</sup>
          </div>
          <div slot="footer" class="text-color-red"> {{venue.note_to_user}} </div>
          <div v-if="venue.allow_booking_on_hippo==='NO'" slot="footer"
            class="bg-color-yellow">
            (booking not allowed)
          </div>
          <div v-if="venue.latitude" slot="footer">
            <f7-link icon="fa fa-map-marker-alt" external target="_system" 
              :href="osmLink(venue)">
              lat:{{venue.latitude}}, long:{{venue.longitude}}
            </f7-link>
          </div>
        </f7-list-item> 

      </f7-list>
    </f7-block>

  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    return {
      zoom: 19,  // max is 20
      center: L.latLng(13.071081, 77.58025),
      mapStyle: 'height:300px;width:100%;',
      venues: {},
      popupVenue: false,
      venueSchema: {},
      isNew: false,
      thisVenue: {},
      nonEditables: ['id', 'total_events'],
    };
  },
  mounted: function()
  {
    const self = this;
    self.postWithPromise('info/table/fieldinfo/venues').then( function(x) {
      self.venueSchema = JSON.parse(x.data).data;
    });
    self.fetchVenues();
  },
  methods : {
    fetchVenues: function() 
    {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.postWithPromise('bmvadmin/venue/list')
        .then(function(x) {
          self.venues = JSON.parse(x.data).data;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 5000);
    },
    submitVenue: function() 
    {
      const self = this;
      const app = self.$f7;

      console.log('thisVenue', self.thisVenue);
    },
    addNewVenuePopup: function()
    {
      const self = this;
      self.resetSimple(self.thisVenue);
      self.nonEditables = ['total_events'];
      self.isNew = true;
      self.popupVenue = true;
    },
    updateVenuePopup: function(venue)
    {
      const self = this;
      self.thisVenue = venue;
      self.thisVenue.xy = null;
      if(self.thisVenue.latitude && self.thisVenue.longitude) {
        self.thisVenue.xy = L.latLng(self.thisVenue.latitude, self.thisVenue.longitude);
        console.log('pos: ', self.thisVenue.xy);
      }
      self.nonEditables = ['id', 'total_events'];
      self.isNew = false;
      self.popupVenue = true;
    },
    updateVenue: function() {
      const self = this;
      self.venueAction('update');
    },
    venueAction : function(what) {
      const self = this;

      self.promiseWithAuth('bmvadmin/venue/'+what, self.thisVenue)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Successfully "+what+"ed venue");
            self.fetchVenues();
            self.popupVenue = false;
          } 
          else 
            self.notify("Failed", "Failed to "+what+": "+res.msg);
        });
    },
    deleteVenue: function() 
    {
      const self = this;
      const app = self.$f7;
      app.dialog.confirm("Are you sure?", "Deleting venue", function(x) {
        self.postWithPromise('bmvadmin/venue/delete/'+self.thisVenue.id)
          .then( function(x) {
            let res = JSON.parse(x.data).data;
            if(res.success) {
              self.notify("Success", "Sucessfully deleted venue.");
              self.fetchVenues();
              self.popupVenue = false;
            }
            else
              self.notify("Failed", res.msg);
          });
      }, null);
    },
    addNewVenue: function() {
      const self = this;
      self.venueAction('add');
    },
    osmLink: function(venue) {
      const self = this;
      let link = 'https://www.openstreetmap.org/?';
      link += '&mlat='+venue.latitude+'&mlon='+venue.longitude;
      link += '#map=19/'+venue.latitude+'/'+venue.longitude;
      return link;
    },

  },
}
</script>
