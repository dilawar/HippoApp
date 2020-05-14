<template>
  <f7-page page-content ptr @ptr:refresh="refreshAWS">
    <f7-navbar title="My AWS" back-link="Back"></f7-navbar>

    <!-- Upcoming AWS -->
    <f7-block v-if="Object.keys(upcoming).length>0">
      <f7-block-title>Upcoming Annual Work Seminar</f7-block-title>
      <f7-card :key="key" v-for="(aws, key) in upcoming" no-shadow outline>
        <f7-card-header>
          {{aws.venue}} | {{humanReadableDate(aws.date)}} | 
          <f7-icon icon="fa fa-chir"> {{aws.chair}} </f7-icon>
          <f7-link :href='"/awsedit/"+aws.id+"/YES"'>Edit</f7-link>
        </f7-card-header>

        <f7-card-content>
          <div> <strong>{{aws.title}}</strong> </div>
          <span inset style="font-size:small" v-html="aws.abstract"></span>

          <f7-row style="font-size:x-small">
            <f7-col>Supervisor(s)/Host</f7-col>
            <f7-col>TCM</f7-col>
          </f7-row>
          <f7-row style="font-size:x-small">
            <f7-col>
              <f7-link v-for="i in [1,2]" external target="_system"
                :href="aws['supervisor_'+i]" :key="'sup'+i"> 
                <u>{{aws['supervisor_'+i]}}</u>&nbsp;&nbsp;
              </f7-link>
            </f7-col>
            <f7-col>
              <f7-link v-for="i in [1,2,3,4]" external taregt="_system"
                :href="aws['tcm_member_'+i]" :key="'tcm'+i">
                <u>{{aws['tcm_member_'+i]}}</u>&nbsp;&nbsp;
              </f7-link> 
            </f7-col>
          </f7-row>

        </f7-card-content>

        <f7-card-footer>
          <div v-if="aws.acknowledged === 'NO'">
            <f7-button small fill @click="acknowledgeAWS(aws.id)"> Acknowledge </f7-button>
          </div>
          <div v-else>
            You have acknowledged your upcoming AWS. Good job and thank you!
          </div>
        </f7-card-footer>
      </f7-card>
    </f7-block>

    <!-- Past AWS -->
    <f7-block>
      <f7-block-title>Annual Work Seminar</f7-block-title>
      <f7-list accodion-list no-hairlines media-list>
        <f7-list-item accordion-item 
          v-for="(aws, key) in awses" 
          :key="key" 
          :text="aws.title"
          :header="aws.venue+' | '+humanReadableDateTime(aws.date, aws.time)">
          <f7-accordion-content style="background-color:Ivory">
            <div> <strong>{{aws.title}}</strong> </div>
            <span inset style="font-size:small" v-html="aws.abstract"></span>
            <f7-row style="font-size:x-small">
              <f7-col>Supervisor(s)/Host</f7-col>
              <f7-col>TCM</f7-col>
            </f7-row>
            <f7-row style="font-size:x-small">
              <f7-col>
                <f7-link v-for="i in [1,2]" external target="_system"
                  :href="aws['supervisor_'+i]" :key="'sup'+i"> 
                  <u>{{aws['supervisor_'+i]}}</u>&nbsp;&nbsp;
                </f7-link>
              </f7-col>
              <f7-col>
                <f7-link v-for="i in [1,2,3,4]" external taregt="_system"
                  :href="aws['tcm_member_'+i]" :key="'tcm'+i">
                  <u>{{aws['tcm_member_'+i]}}</u>&nbsp;&nbsp;
                </f7-link> 
              </f7-col>
            </f7-row>
          </f7-accordion-content>
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
      awses: {},
      upcoming: {},
    };
  },
  mounted()
  {
    const self = this;
    self.fetchAws();
  },
  methods: {
    fetchAws: function() {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.postWithPromise('/me/aws/get').then( function(x) {
        let awses = JSON.parse(x.data).data;
        self.awses = awses.filter( x => self.dbDate(x.date) <= self.today()); 
        self.upcoming = awses.filter(x => self.dbDate(x.date) > self.today()); 
        app.preloader.hide();
      });
      setTimeout(() => app.preloader.hide(), 3000);
    },
    refreshAWS: function(e, done) {
      const self = this;
      const app = self.$f7;
      setTimeout(() => self.fetchAws(), 3000);
      done();
    },
    acknowledgeAWS: function(awsid) {
      const self = this;
      self.postWithPromise('/me/acknowledge_aws/'+awsid).then( function(x) {
        let res = JSON.parse(x.data);
        self.fetchAws();
      });
    },
  },
}
</script>
