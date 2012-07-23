var Admin = Admin || {};

Admin.Users = Admin.Users || {};

Admin.Users.Controller = Controller.extend({
  models: {
    user: new model.User(),
    role: new model.Role(),
    group: new model.Group()
  },

  views: {
    users: "#useradmin_user_list",
    user_create: "#useradmin_user_create",
    user_update: "#useradmin_user_update",
    user_import: "#useradmin_user_import"
  },

  container: null, // keeps track of currently active/visible container

  alert_timeout: 10000,

  user_table: null,

  init: function(params) {
    var self = this;
    params = params || {};
    this.field_config = params.field_config || null;
  },

  show: function (e) {
    this.showUsersList();
  },

  pageChange: function() {
    this.bindUserControls();
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  // type: error|success|info
  showAlert: function (type, message) {
    var self = this;
    var alerts_area = $(this.container).find('#alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        alert.slideUp(function () {
          alert.remove();
        });
      }, self.alert_timeout);
    }
  },

  showUsersList: function() {
    var self = this;
    this.hide();
    $(this.views.users).show();
    this.container = this.views.users;

    this.models.user.list(function(res) {
      var data = self.addControls(res);
      self.renderUserTable(data);
      self.bindUserControls();
    }, function(err) {
      Log.append('Error showing users');
    }, true);
  },

  bindUserControls: function() {
    var self = this;
    $('tr td .edit_user', this.user_table).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.userDataForRow($(this).parent().parent().get(0));
      self.showUserUpdate(this, row, data);
      return false;
    });
    $('tr td .delete_user', this.user_table).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.userDataForRow($(this).parent().parent().get(0));
      self.deleteUser(this, row, data);
      return false;
    });
  },

  resendInvite: function() {
    var email = $(this.views.user_update).find('.user_email').val();

    this.models.user.resendInvite(email, function(res) {
      Log.append('User invite re-sent OK.');
      $fw.client.dialog.info.flash('Successfully re-sent invite.');
    }, function(e) {
      $fw.client.dialog.error("Error sending invite");
    });
  },

  showUserUpdate: function(button, row, data) {
    var self = this;
    this.hide();

    var parent = $(this.views.user_update);
    this.container = this.views.user_update;

    var clearForm = function () {
      $('input[type=text],input[type=email],input[type=password]', parent).val('');
      $('input[type=checkbox]', parent).removeAttr('checked');
      $('input,select,button', parent).attr('disabled', 'disabled');
      self.clearSwapSelect(parent);
    };

    var populateForm = function (results) {
      Log.append('populating user update form');
      var user = results[0];
      $('#update_user_id', parent).val(user.username);
      $('#update_user_name', parent).val(user.name);
      $('#update_user_email', parent).val(user.email);

      // setup enabled/blacklisted checkboxes and buttons
      self.setUserEnabled(user.enabled);
      self.setUserBlacklisted(user.blacklisted);

      // no need to show sub role
      var rolesTo = user.roles;
      if (rolesTo.indexOf('sub') > -1) {
        rolesTo.splice(rolesTo.indexOf('sub'), 1);
      }
      self.updateSwapSelect('#update_user_role_swap', results[1], rolesTo);
      self.updateSwapSelect('#update_user_group_swap', results[2], user.groups);
      self.bindSwapSelect(parent);

      $('input,select,button', parent).not('#update_user_id,#update_user_enabled,#update_user_blacklisted').removeAttr('disabled');
    };

    clearForm();
    parent.show();

    $('.update_user_btn', parent).unbind().click(function() {
      self.updateUser();
      return false;
    });

    $('.invite_user_btn', parent).unbind().click(function() {
      self.resendInvite();
      return false;
    });

    // Setup user details, roles and groups
    var id = data[0];
    async.parallel([function (cb) {
      // user details
      self.models.user.read(id, function(res) {
        Log.append('User read OK.');
        return cb(null, res.fields);
      }, function(e) {
        return cb(e);
      });
    }, function (cb) {
      // roles
      self.models.role.list_assignable(function(res) {
        Log.append('Role list OK.');
        return cb(null, res.list);
      }, function(e) {
        return cb(e);
      });
    }, function (cb) {
      // groups
      self.models.group.list(function(res) {
        Log.append('Group list OK.');
        return cb(null, res.list);
      }, function(e) {
        return cb(e);
      });
    }], function (err, results) {
      if (err != null) {
        return self.showAlert('error', '<strong>Error loading user data</strong> ' + err);
      }
      return populateForm(results);
    });
  },

  updateUser: function() {
    var self = this;

    var form = $(this.views.user_update + ' form');
    var fields = {};

    // required fields first
    // text inputs
    fields.username = form.find('#update_user_id').val();
    // checkbox fields
    fields.enabled = form.find('#update_user_enabled').is(':checked');
    fields.blacklisted = form.find('#update_user_blacklisted').is(':checked');

    // optional fields
    // text inputs
    var password = form.find('#update_user_password').val();
    if (password !== '') {
      fields.password = password;
    }
    var email = form.find('#update_user_email').val();
    if (email !== '') {
      fields.email = email;
    }
    var name = form.find('#update_user_name').val();
    if (name !== '') {
      fields.name = name;
    }
    // select fields
    var rolesArr = [];
    $('#update_user_role_swap .swap-to option', this.views.user_update).each(function (i, item) {
      rolesArr.push($(item).text());
    });
    if (rolesArr.length > 0 ) {
      fields.roles = rolesArr.join(', ');
    }
    var groupsArr = [];
    $('#update_user_group_swap .swap-to option', this.views.user_update).each(function (i, item) {
      groupsArr.push($(item).text());
    });
    if (groupsArr.length > 0) {
      fields.groups = groupsArr.join(', ');
    }

    this.models.user.update(fields, function(res) {
      Log.append('updateUser: OK');
      self.showUsersList();
      self.showAlert('success', '<strong>User successfully updated</strong> (' + res.fields.username + ')');
    }, function(err) {
      Log.append(err);
      self.showAlert('error', '<strong>Error updating User</strong> ' + err);
    });
  },

  emailFromRow: function(row) {
    return $('td:first', row).text() || null;
  },

  fieldsFromRow: function(row, data_model) {
    var self = this;
    var fields = {};
    $('td', row).each(function(i, td) {
      // Check editable
      if (data_model.field_config[i] && data_model.field_config[i].editable) {
        // Check Checkbox
        var checkbox = $(td).find('input[type=checkbox]');

        if (checkbox.length > 0) {
          var val = $(checkbox).is(":checked");
          fields[data_model.field_config[i].field_name] = val;
        } else {
          fields[data_model.field_config[i].field_name] = $('input', td).val();
        }
      }
    });

    return fields;
  },

  renderUserTable: function(data) {
    var self = this;

    this.user_table = $('#useradmin_users_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });

    // Inject Import and Create button
    var import_button = $('<button>').addClass('btn pull-right import_users').text('Import Users').click(function() {
      self.showImportUsers();
      return false;
    });
    var create_button = $('<button>').addClass('btn btn-primary pull-right').text('Create').click(function() {
      self.showCreateUser();
      return false;
    });
    $(this.views.users + ' .span12:first').append(create_button).append(import_button);
  },

  showCreateUser: function() {
    var self = this;
    this.hide();
    $(this.views.user_create).show();
    this.container = this.views.user_create;

    $(this.views.user_create + ' .create_user_btn').unbind().click(function() {
      self.createUser();
      return false;
    });

    // initialise all swap selects
    self.bindSwapSelect(this.container);

    // Load roles & Groups into swap select
    this.models.role.list_assignable(function(res) {
      Log.append('Role list OK.');
      var roles = res.list;
      var container = '#create_user_role_swap';
      self.updateSwapSelect(container, roles);
    }, function(e) {
      self.showAlert('error', '<strong>Error loading Roles</strong> ' + e);
    });

    this.models.group.list_assignable(function(res) {
      Log.append('Group list OK.');
      var groups = res.list;
      var container = '#create_user_group_swap';
      self.updateSwapSelect(container, groups);
    }, function(e) {
      self.showAlert('error', '<strong>Error loading Groups</strong> ' + e);
    });
  },

  showImportUsers: function () {
    var self = this;
    this.hide();

    $(this.views.user_import).show();
    this.container = this.views.user_import;

    $(this.views.user_import + '.import_user_btn').unbind().click(function() {
      self.importUsers();
      return false;
    });
  },

  createUser: function() {
    var self = this;

    var form = $(this.views.user_create + ' form');

    var id = form.find('#create_user_id').val();
    var password = form.find('#create_user_password').val();
    if (password === '') {
      password = null;
    }
    var email = form.find('#create_user_email').val();
    if (email === '') {
      email = null;
    }
    var name = form.find('#create_user_name').val();
    if (name === '') {
      name = null;
    }
    var invite = form.find('#create_user_invite').is(':checked');

    var rolesArr = [];
    $('#create_user_role_swap .swap-to option', this.views.user_create).each(function (i, item) {
      rolesArr.push($(item).text());
    });
    var roles = rolesArr.length > 0 ? rolesArr.join(', ') : null;

    var groupsArr = [];
    $('#create_user_group_swap .swap-to option', this.views.user_create).each(function (i, item) {
      groupsArr.push($(item).text());
    });
    var groups = groupsArr.length > 0 ? groupsArr.join(', ') : null;

    var activated = true;
    this.models.user.create(id, email, name, roles, groups, password, activated, invite, function(res) {
      console.log(res);
      self.showUsersList();
    }, function(e) {
      self.showAlert('error', '<strong>Error creating user</strong> ' + e);
    });
  },

  importUsers: function () {
    // TODO: validate fields and call import endpoint
    alert('IMPLEMENT IMPORT USERS!!!');
  },

  rowRender: function(row, data) {
    this.renderCheckboxes(row, data);
  },

  renderCheckboxes: function(row, data) {
    $('td', row).each(function(i, item) {
      // TODO: Move to clonable hidden_template
      if (data[i] === true) {
        $(item).html('<input type="checkbox" checked disabled/>');
      }

      if (data[i] === false) {
        $(item).html('<input type="checkbox" disabled/>');
      }
    });
  },

  userDataForRow: function(el) {
    return this.user_table.fnGetData(el);
  },

  addControls: function(res) {
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      // TODO: Move to clonable hidden_template
      controls.push('<button class="btn edit_user">Edit</button>&nbsp;');
      controls.push('<button class="btn btn-danger delete_user">Delete</button>');
      row.push(controls.join(""));
    });
    return res;
  },

  showBooleanModal: function (msg, success) {
    var modal = $('#useradmin_user_boolean_modal').clone();
    modal.find('.modal-body').html(msg).end().appendTo($("body")).modal({
      "keyboard": false,
      "backdrop": "static"
    }).find('.btn-primary').unbind().on('click', function () {
      // confirmed delete, go ahead
      modal.modal('hide');
      success();
    }).end().on('hidden', function() {
      // wait a couple seconds for modal backdrop to be hidden also before removing from dom
      setTimeout(function () {
        modal.remove();
      }, 2000);
    });
  },

  setUserEnabled: function (enabled) {
    var self = this;
    if (enabled) {
      $('#update_user_enabled').attr('checked', 'checked');
      $('.enable_user_button').text('Disable User').unbind().on('click', function () {
        self.disableUser();
      });
    } else {
      $('#update_user_enabled').removeAttr('checked');
      $('.enable_user_button').text('Enable User').unbind().on('click', function () {
        self.enableUser();
      });
    }
  },

  setUserBlacklisted: function (blacklisted) {
    var self = this;
    if (blacklisted) {
      $('#update_user_blacklisted').attr('checked', 'checked');
      $('.blacklist_user_button').text('Whitelist User').unbind().on('click', function () {
        self.whitelistUser();
      });
    } else {
      $('#update_user_blacklisted').removeAttr('checked');
      $('.blacklist_user_button').text('Blacklist User').unbind().on('click', function () {
        self.blacklistUser();
      });
    }
  },

  deleteUser: function(button, row, data) {
    var self = this;
    self.showBooleanModal('Are you sure you want to delete this User?', function () {
      self.showAlert('info', '<strong>Deleting User</strong> This may take some time.');
      // delete user
      var email = data[1];
      self.models.user.remove(email, function(res) {
        self.showAlert('success', '<strong>User Successfully Deleted</strong>');
        // remove user from table
        self.user_table.fnDeleteRow(row[0]);
      }, function(e) {
        self.showAlert('error', '<strong>Error Deleting User</strong> ' + e);
      });
    });
  },

  enableUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to enable this User?', function () {
      self.changeBooleanField('enabled', true, 'Enabling', function () {
        self.setUserEnabled(true);
      });
    });
  },

  disableUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to disable this user? This user will no longer be able to authenticate.', function () {
      self.changeBooleanField('enabled', false, 'Disabling', function () {
        self.setUserEnabled(false);
      });
    });
  },

  blacklistUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to Blacklist this User? (In supported apps, data will be purged at next login.)', function () {
      self.changeBooleanField('blacklisted', true, 'Blacklisting', function () {
        self.setUserBlacklisted(true);
      });
    });
  },

  whitelistUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to Whitelist this User?', function () {
      self.changeBooleanField('blacklisted', false, 'Whitelisting', function () {
        self.setUserBlacklisted(false);
      });
    });
  },

  changeBooleanField: function (boolField, boolVal, actionDesc, success) {
    var self = this;
    var form = $(self.views.user_update + ' form');
    var fields = {
      "username": form.find('#update_user_id').val()
    };
    fields[boolField] = boolVal;

    self.showAlert('info', '<strong>' + actionDesc + ' User</strong> (' + fields.username + ')');
    self.models.user.update(fields, function(res) {
      Log.append(actionDesc + ' User OK');
      self.showAlert('success', '<strong>' + actionDesc + ' User successful</strong> (' + fields.username + ')');
      success();
    }, function(err) {
      Log.append(err);
      self.showAlert('error', '<strong>Error ' + actionDesc + ' User</strong> ' + err);
    });
  }
});