App.View.DataBrowserMigrateView = App.View.DataBrowserView.extend({
  templates : {
    'dataviewEmptyContainer' : '#emptyFullpageContainer',
    'dataMigrateMessage' : '#dataMigrateMessage',
    'databrowserNavbar' : '#databrowserNavbar',
    'dataMigratingView' : '#dataMigratingView',
    'databrowserEnable' : "#databrowserEnable"
  },
  events : {
    'click  .btn-migrate' : 'onMigrate'
  },
  initialize : function(options){
    this.compileTemplates();
    this.options = options;
    this.breadcrumb(['Data Browser', 'Migrate']);
  },
  render: function() {
    var self = this,
    nav = this.templates.$databrowserNavbar({ brand : 'Data Browser', 'class' : 'migratenavbar', baritems : '' }),
    migrateMessage, migrateButton;

    if (this.options.isFullMigrate){
      migrateMessage = this.templates.$dataMigrateMessage();
      migrateButton = 'Migrate now &raquo;';
      this.url = Constants.DB_MIGRATE_URL;
      this.needsDeploy = true;
    }else{
      migrateMessage = this.templates.$databrowserEnable();
      migrateButton = 'Enable &raquo;';
      this.url = Constants.DB_CREATE_URL;
      this.needsDeploy = false;
    }

    this.message = new App.View.FullPageMessageView({ message : migrateMessage, button : migrateButton , cb : function(){
      self.onMigrate.apply(self, arguments);
    }});

    this.$el.empty();
    this.$el.append(nav);
    this.$el.append(this.message.render().$el);
    return this;
  },
  onMigrate : function(){
    var self = this,
    params = {
      appGuid: this.options.guid,
      env : this.options.mode
    };

    this.message.$el.hide();
    this.$el.append(this.templates.$dataMigratingView());
    //#8615 - once LCM is deployed, the app db migration will always to through fh-supercore no matter if LCM is enabled or not
    var clientProps = $fw.getClientProps();
    var migrateUrl = '/api/v2/mbaas/' + clientProps.domain + '/' + this.options.mode + '/' + 'apps/' + this.options.guid + '/upgradedb';
    $.ajax({
      type: 'POST',
      url: migrateUrl,
      contentType : 'application/json',
      data: JSON.stringify(params),
      timeout: 20000,
      success: function(res){
        if (res.result && res.result.cacheKey && res.result.cacheKey.length > 0) {
          self.migrateStarted(res.result.cacheKey);
        } else {
          console.log('Migrate failed:' + res);
        }
      },
      error : function(response, message, status){
        try{
          var msg = JSON.parse(response.responseText).message;
          self.updateProgressLog(msg);
        }catch(err){
        }
        self.migrateCompleteFailed();
      }
    });
  },
  migrateStarted: function (cache_key) {
    var self = this;
    this.resetProgress();
    console.log('migrateStarted: [' + cache_key + ']');
    var progress = 0;

    this.active_async_task = new ASyncServerTask({
      cacheKey: cache_key
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function (res) {
        console.log('migration timeout error > ' + JSON.stringify(res));
        self.updateProgressLog("Migrate timed out.");
        if ($.isFunction(self.migrateCompleteFailed)) {
          self.migrateCompleteFailed();
        }
        self.updateProgress(100);
      },
      update: function (res) {
        console.log('migration update > ' + JSON.stringify(res));
        for (var i = 0; i < res.log.length; i++) {
          console.log(res.log[i]);
        }
        if (res.progress) {
          progress = res.progress;
        } else {
          progress += 2;
        }

        self.updateProgressLog(res.log);
        self.updateProgress(progress);

        if (res.status === "COMPLETE"){
          return self.migrateCompleteSuccess();
        }else if (res.status ==="ERROR"){
          self.updateProgress(100);
          return self.migrateCompleteFailed();
        }


      },
      complete: function (res) {
        console.log('Migrate successful > ' + JSON.stringify(res));
        if ($.isFunction(self.migrateCompleteSuccess)) {
          self.migrateCompleteSuccess();
        }
      },
      error: function (res) {
        console.log('Migrate error > ' + JSON.stringify(res));
        self.updateProgressLog(res.error);
        if ($.isFunction(self.migrateCompleteFailed)) {
          self.migrateCompleteFailed();
        }
        self.updateProgress(100);
      },
      retriesLimit: function () {
        console.log('Migrate retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        if ($.isFunction(self.migrateCompleteFailed)) {
          self.migrateCompleteFailed();
        }
        self.updateProgress(100);
      },
      end: function () {

      }
    });
    this.active_async_task.run();
  },
  resetProgress: function () {
    var progress_el = this.$el.find('.data_migrate_progress .progress');
    var progress_log_el = this.$el.find('.data_migrate_progress textarea');
    var bar = this.$el.find('.bar', progress_el);

    progress_log_el.val('');

    bar.css('width', '0%');
    setTimeout(function () {
      bar.css('width', '0%');
    }, 500);
  },
  updateProgressLog: function (log) {
    // allow for string or array of strings
    log = 'string' === typeof log ? [log] : log;
    var progress_log_el = this.$el.find('.data_migrate_progress textarea');

    if (log.length > 0) {
      var current_log = progress_log_el.val(),
      log_value;
      if (current_log === '') {
        log_value = current_log + log.join('\n');
      } else {
        log_value = current_log + '\n' + log.join('\n');
      }
      progress_log_el.val(log_value);
      progress_log_el.scrollTop('10000000');
    }
  },
  updateProgress: function (value) {
    var progress_el = this.$el.find('.data_migrate_progress .progress');
    var bar = this.$el.find('.bar', progress_el);
    bar.css('width', value + '%');
  },
  migrateCompleteFailed: function () {
    console.log('Migrate complete - failed.');

    this.makeProgressRed();

  },
  migrateCompleteSuccess: function () {
    console.log('Migrate complete - success');
    this.makeProgressGreen();
    this.updateProgress(100);
    this.updateProgressLog('Migration successful');

    // update inst now that migrate is complete so it has the hasOwnDb property in millicore
    $fw.client.model.App.read($fw.data.get('inst').guid, function(result) {
      $fw.data.set('inst', result.inst);
    }, function(err){
      this.updateProgressLog('Error updating app instance properties');
    });
    this.trigger('migrateDone', this.needsDeploy);
  },
  makeProgressRed: function () {
    this.$el.find('.data_migrate_progress .progress').removeClass('progress-striped').addClass('progress-danger');
  },
  makeProgressGreen: function () {
    this.$el.find('.data_migrate_progress .progress').removeClass('progress-striped').addClass('progress-success');
  }
});