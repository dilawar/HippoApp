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
                     icon="fa fa-backward fa-fw"
                     back
                     >
            </f7-link>

            <f7-link tab-link="#tab-dontknow" 
                     @click="infoPopup=true"
                     icon-only 
                     icon-color="blue"
                     icon="fa fa-info fa-fw"
                     >
            </f7-link>

            <f7-link tab-link="#tab-menu" 
                     icon-only 
                     icon-color="blue"
                     @click="calendarPopup=true"
                     icon="fa fa-calendar fa-fw"
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
                     <p>Version 1.0.10</p>

                     <h3>Development</h3>
                     Hosted on <a
                        href="https://github.com/dilawar/HippoApp">github</a>
                     and is licensed under MIT License.


                     <h3>Credit</h3>
                     <p> &copy; Dilawar Singh (github: @dilawar): 2019-present. </p>
                     <p> Hippo logo is designed by <a
                        href="https://github.com/nunojesus" target="_blank">Nuno
                        Jesus</a>
                     </p>
                     <p>Hosted on the server provided by NCBS IT section.</p>
                  </f7-block>
               </f7-page>
            </f7-popup>

            <f7-popup :opened="calendarPopup" @popup:closed="calendarPopup = false">
               <f7-page>
                  <f7-navbar title="Calendar">
                     <f7-nav-right>
                        <f7-link popup-close>Close</f7-link>
                     </f7-nav-right>
                  </f7-navbar>
                  <f7-block>
                     <div class="google-calendar">
<iframe src="https://calendar.google.com/calendar/embed?showTitle=0&amp;showPrint=0&amp;showCalendars=0&amp;showTz=0&amp;mode=AGENDA&amp;;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=d2jud2r7bsj0i820k0f6j702qo%40group.calendar.google.com&amp;color=%236B3304&amp;ctz=Asia%2FKolkata"></iframe>
                     </div>

                  </f7-block>
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
      }
   },
   mounted() {

   },
}
</script>
