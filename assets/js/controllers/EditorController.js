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
        $scope.fabric.addImage(image);
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

        $scope.fabric.setCanvasSize(972, 602);
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
                text['text']['_value'] = text['text']['_value'].replace(/%0D/ig, "\n");
                var decodedText = decodeURIComponent(text['text']['_value']).replace(new RegExp( '\\+', 'g' ), ' '),
                    fontColor = text.text.font._fontcolor;

                var fontFamily = $scope.fonts[text.text.font._fontface].regular;

                if (parseInt(text.text.font._fontbold) && parseInt(text.text.font._fontitalic))
                    fontFamily = $scope.fonts[text.text.font._fontface].bold_italic;
                else if (parseInt(text.text.font._fontbold))
                    fontFamily = $scope.fonts[text.text.font._fontface].bold;
                else if (parseInt(text.text.font._fontitalic))
                    fontFamily = $scope.fonts[text.text.font._fontface].italic;

                var addedText = new fabric.IText(decodedText, {
                    top: parseFloat(text['_topy'], 10),
                    left: parseFloat(text['_leftx'], 10),
                    fontFamily: fontFamily,
                    fontSize: parseInt(text.text.font._fontsize),
                    fontWeight: (text.text.font._fontbold == "1" ? "bold" : "normal"),
                    fontStyle: (text.text.font._fontitalic == "1" ? "italic" : "normal"),
                    textDecoration: (text.text.font._fontul == "1" ? "underline" : "none"),
                    textAlign: text.text.font._fontalign,
                    cursorColor: '#' + parseInt(fontColor.substring(1, fontColor.length - 1),16),
                    fill: '#' + parseInt(fontColor.substring(1, fontColor.length - 1),16)
                }).scale($scope.fabric.canvasScale);

                $scope.fabric.getCanvas().add(addedText);
            });
        }
    };

    $scope.$on('canvas:created', $scope.init);
    $scope.$watch('fabric.canvasScale', $scope.updateCanvasView);
    $rootScope.$on('templateChange', $scope.updateCanvasView);
    $rootScope.$on('addTextToEditor', function(e, data) {
        $scope.fabric.addText(null, data);
    });

    $rootScope.$on('addBackgroundToEditor', function(e, data) {
        var URL = window.URL || window.webkitURL;
        $scope.fabric.getCanvas().setBackgroundImage(URL.createObjectURL(data), $scope.fabric.getCanvas().renderAll.bind($scope.fabric.getCanvas()), {
            width: $scope.fabric.canvasOriginalWidth,
            height: $scope.fabric.canvasOriginalHeight,
            scaleX: $scope.fabric.canvasScale,
            scaleY: $scope.fabric.canvasScale
        });
    });

    $rootScope.$on('addImageToEditor', function(e, data) {
        var URL = window.URL || window.webkitURL;
        $scope.addImage(URL.createObjectURL(data));
    });

    Keypress.onSave(function() {
        $scope.updatePage();
    });

    $scope.fonts = {
        'Vineta BT': {
            regular: "VinetaBT-Regular"
        },
        'Verdana': {
            regular: "Verdana"
        },
        'Venetian': {
            regular: "Venetian301BT-Roman", italic: "Venetian301BT-Italic", bold: "Venetian301BT-Demi", bold_italic: "Venetian301BT-DemiItalic"
        },
        'Times New Roman': {
            regular: "Times New Roman"
        },
        'Sonic Cut': {
            regular: "SonicCutThruBT-Heavy"
        },
        'Prose Antique': {
            regular: "ProseAntiquePlain-Regular", bold: "ProseAntiqueBold-Regular"
        },
        'Helvetica Condensed': {
            regular: "Candara-Regular", italic: "Candara-Italic", bold: "Candara-Bold", bold_italic: "Candara-BoldItalic"
        },
        'Futura MD BT': {
            regular: "FuturaBT-Medium"
        },
        'Freestyle Script': {
            regular: "FreestyleScript-Regular"
        },
        'Freehand 521': {
            regular: "Freehand521BT-RegularC"
        },
        'Comic Sans': {
            regular: "ComicSansMS-Regular", bold: "ComicSansMS-Bold"
        },
        'Century Gothic': {
            regular: "CenturyGothic-Regular", italic: "CenturyGothic-Italic", bold: "CenturyGothic-Bold", bold_italic: "CenturyGothic-BoldItalic"
        },
        'Century Expanded': {
            regular: "CenturionOldPlain-Regular", italic: "CenturionOldItalic-Regular", bold: "CenturionOldBold-Regular"
        },
        'Candara': {
            regular: "Candara-Regular", italic: "Candara-Italic", bold: "Candara-Bold", bold_italic: "Candara-BoldItalic"
        },
        'Buxom': {
            regular: "BuxomD-Regular"
        },
        'BrodyD': {
            regular: "BrodyD-Regular"
        },
        'Brody': {
            regular: "Brody-Regular"
        },
        'Bip Funny': {
            regular: "BIP-Regular"
        },
        'Bahamas': {
            regular: "BahamasPlain-Regular", bold: "BahamasBold-Regular"
        },
        'Andale Sans': {
            regular: "AndaleSans-Regular", italic: "AndaleSans-Italic", bold: "AndaleSans-Bold", bold_italic: "AndaleSans-BoldItalic"
        },
        'Albany': {
            regular: "Albany-Regular", italic: "Albany-Italic", bold: "Albany-Bold", bold_italic: "Albany-BoldItalic"
        }
    }
});
