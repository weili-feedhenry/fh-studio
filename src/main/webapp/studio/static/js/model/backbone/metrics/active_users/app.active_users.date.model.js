App.Model.AppActiveUsersDate = Backbone.Model.extend({});

App.Collection.AppActiveUsersDate = App.Collection.Metrics.extend({
  model: App.Model.AppActiveUsersDate,
  metric: 'apptransactionsdest',
  url: "/beta/static/mocks/metrics/app_active_users_date.json",

  initialize: function(options) {
    var self = this;
    if (options) {
      this.total = options.total || false;
    } else {
      this.total = false;
    }

    // React to datepicker date changes
    App.vent.on('app-analytics-datechange', function(e) {
      self.from = e.from;
      self.to = e.to;
      self.fetch();
    });
  },

  parse: function(response) {
    var data = response.payload.results;

    if (this.total) {
      return this.parseTotal(data);
    } else {
      return this.parseMultiSeries(data);
    }
  },

  parseTotal: function(data) {
    var self = this;

    // k: timestamp
    // v: accumulated values for ts
    var values = {};
    var parsed = [];

    _.each(data, function(row) {
      var ts = row._id.ts;
      if (!_.has(values, ts)) {
        values[ts] = {
          total: 0
        };
      }

      _.each(row.value, function(v, k) {
        values[ts].total = v + values[ts].total;
      });
    });

    var series = {
      name: 'Total',
      data: []
    };
    parsed.push(series);

    _.each(values, function(v, k) {
      parsed[0].data.push([parseInt(k, 10), v.total]);
    });

    return parsed;
  },

  parseMultiSeries: function(data) {
    var self = this;
    var parsed = [];
    var values = {};

    _.each(data, function(row) {
      var ts = row._id.ts;
      _.each(row.value, function(v, k) {
        if (!_.has(values, k)) {
          values[k] = {
            data: []
          };
        }
        values[k].data.push([ts, v]);
      });
    });

    // Post process
    _.each(values, function(v, k) {
      var series = {
        name: self._labelForKey(k),
        data: v.data,
        color: self._colourForKey(k)
      };
      parsed.push(series);
    });

    return parsed;
  },

  toJSON: function() {
    var options = _.clone(this.options) || {};
    options = Backbone.Collection.prototype.toJSON.call(this);
    return options;
  }
});