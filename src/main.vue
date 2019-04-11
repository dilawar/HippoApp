<template>
  <!-- App -->
  <f7-app :params="f7params">
    <f7-statusbar></f7-statusbar>
    <f7-panel left cover>
       <f7-view name="left" url="/userpanel/" ></f7-view>
    </f7-panel>


    <f7-view main url="/" tab tab-active>
       <!--
          Enable it if we need it to put toolbar on the bottom page. The
          backbutton has started working fine again.
         -->

         <f7-toolbar 
                     inner
                     no-hairline
                     position="bottom"
                     >

            <f7-link tab-link="#tab-back" 
                     icon-only 
                     icon-color="blue"
                     icon="fa fa-backward fa-2x"
                     back
                     >
            </f7-link>

            <f7-link tab-link="#tab-dontknow" 
                     @click="infoPopup=true"
                     icon-only 
                     icon-color="blue"
                     icon="fa fa-info fa-2x"
                     >
            </f7-link>

            <f7-link icon-only 
                     icon-color="blue"
                     href="/map/"
                     tooltip="Campus Map"
                     icon="fa fa-map fa-2x"
                     >
            </f7-link>

            <f7-link icon-only 
                     icon-color="blue"
                     href="/canteen/"
                     tooltip="Canteen"
                     icon="fa fa-cutlery fa-2x"
                     >
            </f7-link>

            <f7-link icon-only 
                     icon-color="blue"
                     href="/events/"
                     tooltip="Public calendar"
                     icon="fa fa-calendar fa-2x"
                     >
            </f7-link>

         </f7-toolbar>

            <f7-popup :opened="infoPopup" @popup:closed="infoPopup = false">
               <f7-page>
                  <f7-navbar title="Info">
                     <f7-nav-right>
                        <f7-link popup-close>Close</f7-link>
                     </f7-nav-right>
                  </f7-navbar>
                  <f7-block>
                     <p><strong>Version</strong> 1.2, <tt>build</tt>20190410</p>

                     <h3>Development</h3>
                     Hosted on <f7-link external target="system" href="https://github.com/dilawar/HippoApp"
                        >Github</f7-link> and is released under MIT License.

                     <p> <strong>Contribution:</strong> <f7-link extrernal target="system"
                    href="https://github.com/dilawar/HippoApp/blob/master/CONTRIBUTION.md">Read this.
                     </f7-link></p>


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
import routes from './routes.js'

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
         },
         infoPopup: false,
         calendarPopup: false,
         canteenPopup: false,
      }
   },
   mounted() {

   },
}
</script>
