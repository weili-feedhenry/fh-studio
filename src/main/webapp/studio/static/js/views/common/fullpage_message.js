App.View.FullPageMessageView = Backbone.View.extend({
  templates : {
    emptyFullpageContainer : '#emptyFullpageContainer',
    fullpageEmptyContent : '#fullpageEmptyContent'
  },
  events : {
    'click button.btn-messageView' : 'onButtonClick'
  },
  initialize : function(options){
    this.compileTemplates();
    this.options = options || { message : 'An error has occured with the Data Browser', button : false };
  },
  render: function() {
    this.$el.empty();
    var messageView = $(this.templates.$fullpageEmptyContent(this.options));
    container = $(this.templates.$emptyFullpageContainer());

    if (this.options && this.options.button === false){
      messageView.find('button').remove();
    }

    container.find('.centered').html(messageView);

    this.$el.append(container);
    return this;
  },
  onButtonClick : function(e){
    if (this.options && this.options.cb){
      this.options.cb.apply(this, arguments);
    }
  }
});
