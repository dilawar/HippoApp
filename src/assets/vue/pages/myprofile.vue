<template>
  <f7-page page-content ptr @ptr:refresh="fetchProfile">
    <f7-navbar title="Profile" back-link="Back"></f7-navbar>

    <f7-block-title medium>Profile is readonly.</f7-block-title>

    <f7-block inset>
      <f7-row>
        <f7-col width="100" 
                medium="50" 
                style="border-top:1px solid lightgray"
                v-for="(val, key) in profile"
                :key="key">
          <div>
            <small>
              <tt class="text-color-gray">{{formatKey(key)}}</tt> 
            </small>
            <strong>{{val}}</strong>
          </div>
        </f7-col>
      </f7-row>
      <f7-row>
        <f7-col>
          <img :src="'data:image/jpeg;base64, '+photo" width="120" height="auto" />
        </f7-col>
        <f7-col>
          <vue-dropzone id="dropzone1" 
                        ref="inventoryDZ" 
                        v-on:vdropzone-sending="onImageSending"
                        :options="dropzoneOptions">
          </vue-dropzone>
        </f7-col>
      </f7-row>
    </f7-block>

    <f7-block-footer>
      If you are not <tt>ELIGIBLE FOR AWS</tt>, please write to Academic office
      to include your name.
    </f7-block-footer>

  </f7-page>

</template>

<script>
export default {
  data() {
    const self = this;
    return {
      profile: {},
      photo: '',
      dropzoneOptions: {
        url: self.$store.state.api + '/upload/images',
        thumbnailWidth: 150,
        maxFilesize: 5,
        resizeWidth: 500,
        acceptedFiles: "image/*",
        addRemoveLinks: true,
        maxFiles: 1,
        autoProcessQueue: false, // do not upload automatically.
        headers: self.apiPostData(),
      },
    };
  },
  mounted()
  {
    const self = this;
    self.fetchProfile();
    self.fetchImage();
  },
  methods: {
    fetchProfile: function() {
      const self = this;
      const app = self.$f7;
      app.preloader.show();
      self.postWithPromise('me/profile')
        .then(function(x) {
          self.profile = JSON.parse(x.data).data;
          self.profile['jcs'] = Object.keys(self.profile.jcs).join(',');
          app.preloader.hide();
        });
      setTimeout(()=> app.preloader.hide(), 2000);
    },
    fetchImage: function() {
      const self = this;
      const app = self.$f7;

      app.preloader.show();
      self.postWithPromise('me/photo')
        .then(function(x) {
          var res = JSON.parse(x.data).data;
          self.photo = res.base64;
          app.preloader.hide();
        });
      setTimeout(()=> app.preloader.hide(), 2000);
    },
    onImageSending: function(img, xhr, formData) {
      const self = this;
      // Add external id to formData.
      console.log(formData);
      formData.append("inventory_id", self.inventory.id);
    },
  },
}
</script>
