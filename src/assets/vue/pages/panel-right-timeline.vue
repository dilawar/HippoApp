<template>
   <f7-panel right cover>
      <f7-view>
         <f7-block>
            <light-timeline v-model='items' :items='items'>
            </light-timeline>
         </f7-block>
      </f7-view>
   </f7-panel>
</template>

<script>
   export default {
      data() {
         const self = this;
         return {
            items: JSON.parse(self.$localStorage.get('rightpanel.timeline'), '[]')
         }
      },
      mounted() {
         console.log( 'right panel is mounted' );
      },
   }
</script>
