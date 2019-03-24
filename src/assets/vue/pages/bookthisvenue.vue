<template>

  <f7-page @page:init="oninit">
    <f7-navbar title="Booking" back-link="Back"></f7-navbar>

    <f7-page-content>

    <f7-list no-hairlines-md>
      <f7-list-input label="Venue" type="text" :value="`${venueId}`" readonly>
        <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
      </f7-list-input>

      <f7-list-input
        label="Password"
        floating-label
        type="password"
        placeholder="Your password"
        clear-button
        >
        <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
      </f7-list-input>

      <f7-list-input
        label="E-mail"
        floating-label
        type="email"
        placeholder="Your e-mail"
        clear-button
        >
        <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
      </f7-list-input>

      <f7-list-input
        label="URL"
        floating-label
        type="url"
        placeholder="URL"
        clear-button
        >
        <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
      </f7-list-input>

      <f7-list-input
        label="Phone"
        floating-label
        type="tel"
        placeholder="Your phone number"
        clear-button
        >
        <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
      </f7-list-input>

      <f7-list-input
        label="Resizable"
        floating-label
        type="textarea"
        resizable
        placeholder="Bio"
        >
        <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
      </f7-list-input>
    </f7-list>

    </f7-page-content>

  </f7-page>

</template>

<script>

  export default {
    data() {
      return {
        venueId: '',
        date: '',
        startTime: '',
        endTime: '',
        duration: 60
      };
    },
    methods: {
      oninit: function() {
        console.log('Initializing booking values');
        const self = this;
        const params = self.$f7route.params;
        console.log(params);
        self.venueId = params.venueId;
        self.date = params.date;
        self.startTime = params.startTime;
        self.endTime = params.endTime;
      },
    },
  }; 

</script>
