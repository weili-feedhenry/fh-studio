App.Model.AppInstallsDate = Backbone.Model.extend({});

App.Collection.AppInstallsDate = App.Collection.Metrics.extend({
  model: App.Model.AppInstallsDate,
  metric: "appinstallsdest",
  url: "/beta/static/mocks/metrics/app_installs_date.json",

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

    // Sort by timestamp
    _.each(parsed, function(item) {
      var unsorted_data = item.data;
      var sorted_data = _.sortBy(unsorted_data, function(d) {
        // ts
        return d[0];
      });
      item.data = sorted_data;
    });

    return parsed;
  },

  toJSON: function() {
    var options = _.clone(this.options) || {};
    options = Backbone.Collection.prototype.toJSON.call(this);
    return options;
  }
});