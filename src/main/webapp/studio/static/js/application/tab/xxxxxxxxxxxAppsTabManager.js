application.AppsTabManager = application.TabManager.extend({
  name: 'apps',
  accordion: null,
  inited: false,

  init: function(opts) {
    this._super(opts);
  },

  doReset: $.noop,

  // overwrite the breadcrumb function as it works a little differently for the apps tab
  constructBreadcrumbsArray: function() {
    var outer_layout = this.tab_content.find('#list_apps_layout');
    var b1 = outer_layout.find('#list_apps_buttons li.ui-state-active a');
    var crumbs = [{
      text: b1.text(),
      callback: function() {
        $fw.client.tab.apps.showListApps();
        b1.trigger('click');
      }
    }];
    if (!outer_layout.is(':visible')) {
      var b2 = $fw.data.get('inst').title;
      var accordion = this.tab_content.find('.ui-layout-west .ui-accordion');
      var b3 = accordion.find('h3.ui-state-active');
      var b4 = accordion.find('.ui-accordion-content-active .ui-state-active');
      crumbs.push({
        text: b2,
        callback: function() {
          var first_item = $(accordion.find('.ui-accordion-header')[0]);
          if (!first_item.is('.ui-state-active')) {
            first_item.trigger('click');
          } else {
            accordion.find('.ui-accordion-content-active .ui-menu li:first-child a').trigger('click');
          }
        }
      });
      crumbs.push({
        text: b3.text(),
        callback: function() {
          accordion.find('.ui-accordion-content-active .ui-menu li:first-child a').trigger('click');
        }
      });
      crumbs.push({
        text: b4.text()
      });
    }
    return crumbs;
  },

  doPreShow: function() {},

  doPreInit: function() {
    var apps_search;

    $('#list_apps_layout').hide();
    $('#manage_apps_layout').hide();

    list_apps_buttons = $('#list_apps_buttons');
    var search_fn = function() {
        var query = apps_search.val();
        // Only do the search if a query was entered
        if (query.length > 0) {
          // and if the query doesn't match the placeholder
          if (query !== apps_search.attr('placeholder')) {
            $fw.client.app.doSearch(query);
          }
        }
        // otherwise just show all apps
        else {
          list_apps_buttons.find('#list_apps_button_my_apps').trigger('click');
        }
        };
    apps_search = $('#apps_search').bind('keyup', function(e) {
      // only execute if 'enter' key was pressed
      if (e.keyCode == 13) {
        e.preventDefault();
        search_fn();
        return false;
      }
    });
    $('#apps_search_form span').bind('click', search_fn);
    // apply placeholder plugin
    apps_search.placeholder({
      className: 'placeholder'
    });

    function changeButtonState(button) {
      $fw.state.set('apps_tab_options', 'selected', button.attr('id'));

      // highlight active button
      $('#list_apps_buttons li').removeClass('ui-state-active');
      button.addClass('ui-state-active');
    }

    list_apps_buttons.find('#list_apps_button_my_apps').addClass('ui-state-active').bind('click', $.throttle(Properties.click_throttle_timeout, function() {
      changeButtonState($(this));
      $fw.app.showAndLoadGrid('my_apps');
    }));
    list_apps_buttons.find('#list_apps_button_templates').bind('click', $.throttle(Properties.click_throttle_timeout, function() {
      changeButtonState($(this));

      // Remove text from search box
      $('#apps_search').val('').trigger('blur');

      $fw.app.showAndLoadGrid('templates');
    }));
    list_apps_buttons.find('#list_apps_button_create').bind('click', $fw.client.app.doCreate);
    list_apps_buttons.find('#list_apps_button_import').bind('click', $fw.client.app.doImport);
    list_apps_buttons.find('#list_apps_button_generate_app').bind('click', function() {
      changeButtonState($(this));
      $fw.client.app.generate_app_controller.show();
    });
    // apps_layout = proto.Layout.load($('#apps_layout'), {
    //   east__initClosed: true,
    //   west__initClosed: true
    // });
  },

  doPostInit: function() {},

  disableItems: function() {
    var app_generation_enabled = $fw.getClientProp('app-generation-enabled') == "true";
    var nodejs_domain = $fw.getClientProp('nodejsEnabled') == "true";
    if (!app_generation_enabled || !nodejs_domain) {
      $('#list_apps_button_generate_app').hide().remove();
      $('#create_app_generator_container').hide().remove();
    }
  },

  doPostShow: function() {
    var self = this;
    self.disableItems();

    var that = this;
    // TODO: different check when we no longer use globals for this
    if (!self.inited) {
      // Check if we need to force a state
      // TODO: allow for UI structural changes
      var defval = 'list_apps_button_my_apps';
      var selected = $fw.state.get('apps_tab_options', 'selected', defval);
      var id;
      if (selected === 'app') {
        // An app was open last, so what's the id?
        id = $fw.state.get('app', 'id', null);
        if (null !== id) {
          // Have an app id, lets try open it for managing
          $fw.client.app.doManage(id, $.noop, function() {
            // if it fails (permission issue or app doesn't exist), show apps list
            that.showListApps();
            $('li#' + defval).trigger('click');
          });
        } else {
          // setup the list_apps_layout 
          this.showListApps();
          $('li#' + defval).trigger('click');
        }
      } else if (selected === 'template') {
        id = $fw.state.get('template', 'id', null);
        if (null !== id) {
          // Have an app id, lets try open it for managing
          $fw.client.template.doView(id);
          // TODO: need a failure callback if template cant be shown
        } else {
          // setup the list_apps_layout 
          this.showListApps();
          $('li#' + defval).trigger('click');
        }
      } else {
        // setup the list_apps_layout 
        this.showListApps();
        $('li#' + selected).trigger('click');
      }
    }
    self.inited = true;
  }
});