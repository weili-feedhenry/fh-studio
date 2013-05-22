App.View.ProjectAppAnalyticsClientStartupsByDate = App.View.LineChart.extend({
  defaultOptions: {
    chart: {
      width: 350,
      height: 300
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        month: '%e. %b',
        year: '%b'
      }
    },
    title: {
      text: 'Startups by Date'
    }
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppStartupsDate();
    var from = App.views.picker.currentFrom();
    var to = App.views.picker.currentTo();
    this.collection.fetch({
      from: from,
      to: to
    });
    options.collection = this.collection;
    App.View.LineChart.prototype.initialize.call(this, options);
  }
});