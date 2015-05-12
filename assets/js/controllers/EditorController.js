'use strict';

angular.module('aloApp').controller('EditorController', function($scope, $rootScope, $http, Fabric, FabricConstants, Keypress) {
    $scope.fabric = {};
    $scope.FabricConstants = FabricConstants;

    //
    // Creating Canvas Objects
    // ================================================================
    $scope.addShape = function(path) {
        $scope.fabric.addShape('http://fabricjs.com/assets/15.svg');
    };

    $scope.addImage = function(image) {
        $scope.fabric.addImage('assets/images/menu/arkaplan.png');
    };

    $scope.addImageUpload = function(data) {
        var obj = angular.fromJson(data);
        $scope.addImage(obj.filename);
    };

    //
    // Editing Canvas Size
    // ================================================================
    $scope.selectCanvas = function() {
        $scope.canvasCopy = {
            width: $scope.fabric.canvasOriginalWidth,
            height: $scope.fabric.canvasOriginalHeight
        };
    };

    $scope.setCanvasSize = function() {
        $scope.fabric.setCanvasSize($scope.canvasCopy.width, $scope.canvasCopy.height);
        $scope.fabric.setDirty(true);
        delete $scope.canvasCopy;
    };

    //
    // Init
    // ================================================================
    $scope.init = function() {
        $scope.fabric = new Fabric({
            JSONExportProperties: FabricConstants.JSONExportProperties,
            textDefaults: FabricConstants.textDefaults,
            shapeDefaults: FabricConstants.shapeDefaults,
            json: {}
        });

        $scope.fabric.setCanvasSize(910, 610);
    };

    $scope.$on('canvas:created', $scope.init);

    $rootScope.$on('templateChange', function(e, data) {
        $scope.fabric.getCanvas().setBackgroundImage('http://alokartvizit.com/designer/' + data['design']['page']['_bgurl'], $scope.fabric.getCanvas().renderAll.bind($scope.fabric.getCanvas()), {
            backgroundImageOpacity: 1,
            backgroundImageStretch: true,
            width: $scope.fabric.canvasOriginalWidth,
            height: $scope.fabric.canvasOriginalHeight
        });
    });

    Keypress.onSave(function() {
        $scope.updatePage();
    });
});
