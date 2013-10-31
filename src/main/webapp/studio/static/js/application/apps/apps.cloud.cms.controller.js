var Apps = Apps || {};
Apps.Cloud = Apps.Cloud || {};
Apps.Cloud.Cms = Apps.Cloud.Cms|| {};
var CMS_TOPICS = App.dispatch.topics.CMS;

Apps.Cloud.Cms.Controller = Apps.Cloud.Controller.extend({
  views : {
    container: '#cms_container'
  },
  "models":{
    userkey: new model.UserKey()
  },
  init: function() {
    this._super();
  },
  show: function(e) {
    this._super(this.views.container);
    this.guid = $fw.data.get('inst').guid;
    var self = this,
    box_container = $($(this.views.container).find('.fh-box-inner'));
    $(this.views.container).show();

    if (this.view){
      this.view.remove();
      this.view.stopListening(); // TODO Does this still cause issues with formbuilder?
    }
    async.parallel([
      function (callback){
        self.models.userkey.load(function (keys){
          callback(undefined, keys);
        });
      },
      function (callback){
        $fw.client.model.App.read(self.guid, function (result){
            callback(undefined, result);
          },
          function (err){
            callback(err);
          });
      }
    ], function (err, data){
      console.log(data);

      if(err){
        console.log("error loading data", err);
      }else{
        console.log("data back from apikeys ", data);
        if(data && data[0] && data[0].list && data[0].list.length > 0){
          var userApiKey = data[0].list[0].key;
          $fw.data.set("userapikey",userApiKey);
        }
        if(data && data[1]){
          var inst = data[1].inst;
          $fw.data.set("inst",inst);
        }
      }
      self.view = new App.View.CMSController({ container : self.views.container, mode : $fw.data.get('cloud_environment') });
      box_container.empty().append(self.view.render().$el);
    });


  }
});