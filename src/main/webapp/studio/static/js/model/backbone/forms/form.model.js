var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.Form = App.Model.FormBase.extend({
  relations: [{
    type: Backbone.HasMany,
    key: 'pages',
    relatedModel: 'App.Model.FormPage',
    collectionType: 'App.Collection.FormPages',
    reverseRelation: {
      key: 'form',
      includeInJSON: 'id'
    }
  }],
  fetchURL : '/api/v2/forms/form/{{id}}'
});

App.Model.FormPage = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: [{
    type: Backbone.HasMany,
    key: 'fields',
    relatedModel: 'Field',
    collectionType: 'App.Collection.FormFields',
    reverseRelation: {
      key: 'page',
      includeInJSON: 'id'
    }
  }],

  "findFieldById" : function (id , cb){
    var fields = this.get("fields");
    var field;
    var index;
    if(fields){
      for(var i=0; i < fields.length; i++){
        var f = fields[i];
        if(f && f.get("_id") === id){
          field = f;
          index = i;
          break;
        }
      }
    }
    cb(undefined, field, index);
  },

  "removeFieldFromPage":function (fieldId){
    var fields = this.get("fields");
    if(fields){
      for(var i=0; i < fields.length; i++){
        var f = fields[i];
        if(f && f._id === fieldId){
          console.log("found field removing it " , f);
          this.get("fields").splice(i,1);
        }
      }
    }
  }

});

App.Model.FormField = Backbone.RelationalModel.extend({idAttribute: '_id'});

App.Collection.FormPages = Backbone.Collection.extend({ model : App.Model.FormPage });
App.Collection.FormFields = Backbone.Collection.extend({ model : App.Model.FormField });
App.Collection.Form = App.Collection.FormBase.extend({
  pluralName : 'forms',
  initialize: function() {},
  model: App.Model.Form,
  url: '/api/v2/forms/form/list',
  urlUpdate: '/api/v2/forms/form/',
  urlDelete: '/api/v2/forms/form/'
});
App.Collection.AppsUsingThisForm = Backbone.Collection.extend({
  url : '/api/v2/forms/{{id}}/apps',
  appId : undefined,
  initialize : function(options){
    this.options = options;
  },
  fetch : function(options){
    var url = this.url.replace('{{id}}', this.options.id);
    $.ajax({
      type: 'GET',
      url: url,
      cache: true,
      success: function(res){
        if (res) {
          if ($.isFunction(options.success)) {
            options.success(res, options);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res, options);
          }
        }
      },
      error: function(xhr, status){
        options.error(arguments);
      }
    });
  }
});