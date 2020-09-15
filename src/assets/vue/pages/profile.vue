<template>
  <f7-page page-content ptr @ptr:refresh="fetchProfile">
    <f7-navbar title="Profile" back-link="Back"></f7-navbar>

    <f7-block inset>
      <f7-block-header>
        <div v-if="profile.eligible_for_aws==='NO'">
          This profile is not <tt>ELIGIBLE FOR AWS</tt>. If this is a mistake, please
          write to Academic office.
        </div>
        <div>
          <img data-src="thisProfile.photo" class="lazy">
        </div>
      </f7-block-header>
      <f7-row>
        <f7-col width="100" 
                medium="50" 
                style="border-top:1px dotted lightgray"
                v-for="(val, key) in profile"
                :key="key">
          <div>
            <small>
              <tt class="text-color-gray">{{formatKey(key)}}</tt> 
            </small>
            <strong>{{val}}</strong>
          </div>
        </f7-col>
        <f7-col></f7-col>
      </f7-row>
    </f7-block>

    <f7-block>
      <f7-block-title medium>Followings are editable.</f7-block-title>

      <f7-row>
        <f7-col width="70" medium="30">
          <vue-dropzone ref="profilePic"  
            id="profile-pic-id"
            @vdropzone-success="(file,res)=>fetchImage()"
            @vdropzone-files-added="(file)=>uploadFiles()"
            :options="dropzoneOptions">
          </vue-dropzone>
        </f7-col>
      </f7-row>


      <f7-list media-list no-hairlines inline-labels>
        <f7-list-input v-for="(val, key, index) in editables" 
          :key="key"
          :label="formatKey(key)"
          :type="val[0]"
          @change="profile[key]=$event.target.value"
          :value="profile[key]">
          <option v-for="(v,k) in val[0]==='select'?val[1]:[]" :key="k" :value="v">
            {{v}}
          </option>
        </f7-list-input>

        <!-- Roles -->
        <f7-list-input label="Roles" :input="false">
          <f7-row slot="input">
            <f7-checkbox v-for="rl, k in roles.allroles" 
              :value="rl" :name="rl"
              :checked="roles.roles.includes(rl)"
              @change="updateRoles($event.target.value)"
              :key="k" class="col-50 medium-30">
              <small> {{rl}} </small>
            </f7-checkbox>
          </f7-row>
        </f7-list-input>
        <f7-list-item>
          <f7-button raised fill @click="updateProfile()" slot="after">
            Update Profile
          </f7-button>
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
      login : self.$f7route.params.login.trim(),
      profile: {},
      editables: [],
      isAdmin: false,
      roles: {roles:['USER'], allroles:[]},
      allroles: [],
      dropzoneOptions: {
        url: self.$store.state.api + '/upload/image/profile',
        thumbnailWidth:"200",
        thumbnailHeight:"200",
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

    // Only when I am not modifying my own profile.
    if('ADMIN' in self.getRoles())
      self.isAdmin = true;
    self.fetchProfile();
    self.fetchImage();
  },
  methods: {
    fetchProfile: function() {
      const self = this;
      const app = self.$f7;
      app.preloader.show();

      // Bug. Hack
      if(self.login && (self.login === 'undefined' || self.login === 'null'))
        self.login = self.whoAmI();

      let endpoint = '';

      if(self.login) {
        endpoint = self.isAdmin ? '/people/profile/get/'+self.login:'/me/profile';
        self.postWithPromise(endpoint).then(function(x) {
            self.profile = JSON.parse(x.data).data;
          });
      } else {
        self.notify("Error", "Invalid profile " + self.login);
        app.preloader.hide();
        return;
      }

      endpoint = '/people/profile/roles/'+self.login;
      self.postWithPromise(endpoint).then(function(x) {
        self.roles = JSON.parse(x.data).data;
      });

      endpoint = self.isAdmin ? '/people/profile/editables':'/me/profile/editables';
      self.postWithPromise(endpoint).then(function(x) {
          self.editables = JSON.parse(x.data).data;
          app.preloader.hide();
        });
      setTimeout(()=> app.preloader.hide(), 30000);
    },
    fetchImage: function() {
      const self = this;
      const app = self.$f7;
      if(! self.login)
        return;

      self.$refs.profilePic.removeAllFiles();
      app.preloader.show();
      let endpoint = self.isAdmin ? '/people/profile/photo/'+self.login : '/me/photo/'+self.login;
      self.postWithPromise(endpoint).then(function(x) {
          var res = JSON.parse(x.data).data;
          var byteString = atob(res.base64);
          var content = new Array();
          for (var i = 0; i < byteString.length; i++) {
            content[i] = byteString.charCodeAt(i)
          }
          var img = new Blob([new Uint8Array(content)], {type: 'image/jpeg'});
          self.$refs.profilePic.addFile(img);
          app.preloader.hide();
        });
      setTimeout(()=> app.preloader.hide(), 10000);
    },
    uploadFiles: function() 
    {
      const self = this;
      const app = self.$f7;

      // login is the profile for which we are changing picture. Only admin is
      // allowed to do that. API won't allow if you don't have admin
      // privileges.
      self.dropzoneOptions.headers.login = self.profile.login;

      self.$refs.profilePic.processQueue();
    },
    updateProfile: function() {
      const self = this;
      const app = self.$f7;

      // I can update my profile. Only admin can update other profiles.
      let endpoint = self.isAdmin ? '/admin/logins/update' : '/me/profile/update';

      self.profile.roles = self.roles.roles.join(',');
      self.promiseWithAuth(endpoint, self.profile)
        .then(function(x) {
          var x = JSON.parse(x.data).data;
          if(x.success) {
            self.notify("Success", "Updated profile.");
            self.fetchProfile();
          }
          else
            self.notify("Failed", x.msg);
        });
    },
    updateRoles: function(role) {
      if(role === 'USER')
        return;

      const self = this;
      if(self.roles.roles.includes(role))
        self.roles.roles = self.roles.roles.filter(x => x !== role);
      else
        self.roles.roles.push(role);
      console.log("change", self.roles);
    },
  },
}
</script>
