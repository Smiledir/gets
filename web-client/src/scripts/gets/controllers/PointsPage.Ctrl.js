/**
 * @author      Nikita Davydovsky   <davydovs@cs.karelia.ru>
 * @version     0.1                 (current version number of program)
 * @since       2014-09-03          (the version of the package this class was first added to)
 */

/**
 * Constructor for controller "PointsPage".
 * 
 * @constructor
 * @param {Object} document Main DOM document.
 * @param {Object} window window dom object of the current page.
 */
function PointsPage(document, window) {
    this.document = document;
    this.window = window;
    
    // Models
    this._points = null;
    this._categories = null;
    this._user = null;
    this._utils = null;
    
    this._mapCtrl = null;
    
    // Views
    this._pointsMain = null;
    this._headerView = null;
    this._pointInfo = null;
    this._pointAdd = null;
    
    this.currentView = null;
}

// Forms
PointsPage.MAIN = 'main';
PointsPage.POINT_INFO = 'point_info';
PointsPage.ADD_POINT = 'point_add';
PointsPage.EDIT_POINT = 'point_edit';

PointsPage.prototype.changeForm = function() {
    var form = this._utils.getHashVar('form');
    Logger.debug('changeForm form = ' + form);
    if (form === PointsPage.MAIN) {
        this.showPointsMain();
    } else if (form === PointsPage.POINT_INFO) {
        this.showPointInfo();
    } else if (form === PointsPage.ADD_POINT) {
        this.showAddPoint();
    } else if (typeof form === 'undefined') {
        this.window.location.replace('#form=' + PointsPage.MAIN);
    }
};

