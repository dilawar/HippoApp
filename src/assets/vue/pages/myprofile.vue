<template>
  <f7-page page-content ptr @ptr:refresh="fetchProfile">
    <f7-navbar title="Profile" back-link="Back"></f7-navbar>

    <f7-block inset>
      <div v-if="profile.eligible_for_aws==='NO'"
           style="background-color:lightyellow;padding:4px">
        You are not <tt>ELIGIBLE FOR AWS</tt>. If this is a mistake, please write 
        to Academic office to include your name.
      </div>

      <f7-block-title small>Profile</f7-block-title>
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
        <vue-dropzone ref="profilePic"  id="profile-pic-id"
                      @vdropzone-success="(file,res)=>fetchImage()"
                      @vdropzone-files-added="(file)=>uploadFiles()"
                      :options="dropzoneOptions">
        </vue-dropzone>
      </f7-row>

    </f7-block>
  </f7-page>

</template>

<script>
export default {
  data() {
    const self = this;
    return {
      profile: {},
      dropzoneOptions: {
        url: self.$store.state.api + '/upload/image/profile',
        maxFilesize: 5,
        acceptedFiles: "image/*",
        addRemoveLinks: true,
        maxFiles: 1,
        autoProcessQueue: false, // don't upload automatically.
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
      self.$refs.profilePic.removeAllFiles();
      app.preloader.show();
      self.postWithPromise('me/photo')
        .then(function(x) {
          var res = JSON.parse(x.data).data;
          var byteString = atob(res.base64);
          var content = new Array();
          for (var i = 0; i < byteString.length; i++) {
            content[i] = byteString.charCodeAt(i)
          }
          var img = new Blob([new Uint8Array(content)], {type: 'image/jpeg'});
          // Remove all files.
          self.$refs.profilePic.addFile(img);
          app.preloader.hide();
        });
      setTimeout(()=> app.preloader.hide(), 2000);
    },
    uploadFiles: function() 
    {
      const self = this;
      const app = self.$f7;
      self.$refs.profilePic.processQueue();
    },
  },
}
</script>
