<template>
  <f7-page>
    <f7-navbar title="People" back-link="Back">
    </f7-navbar>
      

    <f7-block>


      <v-autocomplete  
        placeholder="Search for a login"
        results-property="email"
        results-display="name"
        results-value="login"
        :request-headers="apiPostData()"
        method="post"
        @selected="fetchAndUpdateLogin"
        @clear="thisLogin={}"
        :source="(q)=>searchPeopleURI(q, 'login')">
      </v-autocomplete>

    </f7-block>

    <!-- POPUP -->
    <f7-popup :opened="popupLogin" @popup:close="popupLogin = false">
      <f7-page>
        <f7-navbar title="Update login">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block>

          <f7-row>
            <f7-col width="100" 
              medium="50" 
              style="border-top:1px dotted lightgray"
              v-for="(val, key) in thisLogin"
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

          <f7-list media-list no-hairlines>
            <f7-row>
              <f7-list-input v-for="(val, key, index) in editables" 
                class="col-100 medium-50"
                :wrap="false"
                :key="key"
                :label="formatKey(key)"
                :type="val[0]"
                @change="thisLogin[key]=$event.target.value"
                :value="thisLogin[key]">
                <option v-for="(v,k) in val[0]==='select'?val[1]:[]" 
                  :key="k" :value="v">
                  {{v}}
                </option>
              </f7-list-input>
            </f7-row>
            <f7-list-item>
              <f7-button raised outline @click="updateProfile()">
                Update
              </f7-button>
            </f7-list-item>
            <f7-list-item></f7-list-item>
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
      logins: [],
      thisLogin: {},
      loginType: "ACTIVE",
      popupLogin: false,
      editables:[],
    };
  },
  mounted: function()
  {
    const self = this;
    const app = self.$f7;
    self.postWithPromise('me/profile/editables')
      .then(function(x) {
        self.editables = JSON.parse(x.data).data;
        app.preloader.hide();
      });
    setTimeout(()=> app.preloader.hide(), 2000);
  },
  methods : {
    fetchLogins: function(what) {
      const self = this;
      const app = self.$f7;
      self.loginType = what;
      app.preloader.show();
      self.postWithPromise('admin/logins/status/'+self.loginType).then(function(x) {
        self.logins = JSON.parse(x.data).data;
        // self.thisLogin = self.logins[0];
        console.log("Total entries ", self.logins.length);
        app.preloader.hide();
      });
      setTimeout(() => app.preloader.hide(), 10000);
    },
    arrayToName: function(login) {
      const self = this;
      return login.first_name + ' ' + login.last_name;
    },
    loginPopup: function(login) {
      const self = this;
      self.thisLogin = login;
      self.popupLogin = true;
    },
    onLoginSelected: function(x) {
      const self = this;
      self.thisLogin = x.selectedObject;
    },
    fetchAndUpdateLogin: function(obj) {
      const self = this;
      self.postWithPromise('admin/logins/login/'+obj.value).then(function(x) {
        self.thisLogin = JSON.parse(x.data).data;
        self.popupLogin = true;
      });
    },
    updateProfile: function() {
      const self = this;
      const app = self.$f7;
      self.promiseWithAuth('admin/logins/update', self.thisLogin)
        .then(function(x) {
          let res = JSON.parse(x.data).data;
          if(res.success)
            self.notify("Success", "Successfully updated.");
          else
            self.notify("Failure", "Failed to update profile.");

          self.popupLogin = false;
        });
    },
  },
}
</script>
