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

        $scope.fabric.setCanvasSize(919, 602);
    };

    $scope.updateCanvasView = function(e, data) {
        if (data && data['design'])
            $scope.currentTemplate = data;

        if ($scope.fabric.canvasScale && $scope.currentTemplate) {
            $scope.fabric.getCanvas().clear();

            $scope.fabric.getCanvas().setBackgroundImage('http://alokartvizit.com/designer/' + $scope.currentTemplate['design']['page']['_bgurl'], $scope.fabric.getCanvas().renderAll.bind($scope.fabric.getCanvas()), {
                width: $scope.fabric.canvasOriginalWidth,
                height: $scope.fabric.canvasOriginalHeight,
                scaleX: $scope.fabric.canvasScale,
                scaleY: $scope.fabric.canvasScale
            });

            $scope.currentTemplate['design']['page']['layout']['group'].forEach(function(text) {
                var addedText = new fabric.IText(decodeURIComponent(text['text']['_value']), {
                    top: parseFloat(text['_topy'], 10),
                    left: parseFloat(text['_leftx'], 10),
                    fontFamily: text.text.font._fontface,
                    fontSize: text.text.font._fontsize,
                    fontWeight: (text.text.font._fontbold == "1" ? "bold" : "normal"),
                    fontStyle: (text.text.font._fontitalic == "1" ? "italic" : "normal"),
                    textDecoration: (text.text.font._fontul == "1" ? "underline" : "none"),
                    textAlign: text.text.font._fontalign,
                    cursorColor: text.text.font._fontcolor,
                    fill: text.text.font._fontcolor
                }).scale($scope.fabric.canvasScale);

                $scope.fabric.getCanvas().add(addedText);
            });
        }
    };

    $scope.$on('canvas:created', $scope.init);
    $scope.$watch('fabric.canvasScale', $scope.updateCanvasView);
    $rootScope.$on('templateChange', $scope.updateCanvasView);

    Keypress.onSave(function() {
        $scope.updatePage();
    });
});
