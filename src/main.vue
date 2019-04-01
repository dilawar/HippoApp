<template>
  <!-- App -->
  <f7-app :params="f7params">
    <f7-statusbar></f7-statusbar>

    <f7-panel left cover>
       <f7-view name="left" url="/userpanel/" ></f7-view>
    </f7-panel>

    <f7-view main url="/" tab tab-active></f7-view>

  </f7-app>
</template>
<script>

// Import Routes...
import routes from './routes.js'

let theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}

document.addEventListener( 'deviceready', onDeviceReady, false);
function onDeviceReady()
{
   document.addEventListener('backbutton', onBackButton, false);
}
function onBackButton( )
{
   history.go(-1);
   navigator.app.backHistory();
}

export default {
   data() {
      return {
         f7params: {
            theme,
            routes,
            id: 'com.dilawar.hippo',
         },
      }
   },
}
</script>