PointsPage.prototype.initPage = function() {
    var self = this;
    
    try {      
        // Init models
        if (!this._points) {
            this._points = new PointsClass();
        }
        if (!this._categories) {
            this._categories = new CategoriesClass();
        }
        if (!this._user) {
            this._user = new UserClass(this.window);
            this._user.fetchAuthorizationStatus();
            Logger.debug('is Auth: ' + this._user.isLoggedIn());
        }
        if (!this._utils) {
            this._utils = new UtilsClass(this.window);
        }
    
        // Init views
        if (!this._pointsMain) {
            this._pointsMain = new PointsMain(this.document, $(this.document).find('#points-main-page'));
            this._pointsMain.initView(this._user.isLoggedIn());
        }
        if (!this._headerView) {
            this._headerView = new HeaderView(this.document, $(this.document).find('.navbar'));
        }
        if (!this._pointInfo) {
            this._pointInfo = new PointInfo(this.document, $(this.document).find('#point-info-page'));
        }
        if (!this._pointAdd) {
            this._pointAdd = new PointAdd(this.document, $(this.document).find('#edit-point-page'));
        }
        
        // Init map
        if (this._mapCtrl == null) {
            this._mapCtrl = new MapController(this.document, this.window);
            this._mapCtrl.initMap();
            //var position = this._user.getUserGeoPosition();
            //this._mapCtrl.setMapCenter(position.latitude, position.longitude);
        }        
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
    
    //Init first page
    this.currentView = this._pointsMain;
    this.changeForm();

    // Init Points main
    this._pointsMain.toggleOverlay();
    this._pointsMain.setLatitude(this._mapCtrl.getMapCenter().lat);
    this._pointsMain.setLongitude(this._mapCtrl.getMapCenter().lng);
    var formDataInit = $(this.document).find('#point-main-form').serializeArray();
    this._points.downLoadPoints(formDataInit, function() {
        Logger.debug(self._points.getPointList());
        self._pointsMain.placePointsInPointList(self._points.getPointList());
        self._mapCtrl.removePointsFromMap();
        self._mapCtrl.placePointsOnMap(self._points.getPointList());
        
        self._pointsMain.toggleOverlay();
    });
    

    // Hash change handler
    $(this.window).on('hashchange', function() {
        Logger.debug('hashchanged');
        self.changeForm();
    });
    
    $(this.document).find('#map').attr('data-ddddd', 'coool');
      
    $(this.document).find('#map').attr('data-ddddd', 'coool---------');

    // Sign in handler
    $(this.document).on('click', '#sign-in-btn', function(e) {
        e.preventDefault();
        self._user.authorizeGoogle();
    });

    // Sign out handler
    $(this.document).on('click', '#sign-out-btn', function(e) {
        e.preventDefault();
        self._user.logout();
    });
    
    // Use default active radius 
    $(this.document).on('change', '#edit-point-radius-default', function(e) {
        e.preventDefault();
        if($(this).is(":checked")) {
            $(self.document).find('#edit-point-active-radius-input').val($(this).data('defaultValue')).attr('disabled', 'disabled');        
            Logger.debug('checked');
        } else {
            $(self.document).find('#edit-point-active-radius-input').removeAttr('disabled');
        }       
    });
    
    // Add Point Handler
    $(this.document).on('submit', '#edit-point-form', function(e) {
        e.preventDefault();
        self.addPointHandler(this);
    });
    
    /*$('.dropdown').hover(
            function () {
                $(this).addClass('open');
            },
            function () {
                $(this).removeClass('open');
            }
    );*/
    
    // Create/remove temp marker (Use map) handler
    $(this.document).on('click', '#edit-point-use-map', function (e){
        e.preventDefault();
        var form = self._utils.getHashVar('form');
        if(!$(this).hasClass('active') && (form === PointsPage.ADD_POINT || form === PointsPage.EDIT_POINT)) {
            $(this).addClass('active');
            var coords = null;
            var settings = $(self.document).find('#edit-point-use-map-settings li a.marked-list-item').data('item');
            
            if (settings === 'center') {
                coords = self._mapCtrl.getMapCenter();
            } else if (settings === 'location') {
                if (self._user.isCoordsSet()) {
                    coords = self._user.getUsersGeoPosition();
                }
            }
             
            self._pointAdd.setLatLng(
                        Math.floor(coords.lat * 1000000) / 1000000, 
                        Math.floor(coords.lng * 1000000) / 1000000
            );
            self._mapCtrl.createTempMarker(coords.lat, coords.lng, function (position) {
                self._pointAdd.setLatLng(
                    Math.floor(position.lat * 1000000) / 1000000, 
                    Math.floor(position.lng * 1000000) / 1000000
                );
            });
        } else {
            $(this).removeClass('active');
            self._mapCtrl.removeTempMarker();
        }
    });
    
    // Use different settings for Use map button
    $(this.document).on('click', '#edit-point-use-map-settings li a', function (e){
        e.preventDefault();
        
        $(self.document).find('#edit-point-use-map-settings li a').removeClass('marked-list-item');   
        
        if ($(this).hasClass('marked-list-item')) {
            $(this).removeClass('marked-list-item');
        } else {
            $(this).addClass('marked-list-item');
        }
        
        var useMapButton = $(self.document).find('#edit-point-use-map');
        if($(useMapButton).hasClass('active')) {
            $(useMapButton).removeClass('active');
            $(useMapButton).click();
        }
    });
    
    // Create/remove search area
    $(this.document).on('change', '#points-main-show-search-area', function(e) {
        e.preventDefault();
        if($(this).is(":checked")) {
            var coords = null;
            self._mapCtrl.createSearchArea(
                self._pointsMain.getLatitude(), 
                self._pointsMain.getLongitude(), 
                self._pointsMain.getRadius() * 1000
            );
            Logger.debug('checked');
        } else {
            self._mapCtrl.hideSearchArea();
        }       
    });

    // 
    $(this.document).on('submit', '#point-main-form', function(e) {
        e.preventDefault();        
        self._pointsMain.toggleOverlay();
        
        var formData = $(this).serializeArray();
        Logger.debug(formData);
        self._points.downLoadPoints(formData, function() {
            self._pointsMain.placePointsInPointList(self._points.getPointList(false));
            self._mapCtrl.placePointsOnMap(self._points.getPointList());
            
            self._pointsMain.toggleOverlay();
        });
    });
    
    //dragend
    this._mapCtrl.setMapCallback('dragend', function(e){
        self._pointsMain.toggleOverlay();
        
        var center = self._mapCtrl.getMapCenter();
        self._pointsMain.setLatitude(Math.floor(center.lat * 10000) / 10000);
        self._pointsMain.setLongitude(Math.floor(center.lng * 10000) / 10000);
        
        self._mapCtrl.setSearchAreaParams(
            self._pointsMain.getLatitude(), 
            self._pointsMain.getLongitude(), 
            self._pointsMain.getRadius() * 1000
        );
        
        var formDataInit = $(self.document).find('#point-main-form').serializeArray();       
        self._points.downLoadPoints(formDataInit, function () {           
            self._pointsMain.placePointsInPointList(self._points.getPointList());
            self._mapCtrl.removePointsFromMap();
            self._mapCtrl.placePointsOnMap(self._points.getPointList());
            
            self._pointsMain.toggleOverlay();
        });
    });
    
    // upload picture show/hide handler
    $(this.document).on('click', '#edit-point-picture-toggle-upload', function (e){
        e.preventDefault();
        var upload = $(self.document).find('#edit-point-picture-upload');
        if ($(upload).hasClass('hidden')) {
            $(upload).removeClass('hidden').addClass('show');
            $(self.document).find('#edit-point-picture-input-url').attr('disabled', 'disabled');
            // scroll to upload element
            $(self.document).find('#edit-point-page .action-menu-inner-content').animate({
                scrollTop: $('#edit-point-picture-input-file-upload').offset().top
            }, 2000);
        } else {
            $(upload).removeClass('show').addClass('hidden');
            $(self.document).find('#edit-point-picture-input-url').removeAttr('disabled');
        }       
    });
    
    // Upload picture handler
    $(this.document).on('click', '#edit-point-picture-input-file-upload', function (e) {
        e.preventDefault();
        self._pointAdd.toggleOverlay();
        try {
            var imageFile = $(self.document).find('#edit-point-picture-input-file').get(0).files[0];
            if (typeof imageFile !== 'undefined') {
                self._utils.uploadFile({
                    file: imageFile
                }, function (url) {
                    $(self.document).find('#edit-point-picture-input-url').val(url);
                    $(self.document).find('#edit-point-picture-upload').removeClass('show').addClass('hidden');
                    $(self.document).find('#edit-point-picture-input-url').removeAttr('disabled');
                    self._pointAdd.toggleOverlay();
                });
            }
        } catch (Exception) {
            MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        }
    });
    
    $(this.document).on('change', '#edit-point-picture-input-file', function(e) {
        e.preventDefault();
        if ($(this).val() !== '') {
            $(self.document).find('#edit-point-picture-input-file-upload').removeClass('disabled');
        } else {
            $(self.document).find('#edit-point-picture-input-file-upload').addClass('disabled');
        }        
    });
    
    // Clear file input handler
    $(this.document).on('click', '#edit-point-picture-input-file-clear', function(e) {
        e.preventDefault();
        self._utils.resetFileInput($(self.document).find('#edit-point-picture-input-file'));
    });
    
    $(this.document).on('click', '#edit-point-picture-input-file-cancel', function (e){
        $(self.document).find('#edit-point-picture-upload').removeClass('show').addClass('hidden');
        $(self.document).find('#edit-point-picture-input-url').removeAttr('disabled');
    });
    
    // upload audio show/hide handler
    $(this.document).on('click', '#edit-point-audio-toggle-upload', function (e){
        e.preventDefault();
        var upload = $(self.document).find('#edit-point-audio-upload');
        if ($(upload).hasClass('hidden')) {
            $(upload).removeClass('hidden').addClass('show');
            $(self.document).find('#edit-point-audio-input-url').attr('disabled', 'disabled');
            // scroll to upload element
            $(self.document).find('#edit-point-page .action-menu-inner-content').animate({
                scrollTop: $('#edit-point-audio-input-file-upload').offset().top
            }, 2000);
        } else {
            $(upload).removeClass('show').addClass('hidden');
            $(self.document).find('#edit-point-audio-input-url').removeAttr('disabled');
        }
    });
    
    // Upload audio handler
    $(this.document).on('click', '#edit-point-audio-input-file-upload', function (e) {
        e.preventDefault();
        self._pointAdd.toggleOverlay();
        try {
            var audioFile = $(self.document).find('#edit-point-audio-input-file').get(0).files[0];
            if (typeof audioFile !== 'undefined') {
                self._utils.uploadFile({
                    file: audioFile
                }, function (url) {
                    $(self.document).find('#edit-point-audio-input-url').val(url);
                    $(self.document).find('#edit-point-audio-upload').removeClass('show').addClass('hidden');
                    $(self.document).find('#edit-point-audio-input-url').removeAttr('disabled');
                    self._pointAdd.toggleOverlay();
                });
            }
        } catch (Exception) {
            MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        }
    });
    
    $(this.document).on('change', '#edit-point-audio-input-file', function(e) {
        e.preventDefault();//id="edit-point-audio-input-file-upload"
        if ($(this).val() !== '') {
            $(self.document).find('#edit-point-audio-input-file-upload').removeClass('disabled');
        } else {
            $(self.document).find('#edit-point-audio-input-file-upload').addClass('disabled');
        }        
    });
    
    // Clear file input handler
    $(this.document).on('click', '#edit-point-audio-input-file-clear', function(e) {
        e.preventDefault();
        self._utils.resetFileInput($(self.document).find('#edit-point-audio-input-file'));
    });
    
    $(this.document).on('click', '#edit-point-audio-input-file-cancel', function (e){
        $(self.document).find('#edit-point-audio-upload').removeClass('show').addClass('hidden');
        $(self.document).find('#edit-point-audio-input-url').removeAttr('disabled');
    });
    
    // get user's coordinates
    if (this.window.navigator.geolocation) {
        this.window.navigator.geolocation.getCurrentPosition(function(position) {  
            self._pointsMain.toggleOverlay();
            
            Logger.debug(position);
            self._user.setUserGeoPosition(position);
            self._mapCtrl.setMapCenter(position.coords.latitude, position.coords.longitude);
            self._pointsMain.setLatitude(Math.floor(position.coords.latitude * 10000) / 10000);
            self._pointsMain.setLongitude(Math.floor(position.coords.longitude * 10000) / 10000);
            var formDataInit = $(self.document).find('#point-main-form').serializeArray();
            self._points.downLoadPoints(formDataInit, function() {
                self._pointsMain.placePointsInPointList(self._points.getPointList());
                self._mapCtrl.removePointsFromMap();
                self._mapCtrl.placePointsOnMap(self._points.getPointList());
                
                self._pointsMain.toggleOverlay();
            });
        }, this.handleGeoLocationError);
    } else {
       Logger.debug('geolocation is not supported by this browser');
    }
};

PointsPage.prototype.handleGeoLocationError = function (error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            Logger.debug('user denied the request for Geolocation');
            break;
        case error.POSITION_UNAVAILABLE:
            Logger.debug('location information is unavailable');
            break;
        case error.TIMEOUT:
            Logger.debug('the request to get user location timed out');
            break;
        case error.UNKNOWN_ERROR:
            Logger.debug('an unknown error occurred');
            break;
    }
};

