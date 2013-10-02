var App = App || {};
App.View = App.View || {};

App.View.CMSController  = Backbone.View.extend({

  events: {
    'click .btn-cms-back' : 'onCMSBack'
  },

  templates : {
    'cms_left' : '#cms_left',
    'cms_mastermenu' : '#cms_mastermenu'
  },
  initialize: function(options){
    this.options = options;
    this.mode = options.mode || 'dev';
    var self = this;
    this.compileTemplates();

    // Initialise our audit controller
    this.audit = new App.View.CMSAudit();

    this.collection = new App.Collection.CmsSection();
    this.collection.fetch({ reset: true});
    this.collection.bind('reset', $.proxy(this.render, this));
    App.dispatch.on("cms.sectionclick",self.updateSelect);
  },

  updateSelect : function (data) {
    console.log("update select ", data);
    $('option:selected', 'select[name="parentName"]').removeAttr('selected');
    $('select[name="parentName"]').find("option[data-path='"+data.path+"']").attr("selected",true);
  },

  render: function(options){
    this.$el.empty();

    if (!this.collection.loaded){
      this.$el.append('Loading...');
      return this;
    }

    var modeString = (this.mode==="dev") ? "Live" : "Dev"; // "Copy to {{ mode }}"

    if ($(this.options.container).find('.fh-box-header .cms_mastermenu').length===0){

      $(this.options.container).find('.fh-box-header').append(this.templates.$cms_mastermenu({ mode : modeString }));
      // Bind the events - these aren't in this.$el alas
      $(this.options.container).find('.fh-box-header .btn-cms-audit').on('click', $.proxy(this.showAudit, this));
      $(this.options.container).find('.fh-box-header .btn-cms-import').on('click', $.proxy(this.showImport, this));
      $(this.options.container).find('.fh-box-header .btn-cms-export').on('click', $.proxy(this.showExport, this));
      $(this.options.container).find('.fh-box-header .btn-cms-copy').on('click', $.proxy(this.showCopy, this));
    }
    // The button is only templated once - for every other mode switch, we need to replace the inner text of the button
    $(this.options.container).find('.btn-cms-copy span').html('Copy to ' + modeString);

    this.section = this.section || this.collection.at(0) && this.collection.at(0).get('path');

    if (!this.section){
      console.log('Error: no section specified when initing cloud.cms.view');
      return this.modal("Error loading section");
    }

    this.$el.addClass('row nomargin');


    /*
     Formbuilder doesn't render well with an invisible el - DnD doesn't work.
     It needs to be already on the page => we work around this requirement here
     with 2 containers, one for section edit, one for list field edit
     */
    this.$fbContainer = $('<div></div>');
    this.$listFieldContainer = $('<div></div>'); // Contains subviews of FormBuilder for list fields
    this.$el.prepend(this.$fbContainer);
    this.$el.prepend(this.$listFieldContainer);

    var isAdministrator = $fw.userProps.roles.indexOf('cmsadmin'); //TODO: Wire this up - doesn't exist yet
    this.form = new App.View.CMSSection({ $el : this.$fbContainer, collection : this.collection, section : this.section, editStructure : true }); //

    this.form.render();

    this.form.bind('edit_field_list', $.proxy(this.onEditFieldList, this));

    this.tree = new App.View.CMSTree({collection : this.collection});
    this.$el.prepend(this.templates.$cms_left());
    this.$el.find('.treeContainer').append(this.tree.render().$el);
    this.tree.bind('sectionchange', $.proxy(this.treeNodeClicked, this));
    this.tree.bind('sectionchange', $.proxy(this.form.setSection, this.form));


    return this;
  },
  onEditFieldList : function(options){
    this.$fbContainer.hide();
    this.$listFieldContainer.empty().show();
    options.$el = this.$listFieldContainer;
    this.listfield = new App.View.CMSListField(options);
    this.listfield.render();
    this.listfield.bind('back', $.proxy(this.onCMSBack, this));
  },
  onCMSBack : function(success){
    this.$listFieldContainer.empty().hide();
    this.$fbContainer.show();
    if (this.listField){
      this.listfield.undelegateEvents();
    }
    if (success === true){
      // Show save success message
      this.form.alertMessage();
    }
  },
  treeNodeClicked : function(){
    if (this.$listFieldContainer.length && this.$listFieldContainer.length>0){
      this.onCMSBack();
    }
  },
  showAudit : function(){
    this.$el.append(this.audit.render().$el);
  },
  showImport : function(){
    this.$el.append(new App.View.CMSImportExportCopy( { view : 'import' } ).render().$el);
  },
  showExport : function(){
    this.$el.append(new App.View.CMSImportExportCopy( { view : 'export' } ).render().$el);
  },
  showCopy : function(){
    //TODO: Switch between mode on mode switch?
    this.$el.append(new App.View.CMSImportExportCopy( { view : 'copy', mode : this.mode } ).render().$el);
  }
});