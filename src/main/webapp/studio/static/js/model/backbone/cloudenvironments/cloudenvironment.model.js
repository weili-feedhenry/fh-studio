var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.Model = Cloudenvironments.Model || {};
Cloudenvironments.Collection = Cloudenvironments.Collection || {};

Cloudenvironments.Model.MemoryResource = Backbone.Model.extend({
  getSeries: function(){
    return ["apps", "system", "cache"];
  },

  getUnit: function(){
    return "MB";
  },

  getTitle: function(){
    return "Memory";
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a","#1aadce", "#8bbc21"];
  }
});

Cloudenvironments.Model.CpuResource = Backbone.Model.extend({
  getSeries: function(){
    return ["apps", "used"];
  },

  getUnit: function(){
    return "%";
  },

  getTitle: function(){
    return "CPU";
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a", "#8bbc21"];
  }
});

Cloudenvironments.Model.DiskResource = Backbone.Model.extend({
  getSeries: function(){
    return ["apps", "system"];
  },

  getUnit: function(){
    return "MB";
  },

  getTitle: function(){
    return "Disk";
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a","#8bbc21"];
  }
});

Cloudenvironments.Model.ResourceSummary = Backbone.Model.extend({

  getPercentage: function(){
    return this.get("total") === 0 ? 0: Math.round(parseInt(this.get("used"), 10)/parseInt(this.get("total"), 10)*100);
  },

  getPercentageStr: function(){
    return this.getPercentage() + "%";
  }
});

Cloudenvironments.Model.Environment = Backbone.Model.extend({
  idAttribute: "environment",

  initialize: function(){
    this.set("interval", 0);
    this.resourceCollection = new Cloudenvironments.Collection.EnvResource();
    this.isPooling = false;
    this.url = function(){
      return '/box/srv/1.1/environments/'+this.id;
    };
  },

  getEnvName: function(){
    return js_util.capitalise(this.get("environment"));
  },

  getResourceSummary: function(resource){
    var self = this;
    var data = this.get("resources")[resource];
    data.used = this.get("resources")[resource]["used"] ||this.get("resources")[resource]["running"];
    if(typeof data.used === "undefined"){
      data.used = 0;
    }
    data.name = resource;
    data.ts = new Date().getTime();
    return new Cloudenvironments.Model.ResourceSummary(data);
  },

  getResourceText: function(resource){
    return js_util.capitalise(resource);
  },

  countToNextLoad: function(){
    var self = this;
    if(this.poolingInterval){
      clearTimeout(this.poolingInterval);
    }
    this.set("interval", parseInt($fw.getClientProp("studio.ui.environments.refreshInterval") || 10, 10));
    this.poolingInterval = setInterval(function(){
      self.set("interval", self.get("interval") - 1 );
      if(self.get("interval") === 0){
        clearTimeout(self.poolingInterval);
        self.loadResourceDetails();
      }
    }, 1000);
  },

  startPooling: function(){
    if(!this.isPooling){
      console.log("Start pooling resource for " + this.id);
      this.isPooling = true;
      this.loadResourceDetails();
    }
  },

  stopPooling: function(){
    if(this.poolingInterval){
      clearTimeout(this.poolingInterval);
      this.isPooling = false;
      console.log("Stop pooling resource for " + this.id);
    }
  },

  loadResourceDetails: function(){
    var envResource = new Cloudenvironments.Model.EnvironmentResource({
      env: this.id
    });
    envResource.on("sync", function(model, resp, options){
      this.countToNextLoad();
      this.updateResourceCollection(model);
      this.set("resources", model.get("resources"));
    }, this);
    envResource.fetch();
  },

  updateResourceCollection: function(model){
    model.set("ts", new Date().getTime());
    this.resourceCollection.add(model);
  },

  getResourceCollection: function(){
    return this.resourceCollection;
  },

  getAppResources: function(){
    return this.resourceCollection.at(this.resourceCollection.length - 1).get("apps");
  }
});

Cloudenvironments.Model.EnvironmentResource = Backbone.Model.extend({

  initialize: function(options){
    this.env = options.env;
    this.url = function(){
      return '/box/srv/1.1/environments/'+this.env+'/resources';
    };
  }

});


Cloudenvironments.Collection.Environments = Backbone.Collection.extend({
  model: Cloudenvironments.Model.Environment,
  url: '/box/srv/1.1/environments',

  parse: function(response){
    var envs = response;
    var ret = [];
    _.each(envs, function(env){
      ret.push({environment: env});
    });
    return ret;
  }
});

Cloudenvironments.Collection.EnvResource = Backbone.Collection.extend({
  model: Cloudenvironments.Model.EnvironmentResource
});

Cloudenvironments.Model.CacheResource = Backbone.Model.extend({

  initialize: function(options){
    this.env = options.env;
  },

  url: function(){
    return '/box/srv/1.1/environments/' + this.env;
  },

  getPercentage: function(){
    return Math.round(parseInt(this.get("used"), 10)/parseInt(this.get("total"), 10)*100);
  },

  getMaxPercentage: function(){
    return Math.round(parseInt(this.get("total"), 10)/parseInt(this.get("memory"), 10)*100);
  },

  flush: function(){
    this.doAction("cache/flush", {env: this.env});
  },

  flushApp: function(appid){
    this.doAction("apps/" + appid + "/cache/flush", {app: appid});
  },

  setCache: function(type, value){
    this.doAction("cache/set", {type: type, value: value});
  },

  doAction: function(endpoint, data){
    var model = this;
    var url = model.url() + "/" + endpoint;
    var self = this;
    var opts = {
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      success: function(){
        self.trigger("sync");
      }
    };
    return (this.sync || Backbone.sync).call(this, null, this, opts);
  }

});

Cloudenvironments.Model.CloudApp = Backbone.Model.extend({
  
  initialize: function(options){
    this.env = options.env;
    this.appGuid = options.guid;
  },

  url: function(){
    return "/box/srv/1.1/ide/" + window.DOMAIN + "/app";
  },

  start: function(){
    return this.doAction("start");
  },

  restart: function(){

  },

  suspend: function(){

  },

  stop: function(){
    return this.doAction("stop");
  },

  undeploy: function(){

  },

  doAction: function(endpoint){
    var model = this;
    var url = model.url() + "/" + endpoint;
    var self = this;
    var opts = {
      url: url,
      type: "POST",
      data: JSON.stringify({
        guid: this.appGuid,
        deploytarget: this.env
      }),
      success: function(){
        self.trigger("sync");
      }
    };
    return (this.sync || Backbone.sync).call(this, null, this, opts);
  }

});