PointsPage.prototype.showPointsMain = function() {
    try {
        this._headerView.clearOption();
        
        this._pointsMain.placeCategoriesInPointMain(this._categories.getCategories());

        this.currentView.hideView();
        this.currentView = this._pointsMain;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

PointsPage.prototype.showPointInfo = function() {
    try {
        this._headerView.changeOption($(this._pointInfo.getView()).data('pagetitle'), 'glyphicon-chevron-left', '#form=main');
        
        var pointName = decodeURIComponent(this._utils.getHashVar('point_name'));
        if (!pointName) {
            throw new GetsWebClientException('Track Page Error', 'showPointInfo, hash parameter pointName undefined');
        }
        this._points.findPointInPointList(pointName);
        
        this._pointInfo.placePointInPointInfo(this._points.getPoint(), this._user.isLoggedIn());
        
        this.currentView.hideView();
        this.currentView = this._pointInfo;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

PointsPage.prototype.showAddPoint = function() {
    try {
        this._headerView.changeOption($(this._pointAdd.getView()).data('pagetitleAdd'), 'glyphicon-chevron-left', '#form=main');
        this._utils.clearAllInputFields(this._pointAdd.getView());
        
        this._pointAdd.placeCategoriesInPointAdd(this._categories.getCategories());
        
        this.currentView.hideView();
        this.currentView = this._pointAdd;
        this.currentView.showView();
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    }
};

PointsPage.prototype.addPointHandler = function(formData) {
    var that = this;
    try {         
        if (this._utils.checkCoordsInput(
                $(formData).find('#edit-point-lat-input').val(),
                $(formData).find('#edit-point-lon-input').val(),
                $(formData).find('#edit-point-alt-input').val()
                )) {
            this._pointAdd.toggleOverlay();

            var paramsObj = $(formData).serializeArray();
            paramsObj.push({name: 'time', value: this._utils.getDateTime()});
            this._points.addPoint(paramsObj, function () {
                that.window.location.replace('#form=' + PointsPage.MAIN);
                MessageBox.showMessage($(that._pointAdd.getView()).data('messagesuccessAdd'), MessageBox.SUCCESS_MESSAGE);
            });
        }      
    } catch (Exception) {
        MessageBox.showMessage(Exception.toString(), MessageBox.ERROR_MESSAGE);
        Logger.error(Exception.toString());
    } finally {
        this._pointAdd.toggleOverlay();
    }
};

