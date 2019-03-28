<template>
   <f7-page>

      <f7-navbar>
         <f7-nav-left>
            <f7-link class="panel-open" open-panel="left" icon="fa fa-bars"></f7-link>
         </f7-nav-left>
         <div class="title">NCBS Hippo</div>
      </f7-navbar>

      <f7-block>
         <f7-list class="components-list" no-hairlines>

            <f7-list-item link="/booking/" title="Create Booking" panel-close>
               <f7-icon slot="media" icon="fa fa-clipboard fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/mybooking/" title="My Bookings" panel-close>
               <f7-icon slot="media" icon="fa fa-edit fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/events/" title="Events" panel-close>
               <f7-icon slot="media" icon="fa fa-calendar fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/transport/" title="Transport" panel-close>
               <f7-icon slot="media" icon="fa fa-bus fa-2x"></f7-icon>
            </f7-list-item>

            <f7-list-item link="/search/" title="Search" panel-close>
               <f7-icon slot="media" icon="fa fa-search fa-2x"></f7-icon>
            </f7-list-item>

         </f7-list>
      </f7-block>
   </f7-page>
</template>

<script>
export default {};
</script>
