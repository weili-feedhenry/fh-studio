client.studio.views = client.studio.views || {};
client.studio.views.helpers = dust.makeBase({
    tabLayoutHelper : function (chunk,context){
        //context is the data and chunk is the piece of template
        var tab = context.get("tab");
        if(_.isString(tab) && tab !== ""){
            chunk.partial(tab.toLowerCase(),context);
        }
    },
    appBarHelper : function(chunk, context){

    },
    filesTreeHelper : function(chunk, context){
    	var tab = context.get("tab");
    	if (tab==='editor'){
    		chunk.partial('filestree', context);
    	}

    },

    isNthItem : function(chunk, context, bodies, params) {
      if (context.stack.index === parseInt(params.n, 10)) {
        return bodies.block(chunk, context);
      } else {
        return chunk;
      }
    }
});
