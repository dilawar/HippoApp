<template>
  <f7-page>
    <f7-navbar title="Holidays" back-link="Back">
    </f7-navbar>

    <f7-block>
      <f7-block-title>List of holidays</f7-block-title>

      <f7-block-header class="text-color-black"> 

        <f7-icon icon="fas fa-flag"></f7-icon> On this page, you have usual
        holidays as well as special events which are not public holidays. On
        these events such as <tt>NCBS/InStem Annual Talks</tt>, AWS and public
        talks MUST NOT be scheduled. You should add them here as as mark <tt>IS
          PUBLIC HOLIDAY</tt> to <tt>NO</tt>.

      </f7-block-header>

      <!--
      <div class="timeline">
          <div class="timeline-item" v-for="holiday, key in holidays" :key="'h'+key">
            <div class="timeline-item-date">{{humanReadableDate(holiday.date, false)}}</div>
            <div class="timeline-item-divider"></div>
            <div class="timeline-item-content">
              <f7-list no-hairlines>
                <f7-list-item>
                  <div slot="after" v-if="holiday.is_public_holiday">Public Holiday</div>
                  <div slot="after" v-else>Local event</div>
                  <div slot="title">{{holiday.description}}</div>
                  <div slot="footer">{{holiday.comment}}</div>
                </f7-list-item> 
              </f7-list>
            </div>
          </div>
      </div>
      -->

      <f7-list media-list>
        <f7-list-item>
          <f7-button raised @click="addNewHoliday">Add a new holiday</f7-button>
        </f7-list-item>
        <f7-list-item v-for="holiday, key in holidays" :key="key"
            @click="updateHoliday(holiday)">
          <div slot="header">{{holiday.date | date }}</div>
          <div slot="after" v-if="holiday.is_public_holiday">Public Holiday</div>
          <div slot="after" v-else>Local event</div>
          <div slot="title">{{holiday.description}}</div>
          <div slot="footer">{{holiday.comment}}</div>
        </f7-list-item> 
      </f7-list>
    </f7-block>

    <f7-popup :opened="popupHoliday" @popup:close="popupHoliday = false">
      <f7-page>
        <f7-navbar :title="popupTitle">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <!-- New holidays -->
        <f7-block>
          <f7-list media-list no-hairlines>
            <f7-list-input type="date" 
              :value="thisHoliday.date" @input="thisHoliday.date = $event.target.value"
              label="Date" required validate>
            </f7-list-input>

            <f7-list-input type="text" 
              :value="thisHoliday.description"
              @input="thisHoliday.description=$event.target.value"
              label="Description" required>
            </f7-list-input>

            <f7-list-input label="Is public holiday?" 
              :value="thisHoliday.is_public_holiday"
              @input="thisHoliday.is_public_holiday=$event.target.value"
              type="select" required>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </f7-list-input>

            <f7-list-input label="Allow AWS/Thesis seminar?" 
              :defaultValue="thisHoliday.schedule_talk_or_aws"
              :value="thisHoliday.schedule_talk_or_aws"
              @input="thisHoliday.schedule_talk_or_aws=$event.target.value"
              type="select" required>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </f7-list-input>

            <f7-list-input label="Comment" 
              @change="thisHoliday.comment=$event.target.value"
              :value="thisHoliday.comment"
              type="textarea">
            </f7-list-input>

            <f7-list-item>
              <f7-row>
                <f7-col>
                  <f7-button color=red raised @click="deleteHoliday">Delete</f7-button>
                </f7-col>
                <f7-col>
                  <f7-button raised @click="submitHoliday">Submit</f7-button>
                </f7-col>
              </f7-row>
            </f7-list-item>
          </f7-list>
        </f7-block>
      </f7-page>
    </f7-popup>

  </f7-page>

</template>

<script>
export default {
  data() {
    const self = this;
    return {
      holidays: {},
      popupTitle: 'Add Holiday',
      popupHoliday: false,
      thisHoliday: {date:''
        , description:''
        , is_public_holiday:"YES"
        , schedule_talk_or_aws:"NO"
        , comment: ''},
    };
  },
  mounted: function()
  {
    const self = this;
    self.fetchHolidays();
    self.postWithPromise('admin/table/fieldinfo/holidays').then( function(x) {
      self.tableInfo = JSON.parse(x.data).data;
    });
  },
  methods : {
    fetchHolidays: function() 
    {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.postWithPromise('admin/holidays/list')
        .then(function(x) {
          self.holidays = JSON.parse(x.data).data;
          app.preloader.hide();
        });
      setTimeout(() => app.preloader.hide(), 5000);
    },
    submitHoliday: function() 
    {
      const self = this;
      const app = self.$f7;

      console.log(self.thisHoliday);
      self.promiseWithAuth('admin/holidays/submit', self.thisHoliday)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Successfully added holiday.");
            self.fetchHolidays();
            self.popupHoliday = false;
          }
        });
    },
    addNewHoliday: function()
    {
      const self = this;
      self.popupTitle = "Add a new holiday";
      self.popupHoliday = true;
    },
    updateHoliday: function(holiday)
    {
      const self = this;
      self.thisHoliday = holiday;
      self.popupTitle = "Update holiday";
      self.popupHoliday = true;
    },
    deleteHoliday: function() 
    {
      const self = this;
      self.promiseWithAuth('admin/holidays/delete', self.thisHoliday)
        .then( function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success) {
            self.notify("Success", "Sucessfully delete holiday");
            self.fetchHolidays();
            self.popupHoliday = false;
          }
        });
    },
  },
}
</script>
