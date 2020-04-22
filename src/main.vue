<template>
  <!-- App -->
  <f7-app :params="f7params">
    <f7-panel left cover>
       <f7-view name="left" url="/userpanel/" ></f7-view>
    </f7-panel>
    <f7-panel right cover @panel:open="fetchRoles()">
       <f7-view name="right" url="/adminpanel/" ></f7-view>
    </f7-panel>

    <f7-view main url="/" tab tab-active> 
      <f7-toolbar bottom tabber labels :inner="true" style="font-size:xx-small">

        <f7-link text="Back"
                 icon="fa fa-step-backward fa-2x"
                 back>
        </f7-link>

        <f7-link v-if="isUserAuthenticated()" 
                 text="People"
                 href="/search/" 
                 icon="fa fa-search fa-fw"
                 >
        </f7-link>

        <f7-link icon-only 
                 href="/map/"
                 text="Map"
                 icon="far fa-map fa-2x">
        </f7-link>

        <f7-link icon-only 
                 href="/canteen/"
                 text="Canteen"
                 icon="fas fa-utensils fa-2x">
        </f7-link>

        <f7-link icon-only  v-if="isUserAuthenticated()"
                 href="/whatwherewhen/"
                 text="Bookings"
                 icon="fa fa-calendar fa-2x">
        </f7-link>
        <f7-link icon-only v-else
                 href="/events/"
                 text="Events"
                 icon="far fa-calendar fa-2x">
        </f7-link>
      </f7-toolbar>

      <!-- INFO POPUP -->
      <f7-popup :opened="infoPopup" @popup:closed="infoPopup = false">
        <f7-page>
          <f7-navbar title="Info">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>

          <f7-block>
            <p><strong>Version</strong> {{version}}</p>

            <h3>Development</h3>
            This app is open-source. It is hosted on
            <f7-link external target="_system" href="https://github.com/dilawar/HippoApp">
              Github</f7-link> and is released under GNU GPLv3 License.

            <p><strong>Contribution:</strong> 
            <f7-link external target="_system" 
                              href="https://github.com/dilawar/HippoApp/blob/master/CONTRIBUTION.md"
                              >Read this.  </f7-link>
            </p>

            <h3>Credit</h3>

            Logo is designed by <f7-link external href="https://github.com/nunojesus">Nuno
              Jesus.</f7-link> Art work in splash screen is created by Sweety Meel.
            NCBS IT section provided server for backend services.
            </p>

            <small> <p> &copy; Dilawar Singh 
              (github: <f7-link external href="https://github.com/dilawar">@dilawar</f7-link>):
              2019-present. </p>
            </small>

            <h3>Disclaimer</h3>

            This is <strong>NOT</strong> an official NCBS app. 
            Developer(s) is/are not repsonsible for any discrepencies 
            which may arise over the course of time. You may please report 
            discrepency by writing to developers/maintainers.

          </f7-block>
        </f7-page>
      </f7-popup>

      <f7-popup :opened="canteenPopup" @popup:closed="canteenPopup = false">
        <f7-page>
          <f7-navbar title="Canteen Menu">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>
        </f7-page>
      </f7-popup>
    </f7-view>
  </f7-app>
</template>

<script>

// Import Routes...
import routes from './routes.js';
import moment from 'moment';

let theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}

export default {
  data() {
    return {
      f7params: {
        theme,
        routes,
        id: 'com.dilawar.hippo',
        isBottom: true,
        toolbar: {
          hideOnPageScroll: true,
        },
      },
      infoPopup: false,
      calendarPopup: false,
      canteenPopup: false,
      version: moment().format(),
      fetchedRoles: false,
    }
  },
  mounted: function() {
    const self = this;
    console.log('Roles are', self.roles);
  },
  methods: {
    fetchRoles: function() {
      const self = this;
      if(self.fetchedRoles)
        return;
      const app = self.$f7;
      console.log('Right panel open');
      app.preloader.show();
      self.postWithPromise('me/roles').then( function(x) {
        const res = JSON.parse(x.data).data.roles;
        self.$store.commit("ROLES", res.split(','));
        app.dialog.close();
        self.fetchedRoles = true;
        app.preloader.hide();
        return true;
      });
      setTimeout(() => app.preloader.hide(), 1000);
    },
  },
}
</script>
