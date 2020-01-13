<template>
  <f7-page @page:beforein="initData">
    <f7-navbar title="Manage Speaker" back-link="Back">
    </f7-navbar>

    <f7-list no-hairlines style="margin:10px">
      <f7-list-input :input="false">
        <v-autocomplete  slot="input"
                         ref="refEventSpeaker"
                         input-class="item-input"
                         placeholder="Type Email or ID to search speaker..."
                         results-property="id"
                         results-display="name"
                         :request-headers="apiPostData()"
                         method="post"
                         @selected="onSpeakerSelected"
                         @noResults="createNewSpeaker=true"
                         :source="(q)=>searchPeopleURI(q, 'speaker')">
        </v-autocomplete>
      </f7-list-input>
      <f7-list-item>
        <f7-col>
          <vue-dropzone ref="speakerPic"  
                        id="speaker-pic-id"
                        @vdropzone-files-added="(file)=>uploadFiles()"
                        :options="dropzoneOptions">
          </vue-dropzone>
        </f7-col>
        <f7-col>
          <div v-html="thisSpeaker.html" style="font-size:small">
          </div>
        </f7-col>
      </f7-list-item>
    </f7-list>

    <f7-list inline-labels no-hairlines>
      <f7-list-input v-for="(value,key) in thisSpeaker" 
                     v-if="! hideKeys.includes(key)"
                     :type="_get(finfo,key,['text'])[0]"
                     :label="formatKey(key)"
                     :value="thisSpeaker[key]"
                     @change="thisSpeaker[key]=$event.target.value"
                     :key="key">
        <option v-for="(v,k) in _get(finfo, key, ['text'])[0]==='select'?finfo[key][1]:[]" 
                :value="v"
                :key="k">
        {{v}}
        </option>
      </f7-list-input>
      <f7-list-item>
        <f7-col>
          <f7-button small raised color=red fill
                     :disabled="parseInt(thisSpeaker.id) < 0"
                     @click="deleteThisSpeaker(thisSpeaker.id)">
            Delete Speaker
          </f7-button>
        </f7-col>
        <f7-col>
          <f7-button small raised 
                     v-if="! createNewSpeaker"
                     @click="updateSpeaker()">
            Update Speaker
          </f7-button>
          <f7-button small raised @click="addNewSpeaker" v-else>
            Add new Speaker
          </f7-button>
        </f7-col>
      </f7-list-item>
      <f7-list-item>
      </f7-list-item>
    </f7-list>

  </f7-page>
</template>

<script>
export default {
  data() {
    const self = this;
    const params = self.$f7route.params;
    console.log("Params ", params);
    return {
      hideKeys: ['id', 'photo', 'html'],
      speaker: {},
      createNewSpeaker: true,
      thisTask: params.action,
      thisSpeaker: {id: params.speakerid, honorific:''
        , email:'', first_name:'', middle_name:'', last_name:''
        , designation:'', department:'', institute:''
        , homepage:'', photo:''},
      finfo: { },
      dropzoneOptions: {
        url: self.getUploadUrl,
        thumbnailMethod: 'contain',
        maxFilesize: 5,
        acceptedFiles: "image/*",
        addRemoveLinks: true,
        maxFiles: 1,
        autoProcessQueue: false, // don't upload automatically.
        headers: self.apiPostData(),
      },
    };
  },
  mounted: function()
  {
    const self = this;
    const app = self.$f7;
    self.initData();

    // Autocomplete.
    app.autocomplete.create({
      inputEl : '#speaker-autocomplete',
      openIn: 'dropdown',
      valueProperty: 'id',
      textProperty: 'name',
      source: function(q, render)
      {
        let results = [];
        self.promiseWithAuth('search/speaker/'+q)
          .then( function(x) {
            results = JSON.parse(x.data).data;
            if(results.length > 0)
              render(results);
          });
      },
      on: {
        change: function(val) {
          console.log('speaker: ', val);
          self.thisSpeaker = val[0];
        },
      },
    });
  },
  methods : {
    initData: async function() 
    {
      // This should be called before page loads else form won't bind properly.
      const self = this;
      self.postWithPromise('admin/table/fieldinfo/speakers')
        .then(function(x) {
          self.finfo = JSON.parse(x.data).data;

          // if speaker id is valid, fetch speaker info else fetch the table
          // schema and create a dummy speaker.
          if( parseInt(self.thisSpeaker.id) > 0)
            self.fetchSpeaker(self.thisSpeaker.id);
          else
            for(var key in self.finfo)
              self.thisSpeaker[key] = '';
        });
    },
    updateImage: function() {
      const self = this;
      const app = self.$f7;
      self.$refs.speakerPic.removeAllFiles();
      var byteString = atob(self.thisSpeaker.photo);
      var content = new Array();
      for (var i = 0; i < byteString.length; i++) {
        content[i] = byteString.charCodeAt(i)
      }
      var img = new Blob([new Uint8Array(content)], {type: 'image/jpeg'});
      self.$refs.speakerPic.addFile(img);
      return true;
    },
    uploadFiles: function() 
    {
      const self = this;
      const app = self.$f7;
      self.$refs.speakerPic.processQueue();
      return true;
    },
    getUploadUrl: function(file)
    {
      const self = this;
      return self.$store.state.api+'/upload/image/speaker/' + self.thisSpeaker.id;
    },
    fetchSpeaker: function(speakerID) 
    {
      const self = this;
      self.postWithPromise('admin/speaker/fetch/'+speakerID)
        .then(function(x) {
          var res = JSON.parse(x.data);
          if(res.status === 'ok') {
            self.thisSpeaker = res.data;
            self.updateImage();
          }
        });
    },
    onSpeakerSelected: function(res) {
      const self = this;
      self.thisSpeaker = res.selectedObject;
      //self.fetchSpeaker(res.value);
      self.createNewSpeaker=false;
    },
    updateSpeaker: function() 
    {
      const self = this;
      self.promiseWithAuth('admin/speaker/update', self.thisSpeaker)
        .then( function(x) {
          var res = JSON.parse(x.data).data;
          if(! res.success)
            self.notify("Failed.", res.msg);
          else
          {
            self.notify("Success.", res.msg);
            self.fetchSpeaker(self.thisSpeaker.id);
          }
        });
    },
    addNewSpeaker: function() 
    {
      const self = this;
      self.promiseWithAuth('admin/speaker/new', self.thisSpeaker)
        .then( function(x) {
          var res = JSON.parse(x.data).data;
          if(! res.success)
            self.notify("Failed.", res.msg);
          else
          {
            self.notify("Success.", res.msg);
            self.fetchSpeaker(self.thisSpeaker.id);
          }
        });
    },
    deleteThisSpeaker: function(sid) 
    {
      const self = this;
      const app = self.$f7;
      app.dialog.confirm( "You can only delete a speaker without any talk."
        , "Note"
        , function() {
          self.promiseWithAuth('admin/speaker/delete/' + sid)
            .then( function(x) {
              var res = JSON.parse(x.data).data;
              if(! res.success)
                self.notify("Failed to delete", res.msg);
              else
              {
                self.notify("Successfully delete.", res.msg);
                self.createNewSpeaker = true;
              }
            });
        }, null);
    },
  },
}
</script>