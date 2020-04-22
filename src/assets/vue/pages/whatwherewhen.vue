<template>
  <f7-page page-content 
           ptr @ptr:refresh="refreshFetchEvents"
           @page:beforein="pageBeforeIn"
           @page:afterin="pageAfterIn"
           infinite
           :infinite-preloader="showPreloader" 
           @infinite="loadMore"
    >
  <f7-navbar title="What Where When" back-link="Back">
    <!-- Search bar -->
    <f7-subnavbar :inner="false">
      <f7-searchbar
        search-container=".search-list"
        search-in=".item-title, .item-header, .item-footer, .item-after"
        :disable-button="!$theme.aurora"
        ></f7-searchbar>
    </f7-subnavbar>
  </f7-navbar>

  <!-- Filter by venue should be a floating button. -->
  <f7-fab position="right-top" slot="fixed" color="green" text="">
    <f7-icon icon="fa fa-filter fa-2x"></f7-icon>
    <f7-icon icon="fa fa-close fa-2x"></f7-icon>
    <f7-fab-buttons position="bottom">
      <f7-fab-button @click="actionVenueGridOpen=true">
        <small>Venue</small>
      </f7-fab-button>
      <f7-fab-button @click="actionTypeGridOpen=true">
        <small>Type</small>
      </f7-fab-button>
    </f7-fab-buttons>
  </f7-fab>

  <!-- Grid -->
  <f7-actions :grid="true"
              :opened="actionVenueGridOpen" 
              @actions:closed="actionVenueGridOpen=false">
     <f7-actions-group>
        <f7-actions-button v-for="v in venues" 
                           :key="v" @click="filterTimeline(v, '')">
           <span>{{v}}</span>
        </f7-actions-button>
     </f7-actions-group>
  </f7-actions>

  <!-- Venue grid -->
  <f7-actions :grid="true" 
              :opened="actionTypeGridOpen" 
              @actions:closed="actionTypeGridOpen=false">
     <f7-actions-group>
       <f7-actions-button v-for="t in eventTypes" 
                          :key="t" 
                          @click="filterTimeline('', t)">
         <span>{{t}}</span>
       </f7-actions-button>
     </f7-actions-group>
  </f7-actions>

  <f7-block-header>
    <f7-link external target="_system" :href="calendarLink"> 
      Google Calendar
    </f7-link>
  </f7-block-header>

  <f7-list accordion-list media-list no-hairlines class="search-list">
    <f7-list-item :accordion-item="item.description.length>80" v-for="(item, key) in items" :key="key">
           <div slot="header" v-html="genWhereline(item)"></div>
           <div slot="text" class="text-color-black">
             <strong>{{item.title}}</strong>
             <small>by {{item.created_by}}</small>
           </div>
           <div slot="title" v-if="item.vc_url">
             <f7-link external target="_system" :href="item.vc_url">
               {{item.vc_url}}
             </f7-link>
           </div>
           <div slot="footer" v-html="genTimeline(item)"></div>
           <f7-accordion-content style="background-color:Ivory">
             <f7-block>
               <div v-html="item.title+'<br />'+item.description"></div>
             </f7-block>
           </f7-accordion-content>
    </f7-list-item>
  </f7-list>
  </f7-page>
</template>

<script>
import moment from 'moment';

