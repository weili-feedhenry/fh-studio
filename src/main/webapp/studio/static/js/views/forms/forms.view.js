var App = App || {};
App.View = App.View || {};


App.View.Forms = Backbone.View.extend({
  CONSTANTS: {
    FB : {
      FIELD_NAME : 'name',
      LABEL : 'name',
      FIELD_VALUE : 'fieldOptions.definition.defaultValue',
      FIELD_TYPE: 'type',
      DESCRIPTION: 'helpText',
      DESCRIPTION_TITLE : 'Instructions',
      MINREPITIONS: 'fieldOptions.definition.minRepeat',
      MAXREPITIONS: 'fieldOptions.definition.maxRepeat',
      REPEATING: 'repeating',
      VALIDATE_IMMEDIATELY: 'fieldOptions.validation.validateImmediately',
      OPTIONS : 'fieldOptions.definition.options',
      LENGTH_UNITS : 'fieldOptions.validation.units',
      MIN: 'fieldOptions.validation.min',
      MAX: 'fieldOptions.validation.max',
      MINLENGTH: 'fieldOptions.definition.min',
      MAXLENGTH: 'fieldOptions.definition.max',
      INCLUDE_OTHER: 'fieldOptions.definition.include_other_option',
      INCLUDE_BLANK: 'fieldOptions.definition.include_blank_option',
      SINGLE_CHECKED: 'fieldOptions.definition.checked',
      FIELD_OPTIONS : 'fieldOptions',
      FIELD_FORMAT_MODE : 'fieldOptions.validation.field_format_mode',
      FIELD_FORMAT_STRING : 'fieldOptions.validation.field_format_string',
      LOCATION_UNIT: 'fieldOptions.definition.locationUnit',
      DATETIME_UNIT: 'fieldOptions.definition.datetimeUnit',
      FILE_SIZE : 'fieldOptions.definition.file_size',
      PHOTO_HEIGHT: 'fieldOptions.definition.photoHeight',
      PHOTO_WIDTH: 'fieldOptions.definition.photoWidth',
      PHOTO_QUALITY: 'fieldOptions.definition.photoQuality',
      TIME_AUTOPOPULATE: 'fieldOptions.definition.timeAutopopulate',
      VALUE : 'fieldOptions.definition.defaultValue',
      REQUIRED : 'required',
      VALUE_HEADER : 'Default Value',
      TYPE_ALIASES : {
        'paragraph' : 'textarea',
        'website' : 'url',
        'price' : 'money',
        'section_break' : 'sectionBreak',
        'email' : 'emailAddress',
        'autodate' : 'dateTime',
        'map' : 'locationMap'
      },
      SUPPORTED_FIELDS : [ 'text', 'paragraph', 'number', 'email', 'website', 'dropdown', 'radio', 'checkboxes', 'location', 'map', 'file', 'photo', 'signature', 'autodate', 'section_break', 'page_break' ]
    },
    FORM: {
      NAME: 'name',
      DESC: 'description',
      UPDATED: 'lastUpdated',
      USING: 'appsUsingForm',
      SUBSTODAY: 'submissionsToday',
      SUBS: 'submissionsTotal',
      PAGES: 'pages',
      FIELDS: 'fields',
      PAGE_BREAK: 'page_break'
    },
    THEME : {
      NAME : 'name',
      UPDATED : 'lastUpdated',
      USING: 'appsUsingTheme',
      COLOURS : 'colours',
      DESCRIPTIONS : {
        "headerBar": "Header Bar",
        "navigationBar": "Navigation Bar",
        "body": "Body",
        "form": "Form Area",
        "forms": "Form Area",
        "fieldArea": "Field Area",
        "fieldInput": "Field Input",
        "fieldInstructions": "Field Instructions",
        "error": "Error",
        "progress_steps": "Progress Steps Area",
        "progress_steps_number_container": "Progress Steps Number Area",
        "progress_steps_number_container_active": "Progress Steps Number Area (Selected)",
        "field_required": "Required Icon",
        "section_area": "Section Area",
        "navigation": "Navigation",
        "navigation_active": "Navigation (Selected)",
        "action": "Action",
        "action_active": "Action (Active)",
        "cancel": "Cancel",
        "cancel_active": "Cancel (Active)",
        "title": "Title",
        "description" : "Description",
        "page_title": "Page Title",
        "page_description": "Page Description",
        "fieldTitle": "Field Title",
        "fieldInput": "Field Input",
        "instructions": "Instructions",
        "buttons": "Buttons",
        "buttons_active": "Buttons (Selected)",
        "section_break_title": "Section Break Title",
        "section_break_description": "Section Break Description"



      },
      TYPOGRAPHY : 'typography',
      BORDERS : 'borders',
      BUTTONS : 'buttons',
      LOGO : 'logo'
    },
    FORMSAPP : {
      NAME : 'title',
      VERSION : 'version',
      UPDATED : 'modified',
      FORMS : 'forms',
      THEMENAME : 'theme.name',
      APP_CONFIG: 'config'
    },
    GROUPS: {
      NAME: 'name'
    },
    FIELD_RULES : {
      "dateTime": ["is at", "is before", "is after"],
      "dropdown": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
      "text": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
      "emailAddress": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
      "number": ["is equal to", "is greater than", "is less than"],
      "textarea": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
      "checkboxes":["is","is not"],
      "radio": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
      "url":["is", "is not", "contains", "does not contain", "begins with", "ends with"]
    },
    "EXCLUDED_FIELD_TYPES" : ["file","photo","signature","location"],
    "EXCLUDED_SEARCH_FIELD_TYPES":["file","photo","signature"],
    "ALL_FIELD_TYPES":["text", "textarea", "number", "emailAddress", "dropdown", "radio", "checkboxes", "location", "locationMap", "photo", "signature", "file", "dateTime", "sectionBreak", "matrix"]
  },



  initialize: function(){
    this.compileTemplates();
    // For all forms views apply form builder field mappings
    _.each(this.CONSTANTS.FB, function(val, key){
      Formbuilder.options.mappings[key] = val;
    });

   this.formsCollection = new App.Collection.Form();

  },
  breadcrumb : function(trail){
    var crumbs = [],
    crumbEl = $('#forms_layout ul.breadcrumb');
    _.each(trail, function(crumb, index, list){
      if (index === list.length-1){
        crumbs.push('<li class="active">' + crumb  + '</li>');
      }else{
        crumbs.push('<li><a href="#">' + crumb + '</a> <span class="divider">/</span></li>');
      }
    });
    crumbEl.html(crumbs.join(''));
    return crumbEl;
  },
  modal : function(msg, title){
    title = title || 'Confirm';
    this.modalView = new App.View.Modal({
      body : msg,
      title : title,
      cancelText : false
    });
    this.$el.append(this.modalView.render().$el);
  },
    formToFormBuilderFields : function(form){
    var self = this,
    pages = form.get(this.CONSTANTS.FORM.PAGES),
    fields = [];
    pages.each(function(p, i){
      fields.push({ name :p.get('name'), value : '', cid :p.get('_id'), _id :p.get('_id'), type : self.CONSTANTS.FORM.PAGE_BREAK });
      _.each(p.get(self.CONSTANTS.FORM.FIELDS), function(f, i){
        fields.push(f);
      });
    });
    return fields;
  },
  message : function(msg, cls){
    cls = cls || 'success';
    msg = msg || 'Save successful';

    var form_message = Handlebars.compile($('#form_message').html()),
    alertBox = $(form_message({ cls : cls, msg : msg })),
    el = $('#forms_container');
    $(el).prepend(alertBox);

    // Fade out then remove our message
    setTimeout(function(){
      alertBox.fadeOut('fast', function(){
        alertBox.remove();
      });
    }, 3000);
  }
});