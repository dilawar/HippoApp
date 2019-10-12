<template>
   <f7-page ptr ptr:refresh="refreshPage">
      <f7-navbar title="Annual Work Seminar" back-link="Back">
      </f7-navbar>

      <f7-block-title small>Upcoming Annual Work Seminars</f7-block-title>
      <f7-block>

        <f7-list media-list accordion-list
                 v-for="(AWSes, date) in upcomingAWS"
                 >
          <f7-block-title>{{date | date }}, {{venueInfo(AWSes[0].venue)}} </f7-block-title>
          <f7-list-item v-for="(aws, key) in AWSes" accordion-item>
            <div slot="title" v-html="aws.by"></div>
            <div slot="text" v-html="aws.title"></div>
            <div slot="footer">{{aws.supervisor_1}}</div>
            <div slot="footer">{{aws.supervisor_2}}</div>
            <f7-accordion-content>
              <div v-html="aws.title"></div>
              <div v-html="aws.description"></div>
              <f7-row>
                <f7-col>
                  <f7-button small fill color="red">Cancel</f7-button>
                </f7-col>
                <f7-col></f7-col>
                <f7-col>
                  <f7-button small fill>Edit</f7-button>
                </f7-col>
              </f7-row>
            </f7-accordion-content>
            <div slot="media" v-if="aws.acknowledged==='NO'">
              <f7-icon fa="thumbs-down fa-fw"></f7-icon>
            </div>
            <div slot="media" v-else>
              <f7-icon fa="check fa-fw"></f7-icon>
            </div>
          </f7-list-item>
        </f7-list>

      </f7-block>
   </f7-page>

</template>

<script>
  export default {
    data() {
      const self = this;
      return {
        thisAWS: [],
        upcomingAWS: [],
        popupTitle: 'Review request',
        allowInfinite: true,
      };
    },
    mounted()
    {
      const self = this;
      self.fetchUpcomingAws();
    },
    methods : {
      refreshData: function()
      {
        const self = this;
      },
      refreshPage: function()
      {
        const self = this;
      },
      fetchUpcomingAws: function() 
      {
        const self = this;
        const app = self.$f7;
        app.dialog.preloader();
        self.promiseWithAuth('/acadadmin/aws/upcoming')
          .then( function(json) {
            self.upcomingAWS = JSON.parse(json).data;
            app.dialog.close();
          });
      },
    },
  }
</script>
