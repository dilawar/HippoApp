<template>
  <f7-page page-content>
    <f7-navbar title="Transport" back-link="Back"></f7-navbar>

  <!-- Select days buttons. -->
  <f7-block>
  <f7-row>
    <f7-col noGap v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="'col'+d">
      <f7-button small :key="d" :fill="(d==thisDay)?true:false" @click="changeDay(d)">
        {{d}}
      </f7-button>
    </f7-col>
  </f7-row>
  <f7-row>
    <f7-col noGap 
            width="33" 
            medium="15" 
            v-for="(route, key) in transport.routes" 
            :key="key">
      <f7-button small @click="selectRoute(route)"
                 :fill="isSameRoute(thisRoute,route)">
        {{route.pickup_point}}→{{route.drop_point}}
      </f7-button>
    </f7-col>
  </f7-row>
  </f7-block>

  <f7-block inset>
    <f7-list media-list>
      <f7-list-item v-for="(t, key) in theseEntries" 
                    @click="editEntry(t)"
                    :key="key">
        <f7-icon slot="media" :icon="transportIcon(t.vehicle)">
        </f7-icon>
        <div slot="title">
          {{str2Moment(t.trip_start_time, 'HH:mm:ss').format('hh:mm A')}}
        </div>
        <div slot="footer">{{t.comment}}</div>
      </f7-list-item>
    </f7-list>
  </f7-block>

  <!-- POPUP  -->
  <f7-popup :opened="popupEdit" @popup:close="popupEdit = false">
    <f7-page>
      <f7-navbar title="Edit Entry">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
  
      <f7-block>

        <f7-list no-hairlines>

          <f7-list-input label="Start time"
                         inline-label
                         type="time"
                         :value="thisEntry.trip_start_time"
                         @change="thisEntry.trip_start_time=$event.target.input">
          </f7-list-input>

          <f7-list-input label="End time"
                         inline-label
                         type="time"
                         :value="thisEntry.trip_end_time"
                         @change="thisEntry.trip_end_time=$event.target.input">
          </f7-list-input>

          <f7-list-input label="Comment"
                         inline-label
                         type="textarea"
                         :value="thisEntry.comment"
                         @change="thisEntry.comment=$event.target.input">
          </f7-list-input>

        </f7-list>

        <f7-row>
          <f7-col>
            <f7-button popup-close raised outline
                       @click="onClick()"
                       > DO SOMETHING
            </f7-button>
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-page>
  </f7-popup>

</f7-page>

</template>

<script>
import moment from 'moment'

export default {
  data() {
    const self = this;
    return {
      thisRoute: self.loadStore('thisRoute') || { 
        'pickup_point':'NCBS', 'drop_point': 'Mandara'},
      nowTime: moment(),
      thisDay: moment().format('ddd'),
      transport: {'timetable':{}, 'routes': self.thisRoute},
      popupEdit: false,
      // This goes onto a poup showing route map.
      thisRouteMap: '<p>No route found.</p>',
      thisEntry: {},
      theseEntries: {},
    };
  },
  mounted: function() {
    const self = this;
    self.fetchTransport();
  },
  methods: { 
    isUpcomingTrip: function(t) {
      const self = this;
      console.log('x', t.day, self.thisDay );
      if(t.day.toLowerCase() === self.thisDay.toLowerCase())
        if(self.str2Moment(t.trip_start_time, 'HH:mm:ss') >= self.str2Moment())
          return true;
      if(self.str2Moment(t.day,"ddd") > self.str2Moment(self.thisDay,"ddd"))
        return true;
      return false;
    },
    transportIcon: function(vehicle) {
      const self = this;
      var icon = 'fa ';
      vehicle = vehicle.toLowerCase();
      if(vehicle == 'shuttle')
        icon += ' fa-bus'
      else if(vehicle == 'buggy')
        icon += ' fa-bug';
      else
        icon += ' fa-bus';
      icon += ' fa-2x';
      return icon;
    },
    changeDay: function(data) {
      const self = this;
      self.thisDay = data;
      self.fetchTransport();
    },
    fetchTransport: function() 
    {
      const self         = this;
      const app          = self.$f7;
      var endpoint = self.thisDay;
      if(self.thisRoute.pickup_point)
        endpoint += '/' + self.thisRoute.pickup_point;
      if(self.thisRoute.drop_point)
        endpoint +=  '/' + self.thisRoute.drop_point;

      self.postWithPromise('/transport/'+endpoint)
        .then( function(x) {
          var res = JSON.parse(x.data);
          self.transport = res.data;
          self.getTimetable();
        });
    },
    getTimetable: function() {
      const self = this;
      if( ! self.transport.timetable)
        return {};

      var t = self.transport.timetable[self.thisDay.toLowerCase()];
      var pickup = self.thisRoute.pickup_point.toLowerCase();
      var drop = self.thisRoute.drop_point.toLowerCase();
      t = t[pickup];
      t = t[drop];
      self.theseEntries = Object.values(t);
    },
    editEntry: function(t) {
      const self = this;
      self.thisEntry = JSON.parse(JSON.stringify(t));
      self.popupEdit = true;
    },
    routeMap: function(url) {
      const self = this;
      self.thisRouteMap = url;
      self.openPopup = true;
    },
    showRoute: function() {
      console.log( "Show me this route" );
    },
    selectRoute: function(route) {
      const self = this;
      self.thisRoute = route;
      console.log('selected route: ', route);
      self.fetchTransport();
    },
    isSameRoute: function(a, b) {
      if(a.pickup_point == b.pickup_point && a.drop_point == b.drop_point)
        return true;
      return false;
    },
  },
};

</script>
