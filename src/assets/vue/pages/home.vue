<template>
    <f7-page>
        <f7-navbar>
            <f7-nav-left>
                <f7-link class="panel-open" open-panel="left" icon="fa fa-bars"></f7-link>
            </f7-nav-left>
            <div class="title">Hippo</div>
            <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".searchbar-components" 
                  icon="fa fa-search"></f7-link>
            </f7-nav-right>
            <f7-searchbar class="searchbar-components" search-container=".components-list" 
              search-in="a" expandable></f7-searchbar>
        </f7-navbar>

        <f7-list class="components-list searchbar-found">

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

        <f7-list class="searchbar-not-found">
            <f7-list-item title="Nothing found"></f7-list-item>
        </f7-list>

        <!-- <f7-block-title class="searchbar-hide-on-search">Themes</f7-block-title> -->
<!--  -->
        <!-- <f7-list class="searchbar-hide-on-search"> -->
            <!-- <f7-list-item title="iOS Theme" external link="./index.html?theme=ios"></f7-list-item> -->
            <!-- <f7-list-item title="Material (MD) Theme" external link="./index.html?theme=md"></f7-list-item> -->
            <!-- <f7-list-item title="Color Themes" link="/color-themes/"></f7-list-item> -->
            <!-- <f7-list-item title="Github" external link="https://github.com/dilawar"></f7-list-item> -->
        <!-- </f7-list> -->

    </f7-page>
</template>

<script>
export default {};
</script>
