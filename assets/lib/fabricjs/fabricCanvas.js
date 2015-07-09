angular.module('common.fabric.canvas', ['common.fabric.window']).service('FabricCanvas', ['FabricWindow', '$rootScope', function(FabricWindow, $rootScope) {
	var self = {
		canvasId: null,
		element: null,
		canvas: null
	};

    self.canvasList = {};

	function createId() {
		return Math.floor(Math.random() * 10000);
	}

	self.setElement = function(element) {
		self.element = element;
		$rootScope.$broadcast('canvas:element:selected');
	};

	self.createCanvas = function() {
		self.canvasId = 'fabric-canvas-' + createId();
		self.element.attr('id', self.canvasId);
		self.canvas = new FabricWindow.Canvas(self.canvasId);
		$rootScope.$broadcast('canvas:created');

        self.canvasList[self.canvasId] = self.canvas;

		return self.canvas;
	};

	self.setActiveCanvas = function(canvasId) {
        self.canvas = self.canvasList[canvasId];
    };

	self.getCanvasList = function() {
		return self.canvasList;
	};

	self.getCanvasById = function(canvasId) {
		return self.canvasList[canvasId];
	};

	self.getCanvasImagesById = function(canvasId) {
		return self.canvasList[canvasId].toDataURL({format: 'jpeg', quality: 1});
	};

	self.getCanvas = function() {
		return self.canvas;
	};

	self.getCanvasId = function() {
		return self.canvasId;
	};

	return self;

}]);
