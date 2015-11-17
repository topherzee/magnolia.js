console.log("magnolia.js");

/**
 * Module for retrieving content from Magnolia and getting it in a nice, easy to use object structure.
 * 
 * Example Usage

	IN FTL: 
	var magnoliaContextPath = "${ctx.contextPath}";
	
	IN JS:
	// Configure magnolia.js
	var config = {
			urlRestBase: window.magnoliaContextPath + "/.rest/nodes/v1/",
			magnoliaContext: window.magnoliaContextPath
	};
	magnolia.setConfig(config);
	
	magnolia.getContent("category" , "/destinations", function(content){
        destinations = content;
        //testContent(content);
    });
 */
var magnolia = ( function( window, undefined ) {
  
	// Default values.
	var config = {
			urlRestParameters : "depth=1&includeMetadata=false",
			urlRestBase : "http://localhost:8080/magnolia-bundled-webapp/.rest/nodes/v1/",
			magnoliaContext: "http://localhost:8080/magnolia-bundled-webapp/"
	};

    function setConfig(configNew){
    	for(var prop in configNew) {
	        if(configNew.hasOwnProperty(prop)){
	        	config[prop] = configNew[prop];
	        }
	    }
    }
    
    /**
     * Get content from Magnolia and do something with it in a callback.
     * Path parameter should start with a slash.
     */
    function getContent(workspace, path, callback){
        return getContentShared(workspace, path, null, callback);
    }
    
    function getAssets(workspace, path, callback){
        return getContentShared(workspace, path, {"assets":true}, callback);
    }
    
    function getContentShared(workspace, path, options, callback){
        // TODO: add check for slash at front of path and add one if none.
        var url = config.urlRestBase + workspace + path + "?" + config.urlRestParameters;
        
        return $.getJSON( url, function( data ) {
            var content = [];
            content = populateContentFromNodesV1(data, options);
            console.log("gCS contents:" + content.length + " : " + url);
            callback(content);
          });
    }

    /**
     * Take the v1 Rest response, and convert into an array of contentMap like object.
     */
    function populateContentFromNodesV1(data, options) {
        var items= [];
        var nodes = data.nodes;
        
        $.each(nodes, function(index, node) {
            // key "properties"
            var item = {};
            item.name = node.name;
            item.id = node.identifier;
            item.path = node.path;
            
            // standard properties
            var properties = node.properties;
            $.each(properties, function(propIndex, property) {
                var propName = property.name;
                if (propName !="name"){
                    var propValue;
                    if (property.values.length > 1){
                        propValue = property.values;
                    }else{
                        propValue = property.values[0];
                    };
                    item[propName] = propValue;
                }
            });
            
            // special options
            if (options != null){
                if (options.assets){
                    // asset properties
                    var asset
                }
            }
            
            items.push(item);
        });
        
        return items;
    }
  
    function getAssetLink(assetPath, renditionName, themeName){
        //"/magnolia-travel-webapp/.imaging/mte/travel-demo/large-16x9/dam/Tours/flickr-swiss-trails-ed-coyle-3797048134_1f4a930f48_o.jpg/jcr:content/flickr-swiss-trails-ed-coyle-3797048134_1f4a930f48_o.jpg.2015-03-12-16-36-34.jpg
        // return MgnlContext.getContextPath() + "/.imaging/" + getGeneratorName() + "/" + themeName + "/" + getName() + "/" + workspaceName + path + "/" + fileName;
        // above from ImageOperationProvidingVariation.createLink()
        var workspace = "dam";
        var cacheDate = "cache";
        var generator = "mte";
        
        var n = assetPath.lastIndexOf('/');
        var assetName = assetPath.substring(n + 1);
        var url = config.magnoliaContext + "/.imaging/" + generator + "/" + themeName + "/" + renditionName + "/dam" + assetPath + "/jcr:content/" + assetName + "." + cacheDate + ".jpg";
        return url;
    }
    
    function getItemById(items, id){
        var theItem;
        //Handle prefixed id's (ie for assets) //"jcr:4893483948349348389"
        if (id && id.indexOf(":") > 0){
            id = id.substring(id.indexOf(":") + 1);
        }
        
        var item;
        for (var i=0; i< items.length; i++){
            item = items[i];
            if (item.id == id){
                return item;
            }
        }
        return null;
    }
    
  // explicitly return public methods when this object is instantiated
  return {
      setConfig : setConfig,
	  getContent : getContent, 
      getAssetLink : getAssetLink,
      getItemById : getItemById

  };
  
} )( window );







