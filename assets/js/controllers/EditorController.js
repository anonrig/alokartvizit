'use strict';

angular.module('aloApp').controller('EditorController', function($scope, $http, Fabric, FabricConstants, Keypress) {
    $scope.fabric = {};
    $scope.FabricConstants = FabricConstants;

    $scope.getTemplate = function(id) {
        $http.get('http://signa.dev/assets/template.xml')
            .success(function(response) {
                $scope.template = response;
            });
    };

    //
    // Creating Canvas Objects
    // ================================================================
    $scope.addShape = function(path) {
        $scope.fabric.addShape('http://fabricjs.com/assets/15.svg');
    };

    $scope.addImage = function(image) {
        
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
        $scope.getTemplate();

        $scope.fabric = new Fabric({
            JSONExportProperties: FabricConstants.JSONExportProperties,
            textDefaults: FabricConstants.textDefaults,
            shapeDefaults: FabricConstants.shapeDefaults,
            json: {}
        });


        $scope.fabric.setCanvasSize(910, 610);
        $scope.fabric.getCanvas().setBackgroundImage('http://alokartvizit.com/bgs/' + $scope.template.design.page._bgUrl, $scope.fabric.getCanvas().renderAll.bind($scope.fabric.getCanvas()), {
                    backgroundImageOpacity: 1,
                    backgroundImageStretch: true
                });

        
        
    };

    $scope.$on('canvas:created', $scope.init);

    Keypress.onSave(function() {
        $scope.updatePage();
    });
});
