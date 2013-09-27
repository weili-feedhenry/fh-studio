var App = App || {};
App.View = App.View || {};

App.View.CMSSection = App.View.CMS.extend({

  events: {
    'submit #configureSectionForm' : 'onSectionSave',
    'reset #configureSectionForm' : 'onSectionDiscard',
    'click btn-deletesection' : 'onDeleteSection',
    'focus input[name=publishdate]' : 'onPublishDateFocus',
    'click .btn-listfield-structure' : 'onListFieldEditStructure',
    'click .btn-listfield-data' : 'onListFieldEditData'
  },
  templates : {
    'cms_configureSection' : '#cms_configureSection',
    'cms_sectionExtraTabs' : '#cms_sectionExtraTabs'
  },
  initialize: function(options){
    this.$el = options.$el;
    this.options = options;
    this.collection = options.collection;
    this.compileTemplates();
  },
  render : function(){
    var self = this;

    var section = this.collection.findSectionByPath(this.options.section),
    field = false,
    path = section.path,
    fields, listData;

    if (this.options.field){
      // We're editing a field_list - retrieve it
      this.fieldList = _.findWhere(section.fields, { name : this.options.field });
      fields = this.fieldList && this.fieldList.fields;
      listData = this.fieldList && this.fieldList.data;
      if (!fields || !fields.length){
        alert('Error loading list fields'); //TODO: Modal
        return;
      }
      fields = this.massageFields(fields);
      path += ("." + field.name + "." + "Edit " + this.options.mode);
    }else{
      fields = this.massageFields(section.fields);
    }

    console.log("Section is " + section + " fields ",fields);

    if (!section || !fields){
      alert("Error loading section");
      console.log('Error finding section or fields on rendering section view');
      //TODO: Modal, fire up event?
    }

    // Save some data massaging
    this.fb = new Formbuilder(this.$el, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: fields,
      editStructure : this.options.editStructure || false
    });
    this.fb.on('save', function(payload){
      self.draft = payload;
    });

    // Add in the CMS specific breadcrumb on top of the middle section
    this.$el.find('.middle').prepend(this.cmsBreadcrumb(path));


    this.$el.find('.fb-tabs').append(this.templates.$cms_sectionExtraTabs());
    //TODO: Fix this and its selection..
    var parentOptions = this.collection.toHTMLOptions();
    parentOptions = ["<option value=''>-Root</option>"].concat(parentOptions);
    parentOptions = parentOptions.join('');
    this.$el.find('.fb-tab-content').append(this.templates.$cms_configureSection({ parentOptions : parentOptions }));
    // Select the active option
    this.$el.find('select[name=parentName]').val(section.parent);


    this.$el.find('#cmsAppPreview').append($('#app_preview').clone(true).show().width('100%'));

    return this;
  },
  massageFields : function(oldFields){
    var fields = [];
    _.each(oldFields, function(field){
      var newField = {};
      switch(field.type){
        case "string":
          newField.field_type = "text";
          break;
        case "list": // TODO
          newField.field_type = "field_list";
          break;
        default:
          newField.field_type = field.type;
          break;
      }
      newField.label = field.name;
      newField.value = field.value;
      fields.push(newField);
    });
    return fields;
  },
  onSectionSave : function(e){
    e.preventDefault();
    var vals = {};
    $($(e.target).serializeArray()).each(function(idx, el){
      vals[el.name] = el.value;
    });
    if (vals.publishRadio && vals.publishRadio === "now"){
      vals.publishdate = new Date(); // TODO: Maybe this should be handled on the user's computer?
    }
    vals.fields = this.fb.mainView.collection.toJSON();
    console.log(vals);
    //TODO: Dispatch to server

    return false;
  },
  onSectionDiscard : function(){
    this.render();
    //TODO: Discard draft on server
  },
  onSectionDelete : function(){
    // TODO: Delete section on server
  },
  onPublishDateFocus : function(){
    this.$el.find('#publishRadioLater').attr('checked', true);
  },
  setSection : function(section){
    this.options.section = section;
    this.render();
  },
  onListFieldEditStructure : function(e){
    this.onListFieldEdit(e, 'structure');

  },
  onListFieldEditData : function(e){
    this.onListFieldEdit(e, 'data');
  },
  onListFieldEdit : function(e, mode){
    var el = $(e.target),
    fieldName = el.data('name'),
    editStructure = (mode === 'structure'),
    options = { collection : this.collection, section : this.options.section, field : fieldName, mode : mode, editStructure : editStructure };
    this.trigger('edit_field_list', options);
  }
});