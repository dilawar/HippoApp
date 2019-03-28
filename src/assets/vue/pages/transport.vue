<template>
<f7-page ptr @ptr:refresh="fetchTransport" @page:init="fetchTransport"
   @page:refresh="fetchTransport">
  <f7-navbar title="Transport" back-link="Back"></f7-navbar>
  <!--  Show venues as grid or list. -->
  <f7-page-content>
     <f7-block>
        <f7-row noGap>
           <f7-col v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']"
                   :key="d"
              >
              <f7-button raised 
                         :key="d"
                         :fill="d==today?true:false" 
                         @click="changeDay(d)"> {{d}} </f7-button>
           </f7-col>
        </f7-row>
     </f7-block>

     <f7-block>
        <f7-row>
           <f7-col>
              <f7-button raised 
                  @click="routeFromTo('Mandara','NCBS')"
                  >Mandara → NCBS</f7-button>
           </f7-col>
           <f7-col>
              <f7-button raised  
                 @click="routeFromTo('NCBS', 'Mandara')"
                 >NCBS → Mandara</f7-button>
           </f7-col>
        </f7-row>
        <f7-row>
           <f7-col>
              <f7-button raised  
                         @click="routeFromTo('IISc', 'NCBS')"
                 >IISc → NCBS</f7-button>
           </f7-col>
           <f7-col>
              <f7-button raised  @click="routeFromTo('NCBS', 'IISc')" 
                 >NCBS → IISc</f7-button>
           </f7-col>
        </f7-row>
     </f7-block>

     <f7-block-title>{{today}} | {{currentRoute}} 
        <br />
        <small>These timings are not be throughly verified!</small>
     </f7-block-title>

        <f7-list media-list no-hairlines>
           <f7-list-item v-for="(val,item) in currentTransportGone"
                         :footer="val.trip_start_time"
                         :key="item"
                         >
              <f7-icon v-if="val.vehicle.toLowerCase()=='shuttle'" slot="media" icon="fa fa-bus fa-1x"></f7-icon>
              <f7-icon v-else slot="media" icon="fa fa-bug fa-1x"></f7-icon>
           </f7-list-item>

           <f7-list-item v-for="(val,item) in currentTransportActive"
                         :key="item"
                         :title="val.trip_start_time">
              <f7-icon v-if="val.vehicle.toLowerCase()=='shuttle'" slot="media" icon="fa fa-bus fa-2x"></f7-icon>
              <f7-icon v-else slot="media" icon="fa fa-bug fa-2x"></f7-icon>
           </f7-list-item>
        </f7-list>
     </f7-block>

  </f7-page-content>
</f7-page>
</template>

<script>
import moment from 'moment';
moment.defaultFormat = 'YYYY-MM-DD';

export default {
   data() {
      return {
         transport: [],
         currentRoute: '',
         currentTransport: [],
         currentTransportGone: [],
         currentTransportActive: [],
         today: moment().format('ddd'),
         date: moment().format('MMM DD (ddd)'),
         nowTime: moment().format('HH:mm'),
      };
   },
   methods: { 
      routeFromTo: function(pickup, drop)
      {
         const self = this;
         self.currentRoute = pickup + ' to ' + drop;
         self.transport = JSON.parse(self.$localStorage.get('transport')).data;
         self.currentTransport = self.transport.filter(x => 
            x.pickup_point.toLowerCase() == pickup.toLowerCase()
            && x.drop_point.toLowerCase() == drop.toLowerCase()
         );
         self.currentTransportGone = self.currentTransport.filter(x=>self.nowTime >= x.trip_start_time);
         self.currentTransportActive = self.currentTransport.filter(x=>self.nowTime < x.trip_start_time);
      },
      changeDay: function(data) {
         const self = this;
         self.today = data;
         this.fetchTransport();
      
      },
      fetchTransport: function( ) 
      {
         const self         = this;
         const app          = self.$f7;
         var link = self.$store.state.api+'/transport/'+self.today;
         console.log('Link is', link);
         app.request.post(link, this.apiPostData(),
            function(json) {
               self.$localStorage.set('transport', json);
            });
      },
   },
};

</script>
