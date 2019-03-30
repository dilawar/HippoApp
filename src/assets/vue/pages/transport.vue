<template>
<f7-page page-content ptr @ptr:refresh="fetchTransport" >
  <f7-navbar title="Transport" back-link="Back"></f7-navbar>

  <!-- Days related -->
  <f7-block>
     <f7-row noGap>
        <f7-col v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d">
           <f7-button :key="d"
                :fill="d==today?true:false" 
                @click="changeDay(d)"
                > 
                <font><small>{{d}}</small></font>
           </f7-button>
        </f7-col>
     </f7-row>


  <f7-block-title> 
     <div style="align:right">
        <f7-icon icon="fa fa-map-marker fa-2x"> </f7-icon> 
        <font color="blue">Route: {{pickup}} to {{drop}}</font>
     </div>
  </f7-block-title>

  <f7-list media-list no-hairlines>
     <f7-list-item v-for="(val,item) in currentTransportActive"
                   :key="'available'+item"
                   :title="val.trip_start_time">
        <f7-icon v-if="val.vehicle.toLowerCase()=='shuttle'" 
           slot="media" icon="fa fa-bus fa-2x"></f7-icon>
        <f7-icon v-else 
           slot="media" icon="fa fa-bug fa-2x"></f7-icon>
     </f7-list-item>
     <f7-list-item v-for="(val,item) in currentTransportGone"
                   :footer="val.trip_start_time"
                   :key="'gone'+item">
          <f7-icon v-if="val.vehicle.toLowerCase()=='shuttle'" slot="media" icon="fa fa-bus fa-1x"></f7-icon>
          <f7-icon v-else slot="media" icon="fa fa-bug fa-1x"></f7-icon>
     </f7-list-item>

  </f7-list>
  </f7-block>

  <!-- Floating button for picking routes. -->
  <f7-fab position="right-bottom" slot="fixed" color="green">
     <f7-icon icon="fa fa-map-marker fa-2x"></f7-icon>
     <f7-icon ios="f7:close" aurora="f7:close" md="material:close"></f7-icon>
     <f7-fab-buttons position="top">
        <f7-fab-button label="NCBS to Mandara" 
                       fab-close
                       @click="routeFromTo('NCBS', 'Mandara')"
                       >n2m</f7-fab-button>
        <f7-fab-button 
                       label="Mandara to NCBS"
                       fab-close
                       @click="routeFromTo('Mandara', 'NCBS')"
                       >m2n</f7-fab-button>
        <f7-fab-button 
                       fab-close
                       @click="routeFromTo('NCBS', 'IISc')"
                       label="NCBS to IISc">n2i</f7-fab-button>
        <f7-fab-button 
                       fab-close
                       @click="routeFromTo('IISc', 'NCBS')"
                       label="IISc to NCBS">i2n</f7-fab-button>
     </f7-fab-buttons>
  </f7-fab>

</f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
   data() {
      const ls = this.$localStorage;
      return {
         transport: [],
         pickup: ls.get('lastPickup') || 'NCBS',
         drop : ls.get('lastDrop') || 'Mandara',
         currentTransport: [],
         currentTransportGone: [],
         currentTransportActive: [],
         today: moment().format('ddd'),
         date: moment().format('MMM DD (ddd)'),
         nowTime: moment().format('HH:mm'),
      };
   },
   mounted: function() {
      const self = this;
      self.routeFromTo(self.pickup, self.drop)
   },
   methods: { 
      routeFromTo: function(pickup, drop)
      {
         const self = this;
         self.pickup = pickup;
         self.drop = drop;
         self.transport = JSON.parse(self.$localStorage.get('transport')).data;
         self.currentTransport = self.transport.filter(x => 
            x.pickup_point.toLowerCase() == pickup.toLowerCase()
            && x.drop_point.toLowerCase() == drop.toLowerCase()
         );
         self.currentTransportGone = self.currentTransport.filter(x=>self.nowTime >= x.trip_start_time);
         self.currentTransportActive = self.currentTransport.filter(x=>self.nowTime < x.trip_start_time);
         self.$localStorage.set('lastPickup', self.pickup);
         self.$localStorage.set('lastDrop', self.drop);
      },
      changeDay: function(data) {
         const self = this;
         self.today = data;
         this.fetchTransport();
      },
      fetchTransport: function(event, done) 
      {
         const self         = this;
         const app          = self.$f7;
         var link = self.$store.state.api+'/transport/'+self.today;
         console.log('Link is', link);
         app.request.post(link, this.apiPostData(),
            function(json) {
               self.$localStorage.set('transport', json);
            });
         done();
      },
   },
};

</script>