export default {
  data() {
    const self = this;
    return {
      allowInfinite: true,
      showPreloader: false,
      actionVenueGridOpen: false,
      actionTypeGridOpen: false,
      eventTypes: [],
      venues: [],
      selectedVenue: 'ALL',
      selectedClass: 'ALL',
      events: self.loadStore('events'),
      venueEvents: [],
      items: [],
      calendarLink: '',
    }
  },
  mounted: function() {
    const self = this;
    self.initVenuesAndClasses();
    // Fetch calendar link.
    self.promiseWithAuth('config/calendar_url')
      .then( function(x) {
        self.calendarLink = JSON.parse(x.data).data.value;
      });
    self.fetchEvents();
  },
  methods: { 
    initVenuesAndClasses: function( ) {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.eventTypes = [... new Set( self.events.map(x=>x.class))];
      self.eventTypes.push('ALL');
      self.venues = [... new Set(self.events.map(x=>x.venue))];
      self.venues.push('ALL');
      app.preloader.hide();
    },
    fetchEvents: function( ) {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.postWithPromise('/events/latest/50').then(
        function(x) {
          self.events = JSON.parse(x.data).data;
          self.initVenuesAndClasses();
          self.assignEvents(self.events);
          self.saveStore('events', self.events);
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 10000);
    },
    refreshFetchEvents: function(event, done) 
    {
      const self = this;
      setTimeout( () => {
        self.fetchEvents();
        done();
      });
    },
    eventToTimelinePoint: function(key, ev) 
    {
      const self = this;
      var color = self.stringToColour(ev.class)
      let status = (ev.status == 'PENDING')?' (Pending Approval)':'';
      return { id:key
        , class: ev.class
        , color : color
        , data: ev
        , group: ev.venue
        , created_by: ev.created_by
        , tag: self.toNow(ev.date, ev.start_time) + '<br /> ' 
          + self.str2Moment(ev.date, 'YYYY-MM-DD').format('MMM DD')+'<br/>'
          + self.str2Moment(ev.start_time,'HH:mm:ss').format('HH:mm')+'-' 
          + self.str2Moment(ev.end_time,'HH:mm:ss').format('HH:mm')
        , htmlMode: true
        , content:  `<span style="font-size:12px;color:green;margin-left:0rem">${ev.venue}</span> `+
        `<span style="font-size:10px;color:gray;">${ev.class} ${status}</span>`+
        `<br/><span style="color:black;margin:0rem">${ev.title} </span>` +
        `<br/><span style="font-size:9px;color:green;margin:0rem">${ev.created_by}</span>`

      };
    },
    assignEvents: async function(events) 
    {
      const self = this;
      self.items = events;
    },
    loadMore: function() 
    {
      const self = this;
      const app = this.$f7;

      if(!self.allowInfinite) 
        return;
      self.allowInfinite = false;

      if(self.events.length >= 500) 
      {
        self.preloader = false;
        let alert = app.notification.create({
          title: 'Please stop!',
          text: "I won't fetch more items."
        }).open();
        setTimeout(()=> alert.close(), 500);
        return;
      }

      // now fetch 20 more starting from offset.
      self.promiseWithAuth('events/latest/20'+'/'+self.events.length.toString())
        .then( function(x) {
          const res = JSON.parse(x.data);
          if(res.status=='ok')
          {
            self.events.push(...res.data);
            self.filterTimeline(self.selectedVenue, self.selectedClass);
            self.$localStorage.set('events', JSON.stringify(self.events));
          }
        });
      setTimeout(() => {self.allowInfinite = true; }, 200);
      self.eventTypes = [... new Set( self.events.map(x=>x.class))];
      self.eventTypes.push('ALL');
      self.venues = [... new Set(self.events.map(x=>x.venue))];
      self.venues.push('ALL');
      return;
    },
    filterTimeline: async function(venue, cls) 
    {
      const self = this;
      const app = self.$f7;
      app.preloader.show();

      // Preserve the previous venue, cls because they will be reset on
      // ptr, refresh or infinite events.
      self.selectedVenue = venue;
      self.selectedClass = cls;
      console.log( 'Filter using '+venue+ ' and '+cls);
      var filteredEvents = self.events.filter(x => {
        if(venue)
          return (venue=='ALL' || x.venue==self.selectedVenue)
        else if(cls)
          return (cls=='ALL' || x.class==self.selectedClass)
        else
          return true;
      });
      await self.assignEvents(filteredEvents);
      app.preloader.hide();
    },
    genTimeline: function( ev ) 
    {
      const self = this;
      const app = self.$f7;
      let whereWhere = '';
      whereWhere += moment(ev.date, 'YYYY-MM-DD').format('ddd, MMM DD') +
        ', ' + moment(ev.start_time, 'HH:mm:ss').format('h:mm A') +
        ' to ' + moment(ev.end_time, 'HH:mm:ss').format('h:mm A')
      return whereWhere;
    },
    genWhereline: function(ev) 
    {
      const self = this;
      let content =  `<span style="color:green">${ev.venue}</span> `+
        `<span style="color:gray;">${ev.class} ${status}</span>`;

      let fromNow = self.str2Moment(ev.date + ' ' + ev.start_time
        , 'YYYY-MM-DD HH:mm:ss').fromNow();
      content = '<span style="float:right">'+fromNow+'</span>' + content;
      return content;
    },
  },
}; 

</script>
