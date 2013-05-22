App.View.ProjectAppAnalyticsClientInstallsByDate = App.View.LineChart.extend({
  defaultOptions: {
    total: false,
    chart: {
      width: 350,
      height: 300
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
        month: '%e. %b',
        year: '%b'
      }
    },
    title: {
      text: 'Installs by Date'
    }
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppInstallsDate({
      total: options.total
    });
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