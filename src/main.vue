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

         <f7-toolbar tabber position="bottom">
            <f7-link tab-link="#tab-back" 
                     icon-only 
                     icon-color="blue"
                     icon="fa fa-backward fa-fw"
                     back
                     >
            </f7-link>
               <f7-link tab-link="#tab-dontknow" 
                        icon-only 
                        icon-color="blue"
                        icon="fa fa-info fa-fw"
                        >
               </f7-link>
                  <f7-link tab-link="#tab-menu" 
                           icon-only 
                           icon-color="blue"
                           icon="fa fa-ellipsis-v fa-fw"
                           >
                  </f7-link>
         </f7-toolbar>

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
      }
   },
}
</script>
