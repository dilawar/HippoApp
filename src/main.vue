<template>
  <!-- App -->
  <f7-app :params="f7params">
    <f7-statusbar></f7-statusbar>
    <f7-view url="/" main tab tab-active></f7-view>
    <f7-panel left cover> 
       <f7-view url="/userpanel/" ></f7-view>
    </f7-panel>
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
         },
         notification: {
            title: 'NCBS Hippo',
            closeTimeout: 3000,
            closeButton: true,
         },
      }
   }
}
</script>
