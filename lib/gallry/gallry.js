/********************************Gallry: Flickr Picture Chooser*************************
By: Leonardo Luarte


****************************************************************************************/
/*Flickr sizes*/
GLR_SQUARE = 's'; //Small square 75x75
GLR_THUMB = 't'; //Thumbnail, 100 on longest side
GLR_SMALL = 'm'; //Small, 240 on longest side
GLR_DEFAULT = ''; //Medium, 500 on longest side
GLR_MEDIUM = 'z'; //Medium, 640 on longest side
GLR_LARGE = 'b'; //Large, 1024 on longest side
GLR_ORIGINAL = 'o'; //Original Image

/**********CONFIGURATION***********/
//Set the API Key for your own stuff
GLR_API_KEY = 'e12e6151732ef08f338ef2c801ccf026';
//Size of the thumbnails inside the popup
GLR_DEFAULT_PREVIEW_SIZE = GLR_SQUARE;
//Size of the images to be appended to your content
GLR_DEFAULT_CONTENT_SIZE = GLR_DEFAULT;

/*****END OF CONFIGURATION**********/

GLR_DOMAIN = 'http://www.flickr.com';
GLR_API_ROOT = '/services/rest/';
GLR_FULL_URI = GLR_DOMAIN + GLR_API_ROOT;


var Gallry = new Class({
	
	initialize: function(containerName)
	{
		this.container = document.id(containerName);
		this.start();
		this.log("Initialize");
	},
	start: function()
	{
		this.log("Start");
		this.mainContainer = new Element('div',{
			'id':'gallry_main',
		});
		this.mainContainer.inject(this.container);
		this.createUserSelector();

	},
	createUserSelector: function()
	{
		var userSelector = new Element('div',{'id':'gallry_user_selector'});
		var userSelectorInput = new Element('input',{'type':'text', 'id':'gallry_username'});
		var userSelectorLabel = new Element('label',{'for':'gallry_username',html:'Username:'});
		var userSelectorFinder = new Element('button',{'id':'gallry_user_selector_find',html:'Find'})
		userSelectorLabel.inject(userSelector);
		userSelectorInput.inject(userSelector);
		userSelectorFinder.inject(userSelector);
		userSelector.inject(this.mainContainer);

		userSelectorFinder.addEvent('click', function()
		{
			var username = userSelectorInput.get('value');
			this.invokeAPI('flickr.people.findByUsername',{'username':username},
				function(method,data)
				{
					console.log(data);
					this.getUserPictures(data.user.nsid);
				}.bind(this));
		}.bind(this));
		this.userSelector = userSelector;
	},
	getUserPictures : function(userId)
	{
		this.invokeAPI('flickr.people.getPublicPhotos',{'user_id':userId,'per_page':50},
			function(method,data)
			{
				console.log(data);
				this.showUserGallery(data);
			}.bind(this)
		);

	},
	showUserGallery : function(data)
	{
		this.userSelector.hide();
		var photoList = data.photos.photo;
		var galleryContainer = new Element('div',{'id':'gallry_picture_container'});
		var galleryMediaGrid = new Element('ul',{'class':'media-grid'});
		galleryMediaGrid.inject(galleryContainer);
		galleryContainer.inject(this.mainContainer);

		for(var index =0 ; index< photoList.length; index++)
		{
			var pic = photoList[index];
			var picUrl = 'http://farm'+pic.farm+'.staticflickr.com/'+
							pic.server+'/'+pic.id+'_'+pic.secret+'_'+GLR_DEFAULT_PREVIEW_SIZE+'.jpg';
			var link = new Element('a',{'href':'#'});
			var img = new Element('img',{'class':'thumbnail', src:picUrl,'alt':pic.name});
			img.inject(link);
			link.inject(galleryMediaGrid);
		}
	},
	invokeAPI : function(method, parameters,callback)
	{
		//Adds the minimal parameters to invoke the Flickr API
		var invocation = {'method':method,'api_key':GLR_API_KEY,'format':'json'};
		//Add the extra parameters that are request per function
		for(var key in parameters)
		{
			invocation[key] = parameters[key];
		}
		var mootoolsJSONP = new Request.JSONP({
		    url: GLR_FULL_URI,
		    callbackKey: 'jsoncallback',
		    data: invocation,
		    onRequest: function(url){
		        // a script tag is created with a src attribute equal to url
		        console.log(url);
		    },
		    onComplete: function(data){
		        callback(method,data);
		    }
		}).send();

	},
	can_log: true,
	log: function(message)
	{
		if(!this.can_log) return;
		console.debug(message);
	}

});

