var App = App || {};
App.View = App.View || {};

App.View.Rules = App.View.Forms.extend({

  FIELD_RULES: {
    "date": ["is on", "is before", "is after"],
    "select": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
    "text": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
    "emailAddress": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
    "number": ["is equal to", "is greater than", "is less than"],
    "textarea": ["is", "is not", "contains", "does not contain", "begins with", "ends with"]
  },
  //todo all the rules seem to be the same in wufoo so just have one set of rules?
  PAGE_RULES: {
    "date": ["is on", "is before", "is after"],
    "select": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
    "text": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
    "emailAddress": ["is", "is not", "contains", "does not contain", "begins with", "ends with"],
    "number": ["is equal to", "is greater than", "is less than"],
    "textarea": ["is", "is not", "contains", "does not contain", "begins with", "ends with"]
  },

  "EXCLUDED_FIELD_TYPES" : ["checkbox"],

  templates: {
    rulesTabs: '#formsRulesTab',
    addRule: '#fieldRuleTemplate',
    ruleResults: "#ruleResult",
    ruleDefinitions: '#ruleDefinitions',
    addedRuleCondition: '#addedRuleCondition',
    targetFieldSelect: '#targetPage'

  },

  events: {
    'click .createrule': 'createRule',
    'click .btn-add-condition': 'createCondition',
    'click .btn-remove-condition': 'removeCondition',
    'click .btn-remove-rule': 'removeRule',
    'click .btn-add-rule': 'createRule',
    'change .rulesFieldName': 'onFieldSelectChange',
    'change select.conditional': 'selectConditionalChange',
    'click .saverules' : 'saveRules'
  },

  aggreagateFields : function(type){
    this.fields = [{
      "name":"select a field",
      "type" :""
    }];
    var rules = ("field" == type) ? this.FIELD_RULES : this.PAGE_RULES;
    console.log("pages ", this.pages);
    for(var i=0; i < this.pages.length; i++){
      var page = this.pages.models[i];

      var pageFields = page.get("fields");
      for(var p=0; p < pageFields.length; p++){
        var fieldType = pageFields[p].type.trim();
        var repeating = pageFields[p].repeating;
        console.log("pagefield ", pageFields[p], "is repeating ", repeating);
        if(rules[fieldType] && this.EXCLUDED_FIELD_TYPES.indexOf(fieldType) == -1 && ! repeating){
          console.log("rules for this field type", rules[fieldType]);
          pageFields[p].rules = this.FIELD_RULES[fieldType];
          this.fields.push(pageFields[p]);
        }
      }
    }
  },

  aggreagateShowFields : function (){
    this.targetFields = [{
      "name":"select a field",
      "type" :""
    }];
    for(var i=0; i < this.pages.length; i++){
      var page = this.pages.models[i];

      var pageFields = page.get("fields");
      for(var p=0; p < pageFields.length; p++){
        var fieldType = pageFields[p].type.trim();
        this.targetFields.push(pageFields[p]);
      }
    }
  },

  removeRule: function (e) {
    var self = this;
    var ruleNumber = $(e.target).data("rulenum");
    var form = self.$el.find('#rule' + ruleNumber);
    var container = form.parent('.formRuleContainer');
    var ruleid = form.data("ruleid");
    container.remove();
    if (ruleid) {
      var model = self.collection.findWhere({"_id": ruleid});
      self.collection.remove(model, {
        "success": function () {

        },
        "error": function () {

        }});
    }
    return false;
  },

  createCondition : function (e){
    console.log("called createCondition");
    var self=this;
    var ruleCount =  self.$el.find('.rulesForm:visible').length;
    var formId = $(e.target).data("rulenum");
    var form = self.$el.find('#rule'+formId);
    var container = form.parent('.formRuleContainer');
    var ruleid = form.data("ruleid");
    var condNum = container.find('.rulesFieldName:visible').length;
    console.log("condition number ", condNum, "rule count ", ruleCount, "ruleform id ", formId);

    console.log(container);
    container.find('.condition').show().append(this.templates.$addedRuleCondition());
    //if there are previous conditions set the select to the same value
    var conditionalSelects = container.find('select.conditional');
    var conditionalOpts = container.find('select.conditional option');
    var prevVal = conditionalSelects.first().val();

    conditionalOpts.each(function (){
      if($(this).val() === prevVal){
        $(this).attr("selected",true);
      }else{
        $(this).attr("selected",false);
      }
    });

    container.find('.conditioncontainer').last().append("<div style=\"margin-top:6px;\" class=\"ruleDefintionContainer\" id='cond"+condNum+"'>" + this.templates.$ruleDefinitions({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount,"condNum":condNum}) + " </div>");
    container.find('.btn-add-condition').hide();
    container.find('.btn-add-condition').last().show();
    container.find('.btn-add-rule').hide().first().show();
    container.find('.btn-remove-rule').hide().first().show();
    conditionalSelects.unbind('change').bind('change',function (){
      var val = $(this).val();
      conditionalOpts.each(function (){
        if($(this).val() === val){
          $(this).attr("selected",true);
        }else{
          $(this).attr("selected",false);
        }
      });
    });
    console.log("delegating events");
    //self.delegateEvents();


  },





  formatPages: function (toFormat) {
    var pages = [];
    for (var i = 0; i < toFormat.length; i++) {
      var pn = i + 1;
      pages.push({"name": "page" + i + pn, "_id": toFormat.at(i).get("_id")});
    }
    return pages;
  },

  saveRules: function () {

    var rules = [];
    var self = this;
    var type;

    //go through each visible rule and build a new model for each need to check for existing rules and update them
    this.$el.find('.rule:visible').each(function (idx, form) {
      var form = $(form);
      type = form.data("type");
      var target = ("field" === type) ? "targetField" : "targetPage";
      var existingRule = self.collection.findWhere({"_id": form.data("ruleid")});

      var data = {
        "type": form.find('#targetAction option:selected').val(),
        "ruleConditionalOperator": form.find('select.conditional').val() || "and",
        "ruleConditionalStatements": []
      };

      var topLevelSourceField = form.find('select.rulesFieldName').first('.sourceField').find('option:selected').data("_id");
      var topLevelCondition = form.find('select.fieldConditionals').find('option:selected').val();
      var topLevelCheckedVal = form.find('input[name="checkedValue"]').val();

      data.ruleConditionalStatements.push({
        sourceField: topLevelSourceField,
        restriction: topLevelCondition,
        sourceValue: topLevelCheckedVal
      });


      form.find('div.conditioncontainer:visible').each(function () {
        var statement = {
          sourceField: $(this).find('.sourceField option:selected').data("_id"),
          restriction: $(this).find('select.fieldConditionals option:selected').val(),
          sourceValue: $(this).find('input[name="checkedValue"]').val()
        };
        data.ruleConditionalStatements.push(statement);
      });


      if ("field" == form.data("type")) {
        data["targetField"] = form.find('.targetField option:selected').data("_id");
      } else if ("page" == form.data("type")) {
        data["targetPage"] = form.find('.targetField option:selected').data("_id");
      }

      if (existingRule) {
        existingRule.set("type", data.type);
        existingRule.set("ruleConditionalStatements", data.ruleConditionalStatements);
        existingRule.set("ruleConditionalOperator", data.ruleConditionalOperator);
        existingRule.set(target, data[target]);
      } else {
        var rule;
        if("field" == type){
          rule = new App.Model.FieldRule(data);
        }else if("page" == type){
          rule = new App.Model.PageRule(data);
        }
        self.collection.add(rule);
      }
    });

    self.collection.sync("update", {"rules": self.collection, "formid": self.form.get("_id")}, {"success": function (data) {
      if("field" == type){
        self.options.form.set("fieldRules", data);
      }else if("page" == type){
        self.options.form.set("pageRules", data);
      }
      App.View.Forms.prototype.message('updated rules successfully');

    }
    ,"error":function (data){
        App.View.Forms.prototype.message('failed to update the rules');
    }});


  },

  onFieldSelectChange: function (e) {
    var self = this;
    var type = $(e.target).find('option').filter(':selected').data("type").trim();
    var rulesSelect = $(e.target).next('select');
    rulesSelect.empty();
    var conditionals = App.View.Forms.CONSTANTS.FIELD_RULES[type];
    if (!conditionals) {

    } else {
      var html = "";
      for (var i = 0; i < conditionals.length; i++) {
        html += "<option value='" + conditionals[i] + "'>" + conditionals[i] + "</option>";
      }
      console.log("html ", html);
      rulesSelect.append(html);
    }
  },

  removeCondition: function (e) {

    var condId = $(e.target).data("conditionnum");
    var container = this.$el.find('#cond' + condId).parent('.conditioncontainer');
    var ruleContainer = container.parent().prev('.ruleDefintionContainer');
    ruleContainer.find('.btn-add-condition').last().show();
    container.remove();
    this.delegateEvents();
  },


  renderExistingRules: function (rules, type, pages) {
    if (!rules || !type) {
      console.log("no rules passed");
      return;
    }

    var self = this;
    self.$el.find('.rulesContent').empty();
    var target = ("field" === type) ? "targetField" : "targetPage";
    rules = rules.toJSON();
    var pages = self.formatPages(pages);

    var ruleCount = self.$el.find('.rulesForm:visible').length;
    ruleCount = (ruleCount == 0) ? 1 : ruleCount;

    if (rules && rules.length > 0) {

      //each rule now has  ruleConditionalStatements and a ruleConditionalOperator
      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r];
        var fr = rules[r].ruleConditionalStatements;
        self.$el.find('.rulesContent').last().append(this.templates.$addRule({"fields": this.fields, "formType": type, "formId": self.form.get("_id"), ruleNum: ruleCount, ruleId: rule._id}));
        self.$el.find('#rule' + ruleCount + ' .ruleDefintionContainer').append(this.templates.$ruleDefinitions({"fields": this.fields, "formType": type, "formId": self.form.get("_id"), ruleNum: ruleCount}));
        self.$el.find('#rule' + ruleCount + ' .ruleResult').append(this.templates.$ruleResults({"fields": this.targetFields, "formType": type, "formId": self.form.get("_id"), ruleNum: ruleCount}));

        if (type == "page") {
          self.$el.find('select#targetField').replaceWith(this.templates.$targetFieldSelect({"pages": pages}));
        }
        var firstRule = fr[0];


        function setTargetField(rule) {
          var rFieldName = self.$el.find('select.rulesFieldName').last('.sourceField');
          rFieldName.find('option[data-_id="' + rule.sourceField + '"]').attr("selected", true);
          rFieldName.trigger("change");
        }

        function setFieldConditional(rule) {
          self.$el.find('select.fieldConditionals').last().find('option').each(function () {
            if ($(this).val() == rule.restriction) {
              $(this).attr("selected", true);
            } else {
              $(this).attr("selected", false);
            }
          });
        }

        function setValue(rule) {
          self.$el.find('input[name="checkedValue"]').last().val(rule.sourceValue);
        }


        setTargetField(firstRule);
        setFieldConditional(firstRule);
        setValue(firstRule);


        self.$el.find('select#targetAction option').each(function () {
          if ($(this).val() == rule.type) {
            $(this).attr("selected", true);
          } else {
            $(this).attr("selected", false);
          }
        });
        self.$el.find('select#targetField option').each(function () {
          if ($(this).data("_id") == rule[target]) {
            $(this).attr("selected", true);
          } else {
            $(this).attr("selected", false);
          }
        });
        for (var k = 1; k < fr.length; k++) {
          var form = self.$el.find('#rule' + ruleCount);
          var container = form.parent('.formRuleContainer');
          var condNum = container.find('.rulesFieldName').length;
          condNum++;
          form.find('div.condition').show().append(this.templates.$addedRuleCondition());
          form.find('select.conditional').last().find('option').each(function () {
            if ($(this).val() == rule.ruleConditionalOperator) {
              $(this).attr("selected", true);
            } else {
              $(this).attr("selected", false);
            }
          });

          form.find('.conditioncontainer').last().append("<div style=\"margin-top:6px;\" class=\"ruleDefintionContainer\" id='cond" + condNum + "'>" + this.templates.$ruleDefinitions({"fields": this.fields, "formType": "field", "formId": self.form.get("_id"), ruleNum: ruleCount, "condNum": condNum}) + " </div>");
          setFieldConditional(fr[k]);
          setTargetField(fr[k]);
          setValue(fr[k]);
        }
        ruleCount++;

      }
      self.$el.find('.btn-add-condition').hide().last().show();
      self.$el.find('.btn-add-rule').hide().last().show();
      self.delegateEvents();
    }
  }
});
