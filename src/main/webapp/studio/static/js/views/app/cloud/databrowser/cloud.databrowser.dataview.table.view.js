App.View.DataBrowserTable = App.View.DataBrowserView.extend({
  templates : {
    databrowserNavbar : '#databrowserNavbar',
    databrowserDataViewBarItems: '#databrowserDataViewBarItems',
    dataviewEditButton : '#dataviewEditButton',
    dataviewSaveCancelButton : '#dataviewSaveCancelButton',
    dataviewPagination : '#dataviewPagination',
    databrowserDataViewBarCollectionMenuItem : '#databrowserDataViewBarCollectionMenuItem',
    dataviewEmptyContainer : '#dataviewEmptyContainer',
    dataviewEmptyContent : '#dataviewEmptyContent',
    dataviewLoadingContent : '#dataviewLoadingContent'
  },
  events : {
    'click table.databrowser .btn-save' : 'onRowSave',
    'click table.databrowser .btn-cancel' : 'onRowCancel',
    'dblclick table.databrowser tr.trow' : 'onRowDoubleClick',
    'click table.databrowser tr.trow' : 'onRowClickProxy',
    'click table.databrowser .td-checkbox input[type=checkbox]' : 'onRowSelection',
    'keyup table.databrowser td.field input' : 'onRowDirty',
    'change table.databrowser td.field select' : 'onRowDirty',
    'click table.databrowser tr .btn-edit-inline' : 'onEditRow',
    'click table.databrowser tr .btn-delete-row' : 'onRowDelete',
    'click .btn-add-row' : 'onAddRow',
    'click .btn-refresh-collection' : 'onRefreshCollection',
    'click .btn-trash-rows' : 'onMultiDelete',
    'click .btn-filter' : 'onFilterToggle'
  },
  headings: undefined,
  types : undefined,
  editable : true,
  selectable : true,
  dblClicked: undefined,
  initialize : function(options){
    var self = this;
    this.model = options.model;
    this.collections = options.collections;

    this.collection = options.collection;
    this.collection.bind('reset', this.render, this);
    // No sync event is bound *intentionally* - we modify the table in place to prevent nasty refreshes, loosing the user's scroll position etc

    //this.collection.bind('redraw', this.renderCollections);
    this.compileTemplates();
  },
  render: function() {
    this.$el.empty();

    var collectionsHTML = [];
    for (var i=0; i<this.collections.length; i++){
      var c = this.collections[i];
      collectionsHTML.push(this.templates.$databrowserDataViewBarCollectionMenuItem(c));
    }
    var filters = new App.View.DataBrowserFilters().render().$el.html(),
    navItems = this.templates.$databrowserDataViewBarItems({filters : filters, collections : collectionsHTML.join('')}),
    nav = this.templates.$databrowserNavbar({ brand : this.model.get('name'), class : 'databrowsernav', baritems : navItems }),
    data = this.collection.toJSON(),
    table = this.buildTable(data, false);

    this.$el.append(nav);
    this.$el.append(table);

    var pagination = new App.View.DataBrowserDataViewPagination({collection : this.collection});
    this.$el.append(pagination.render().el);

    return this;
  },
  /*
   Draws a HTML table from some data
   This is part of the FeedHenry mBaaS suite repurposed for this portal
   */
  buildTable : function(entries){
    var self = this,
    table = $('<table></table>'),
    tbody = $('<tbody></tbody>'),
    tableContainer = $('<div class="databrowserTableContainer"></div>'),
    thead;

    if (entries.length <= 0){
      var emptyContent = (this.loaded) ? this.templates.$dataviewEmptyContent() : new App.View.Spinner().render().$el.html();
      return $(this.templates.$dataviewEmptyContainer( { content : emptyContent } ));
    }

    // Add in the collection name to the table element
    table.data('collection', this.model.get('name'));

    thead = this.buildHeadings(entries);

    // Iteration 2: We know every possible heading, now we can draw every table cell, even the important blanks
    for (var j=0; j<entries.length; j++){
      var row = this.row(entries[j]);
      tbody.append(row);
    }

    table.append(thead);
    table.append(tbody);
    table.addClass('databrowser table table-condensed table-bordered');
    tableContainer.append(table);
    return tableContainer;
  },
  buildHeadings : function(entries){
    this.headings = [];
    this.types = [];
    // Iteration 1: Build a picture of every possible heading, append the THes
    var thead = $('<thead></thead>'),
    theadtr = $('<tr></tr>');

    if (this.selectable){
      theadtr.append('<th data-type="" class="th-checkbox readOnly"></th>');
    }

    for (var i=0; i<entries.length; i++){
      var row = entries[i].fields;
      if (!row){
        continue;
      }
      for (var key in row){
        if (row.hasOwnProperty(key)){
          var heading = key,
          type = typeof row[key];
          if (this.headings.indexOf(heading)===-1){
            theadtr.append('<th data-type="' + type + '" class="th-' + heading + '">' + heading + '</th>');
            this.headings.push(heading);
            this.types.push(type);
          }
        }
      }
    }
    // TH appends not working
    if (this.editable){
      theadtr.append('<th class="th-edit"></th>');
    }
    thead.append(theadtr);
    return thead;
  },
  row : function(document){
    // For this entry, append the TDs
    var row = document.fields,
    guid = document.guid;

    var rowEl = $('<tr class="trow"></tr>').attr('id', guid);

    if (this.selectable){
      $(rowEl).append('<td class="td-checkbox"><input type="checkbox"></td>');
    }

    for (var k=0; k<this.headings.length; k++){
      var td = $("<td></td>"),
      heading = this.headings[k],
      type = this.types[k],
      value = '';

      td.data('field', heading);
      td.data('type', type);
      td.addClass('field');
      td.addClass('field-' + heading);
      if (row.hasOwnProperty(heading)){
        value = row[heading];
      }else{
        td.addClass('emptyfield');
      }
      td.append('<span>' + value  + '</span>');

      $(rowEl).append(td);
    }
    if (this.editable){
      var editButton = $(this.templates.$dataviewEditButton());
      $(rowEl).append(editButton);
    }
    return rowEl;
  },
  deleteRow : function(tr, cb){
    var self = this,
    guid = tr.attr('id'),
    collectionName = tr.parents('table').data('collection'),
    model = this.collection.get(guid);
    this.collection.remove(model, {success : function(resp){
      cb(null, {ok : true});
    }});

  },
  /*
    Takes a reference to a TR and sets it to be editable
   */
  editRow : function(tr){
    var self = this,
    guid = tr.attr('id'),
    collection = $(tr).parents('table').data('collection'),
    saveCancelButton = $(this.templates.$dataviewSaveCancelButton());

    tr.addClass('editing');

    // Hide edit button, show save button

    var editButton = tr.find('.td-edit .btn-edit').hide();
    tr.find('.td-edit').append(saveCancelButton);


    tr.children('td.field').each(function(i, field){
      var type = $(field).data('type'),
      span = $(field).children('span'),
      input;

      if (!type || !span){
        return;
      }

      switch(type.toLowerCase()){
        case "boolean":
          input = $('<select><option value="true">true</option><option value="false">false</option></select>');
          break;
        default:
          input = $('<input type="text">');
          break;
      }
      input.attr('name', $(field).data('field'));
      input.css('width', $(field).width());
      input.val(span.html());
      $(field).append(input);
      span.hide();
    });

  },
  cancelRow : function(tr){
    // If it's a row that the user decided not to create, nuke it
    if (tr.hasClass('newrow')){
      tr.remove();
    }

    var tds = tr.children('td');
    tr.find('.btn-edit').show();
    tr.find('.btn-savecancel').remove();
    tr.find('.btn-group').show();

    tds.each(function(){
      if (!$(this).hasClass('readOnly') && $(this).children('span').length>0){
        $(this).children('span').show();
        $(this).children('input, select').remove();
      }else{
        $(this).children().show();
      }
    });

    tr.removeClass('editing dirty');
  },
  /*
    Cancels every row but this one
   */
  cancelOtherRows : function(clickedRow){
    var self  = this,
    editingRows = $('table.databrowser tr.editing'),
    dirtyRows = [];
    editingRows.each(function(){
      if ($(this).attr('id') !== $(clickedRow).attr('id')){
        if ($(this).hasClass('dirty')){
          dirtyRows.push(this);
        }else{
          self.cancelRow($(this));
        }
      }
    });
    if (dirtyRows.length > 0){
      this.onDirtyRowsCancel(dirtyRows);
    }
  },
  onDirtyRowsCancel : function(dirtyRows){
    var self = this;
    this.modalbox("You have unsaved edits to one or more rows - are you sure you want to discard?", function(ok){
      if (ok){
        for (var i=0; i<dirtyRows.length; i++){
          self.cancelRow($(dirtyRows[i]));
        }
      }else{
        return;
      }
    });
  },
  onRowSave : function(e){
    e.stopPropagation();
    var self = this,
    el = e.target,
    updatedObj = {},
    tr = $(el).parents('tr'),
    table = $(tr).parents('table'),
    collectionName = table.data('collection'),
    guid = tr.attr('id'),
    model = this.collection.get(guid);

    tr.children('td.field').each(function(i, fieldtd){
      if ($(fieldtd).hasClass('emptyfield') && !$(fieldtd).hasClass('dirty')){
        return;
      }
      $(fieldtd).removeClass('dirty emptyfield');

      var curInp = $(fieldtd).children('input, select'),
      val = curInp.val(),
      name = curInp.attr('name'),
      span = $(fieldtd).children('span');

      if (curInp.attr('type') === 'select'){
        val = (val === "true");
      }

      $(span).html(val);
      updatedObj[name] = val;
    });

    function _succ(model, options){
      // modify the row in place to be as it should any of the other rows that exist in the DB
      // that is, it's ID is a GUID and it doesn't have a newrow class
      tr.attr('id', model.guid);
      tr.removeClass('newrow');
      self.cancelRow(tr);
    }

    // If this is a new row, it's a create we need to do - not update
    if (!guid || $(tr).hasClass('newrow')){
      model = this.collection.create({fields : updatedObj}, { success : _succ });
    }else{
      model.set('fields', updatedObj);
      model.save(null, { success : _succ });
    }
  },
  // Cancel button pressed in the studio - find the relevant TR and pass it to the cancel function
  onRowCancel: function(e){
    e.stopPropagation();
    var el = e.target,
    tr = $(el).parents('tr');
    if (tr.hasClass('dirty')){
      this.onDirtyRowsCancel([tr]);
    }else{
      this.cancelRow(tr);
    }
  },
  onRowSelection : function(e){
    e.stopPropagation();
    var el = e.target,
    tr = $(el).parents('tr');
    if($(el).attr('checked')) {
      tr.addClass('info');
      this.$el.find('.btn-trash-rows').removeClass('disabled');
    }else{
      tr.removeClass('info');
      if (this.$el.find('table tr.info').length<1){
        this.$el.find('.btn-trash-rows').addClass('disabled');
      }
    }
  },
  onRowDoubleClick : function(e){
    var self = this,
    el = e.target;
    setTimeout(function(){
      self.dblClicked = false;
      $(el).find('input, select').focus(); // Focus the  freshly created field we double clicked
    }, 200);
    this.onEditRow(e);
    this.dblClicked = true;
  },
  onEditRow: function(e){
    e.stopPropagation();

    // Remove open class for the button group we just clicked
    $(e.target).parents('.btn-group.open').removeClass('open');


    var self = this,
    element = e.target,
    tr = $(element).parents('tr');

    if (tr.hasClass('editing')){
      return;
    }
    this.editRow($(tr));
    this.cancelOtherRows(tr);
  },
  /*
    Proxys onclick events to ensure they aren't triggered if we doubleclick
   */
  onRowClickProxy: function(e){
    var self = this,
    ev = e;
    setTimeout(function(){
      if (self.dblClicked){
        return;
      }
      self.dblClicked = false;
      self.onRowClick(ev);
    }, 100);
  },
  onRowClick : function(e){
    var clickedRow = $(e.target).parents('tr');
    this.cancelOtherRows(clickedRow);
  },
  onRowDirty : function(e){
    var td = $(e.target).parents('td'),
    tr = $(e.target).parents('tr');
    tr.addClass('dirty warning');
    td.addClass('dirty');
  },
  onRowDelete : function(e){
    e.stopPropagation();
    var el = e.target,
    tr = $($(el).parents('tr'));
    this.onRowOrRowsDelete([tr]);
  },
  onMultiDelete : function(e){
    e.stopPropagation();
    var trs = this.$el.find('tr.info');
    this.onRowOrRowsDelete(trs);
  },
  onRowOrRowsDelete : function(trs){
    var self = this,
    rowMessage = (trs.length > 1) ? "these rows?" : "this row?",
    deleters = [];
    this.modalbox("Are you sure you want to delete " + rowMessage, function(ok){
      if (!ok){
        return;
      }
      for (var i=0; i<trs.length; i++){
        var tr = trs[i];
        (function(tr, self){
          deleters.push(function(cb){
            self.deleteRow($(tr), function(err, res){
              if (err){
                return cb(err);
              }
              tr.remove();
              return cb();
            });
          });
        })(tr, self);
      }

      async.parallel(deleters, function(err, res){
        if (err){
          return this.alertbox(err);
        }
        if (self.collection.length < 1){
          //Redraw the empty screen
          self.render();
        }
      });
    });
  },
  onAddRow : function(e){
    if (this.$el.find('table tr').length<1){
      return this.emptyCollectionRow();
    }

    var emptyRow = this.row({ fields : {}}),
    tbody = this.$el.find('table.databrowser tbody');
    emptyRow.addClass('newrow');
    tbody.prepend(emptyRow);

    this.editRow(emptyRow);// is this a ref to the row in-situe?
  },
  /*
    We're going to add a row to the empty (possibly non-existant) collection by adding a row-column pair 'field1 : value1'
    then trigger the advanced editor, allowing the user to edit it further..
   */
  emptyCollectionRow : function(){
    var self = this;
    this.collection.create({fields : { field1 : 'value1'}}, { success : function(method, model, options){
      //Trigger advanced editor
      self.render();
      self.$el.find('.btn-edit .btn-advanced-edit').click();
    }});
  },
  onRefreshCollection : function(cb){
    this.collection.fetch({reset : true, collection : this.model.get('name'), success : function(){
      if (typeof cb === 'function'){
        cb.apply(this, arguments);
      }
    }});
  },
  modalbox : function(msg, cb){
    this.modal  = new App.View.Modal({
      body : msg,
      ok : function(){
        cb(true);
      },
      cancel : function(){
        cb(false);
      }
    });
    this.$el.append(this.modal.render().$el);
  },
  alertbox : function(msg){
    this.modal  = new App.View.Modal({
      body : msg,
      cancelText : false
    });
    this.$el.append(this.modal.render().$el);
  },
  onFilterToggle : function(){
    var filters = this.$el.find('.filters');
    filters.collapse('toggle');

    // Unfortunate hack to allow the dropdown to function, without any glitch in the animation -
    // adding overflow:visible before animation completes screws it up
    if (filters.hasClass('in')){
      setTimeout(function(){
        filters.css({'overflow' : 'visible'});
      }, 300);
    }else{
      filters.css({'overflow' : 'hidden'});
    }
  }
});