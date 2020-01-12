<template>
  <f7-page>
    <f7-navbar title="Manage Speaker" back-link="Back">
    </f7-navbar>
    
    <f7-list no-hairlines inline-labels>
      <f7-list-item>
        <f7-row>
          <vue-dropzone ref="speakerPic"  
                        id="speaker-pic-id"
                        @vdropzone-files-added="(file)=>uploadFiles()"
                        :options="dropzoneOptions">
          </vue-dropzone>
        </f7-row>
      </f7-list-item>
      <f7-list-input v-for="(value,key) in thisSpeaker" 
                     :disabled="hideKeys.includes(key)"
                     :type="finfo.hasOwnProperty(key)?'select':'text'"
                     :label="formatKey(key)"
                     :value="thisSpeaker[key]"
                     @change="thisSpeaker[key]=$event.target.value"
                     :key="key">
        <option v-for="(v,k) in finfo.hasOwnProperty(key)?finfo[key]:[]" 
                :value="v"
                :key="k">
        {{v}}
        </option>
      </f7-list-input>
      <f7-list-item>
        <f7-col>
          <f7-button>{{thisTask}} Speaker</f7-button>
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
      hideKeys: ['id', 'photo'],
      speaker: {},
      thisTask: params.action,
      thisSpeaker: {id: params.speakerid, photo:''},
      finfo : [],
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
  mounted()
  {
    const self = this;
    self.postWithPromise('admin/table/fieldinfo/speakers')
      .then(function(x) {
        self.finfo = JSON.parse(x.data).data;
      });

    self.postWithPromise('admin/speaker/fetch/'+self.thisSpeaker.id)
      .then(function(x) {
        var res = JSON.parse(x.data);
        if(res.status === 'ok') {
          self.thisSpeaker = res.data;
          self.updateImage();
        }
      });
  },
  methods : {
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
  },
}
</script>
