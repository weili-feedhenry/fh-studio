module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      specs: 'spec/javascripts/tests/**/*.spec.js',
      helpers: ['spec/javascripts/fixtures/globals.js', 'spec/javascripts/helpers/sinon.js', 'spec/javascripts/helpers/jasmine-jquery.js', 'spec/javascripts/helpers/eventhandler.js', 'spec/javascripts/helpers/factory.js', 'spec/javascripts/helpers/jasmine.async.js']
    },

    jasmine: {
      src: [
      'src/main/webapp/studio/static/js/application/Constants.js',
      'src/main/webapp/studio/static/js/model/backbone/event.model.js',
      'src/main/webapp/studio/static/js/model/backbone/alert.model.js',
      'src/main/webapp/studio/static/js/model/backbone/alertnotification.model.js',
      'src/main/webapp/studio/static/js/views/common/datatable.view.js',
      'src/main/webapp/studio/static/js/views/common/modal.view.js',
      'src/main/webapp/studio/static/js/views/common/fullpage_message.js',
      'src/main/webapp/studio/static/js/views/common/swap_select.view.js',
      'src/main/webapp/studio/static/js/views/plugins/plugins.view.js',
//      'src/main/webapp/studio/static/js/views/plugins/dashboard/plugins.dashboard.view.js',
//      'src/main/webapp/studio/static/js/views/plugins/plugins.controller.js',
//      'src/main/webapp/studio/static/js/model/backbone/plugin.model.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.sysevents.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.alerts.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cloud.alertnotifications.view.js',
      'src/main/webapp/studio/static/js/model/backbone/databrowser.model.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.collectionslist.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.dataview.table.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.dataview.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.advancededitor.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.filters.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.message.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.dataview.pagination.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.migrate.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/databrowser/cloud.databrowser.controller.js',
      'src/main/webapp/studio/static/js/application/dispatch/dispatch.js',
      'src/main/webapp/studio/static/js/model/backbone/cms.section.model.js',
      'src/main/webapp/studio/static/js/views/forms/forms.view.js',
      'src/main/webapp/studio/static/js/model/backbone/forms/form.base.model.js',
      'src/main/webapp/studio/static/js/model/backbone/forms/form.base.model.js',
      'src/main/webapp/studio/static/js/model/backbone/forms/form.model.js',
      'src/main/webapp/studio/static/js/model/backbone/forms/theme.model.js',
      'src/main/webapp/studio/static/js/model/backbone/forms/formapp.model.js',
      'src/main/webapp/studio/static/js/model/backbone/forms/fieldrules.model.js',
      'src/main/webapp/studio/static/js/model/backbone/forms/pagerule.model.js',
      'src/main/webapp/studio/static/js/views/forms/forms.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms.menu.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms/forms.rules.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms.list.base.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms/forms.list.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms/forms.create.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms/forms.edit.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms/forms.edit.reorder.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms/forms.fieldrules.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms/forms.pagerules.view.js',
      'src/main/webapp/studio/static/js/views/forms/themes/themes.list.view.js',
      'src/main/webapp/studio/static/js/views/forms/themes/themes.edit.view.js',
      'src/main/webapp/studio/static/js/views/forms/apps/formsapps.list.view.js',
      'src/main/webapp/studio/static/js/views/forms/apps/formsapps.createedit.view.js',
      'src/main/webapp/studio/static/js/views/forms/forms.view.controller.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.view.controller.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.tree.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.audit.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.section.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.listfield.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.listfield.topbar.view.js',
      'src/main/webapp/studio/static/js/views/app/cloud/cms/cloud.cms.table.view.js',
      'src/main/webapp/studio/static/js/views/view.mixins.js',
        'src/main/webapp/studio/static/js/application/dispatch/dispatch.js'
      ],

      options: {
        specs: '<%= meta.specs %>',
        helpers: '<%= meta.helpers %>',
        vendor: [
        'src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/jquery.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/bootstrap/bootstrap.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.dataTables.min.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.dataTables.fhext.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/select2/select2.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/backbone/backbone.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/backbone-relational/backbone-relational.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/highcharts/moment.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/handlebars/handlebars.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/handlebars/helpers.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jsoneditor/jsoneditor.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/async/async.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/backbone-deep-model/deep-model.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/rivets/rivets.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/formbuilder/formbuilder.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.string.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.mixin.deepExtend/index.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery-ui/jquery-ui.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery-ui/jquery-ui.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.jstree.js',
        'src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.cookie.js',
        'src/main/webapp/studio/static/common/js/util/StringUtil.js'
        ],
        template: require('grunt-template-jasmine-istanbul'),
        templateOptions: {
          coverage: 'coverage.json',
          report: [{
            type: 'cobertura',
            options: {
              dir: 'coverage-cobertura'
            }
          }, {
            type: 'html',
            options: {
              dir: 'coverage'
            }
          }, {
            type: 'text-summary'
          }]
        },
        junit: {
          path: 'test-report',
          consolidate: true
        },
        keepRunner : true
      }
    },
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: [
          'src/main/webapp/studio/static/js/views/common/modal.view.js',
          'src/main/webapp/studio/static/js/model/backbone/forms/*.js',
          'src/main/webapp/studio/static/js/views/forms/forms.view.js',
          'src/main/webapp/studio/static/js/views/forms/forms.list.base.view.js',
          'src/main/webapp/studio/static/js/views/forms/forms.menu.view.js',
          'src/main/webapp/studio/static/js/views/forms/forms.view.controller.js',
          'src/main/webapp/studio/static/js/views/forms/forms/forms.rules.view.js',
          'src/main/webapp/studio/static/js/views/forms/**/*.js'
        ],
        // the location of the resulting JS file
        dest: 'dist/forms/appforms.js'
      }
    },
    copy: {
      main: {
        files: [
          // includes files within path
          {expand: true, src: ['src/main/webapp/studio/static/themes/default/css/forms.css'], dest: 'dist/forms', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/inc/index/forms/forms_tab.html'], dest: 'dist/forms', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/jquery.js'], dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/bootstrap/bootstrap.js'], dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.dataTables.min.js'], dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/jquery/plugins/jquery.dataTables.fhext.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/select2/select2.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/backbone/backbone.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/backbone-relational/backbone-relational.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/highcharts/moment.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/handlebars/handlebars.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/handlebars/helpers.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/jsoneditor/jsoneditor.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/async/async.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/backbone-deep-model/deep-model.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/rivets/rivets.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/formbuilder/formbuilder.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.string.js'],dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/underscore.mixin.deepExtend/index.js'], dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/main/webapp/studio/static/common/js/ui/thirdparty/backbone/backbone.js'], dest: 'dist/forms/vendor', flatten: true, filter: 'isFile'}
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task.
  grunt.registerTask('default', ['jasmine']);
  grunt.registerTask('forms', ['concat', 'copy']);
};