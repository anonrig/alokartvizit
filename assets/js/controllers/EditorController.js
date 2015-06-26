'use strict';

angular.module('aloApp').controller('EditorController', function($scope, $rootScope, $http, $compile, $location, Fabric, FabricConstants, FabricCanvas, Keypress, Alertify) {
    $scope.fabric = {};
    $scope.FabricConstants = FabricConstants;

    $scope.editorMode = $location.search()['editor_mode'] || 1;
    $scope.uniqueId = $location.search()['unique_id'];
    
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

        var canvasWidth = $scope.fabric.canvasOriginalWidth;
        var containerWidth = $('.editor').width() - 60;

        if (canvasWidth > containerWidth) {
            var percent = containerWidth * 100 / canvasWidth;
            $scope.fabric.canvasScale = parseInt(percent) / 100;
            $scope.fabric.setZoom();
        }

        if ($scope.uniqueId.length) {
            $http.post('http://alokartvizit.com/designer/fabrics/ajax.php', {
                request: 2,
                design_id: $scope.uniqueId
            }).success(function(response) {
                if (response)
                    $scope.setCanvasView(response);
            });

        }
    };

    $scope.addNewPage = function() {
        var el = $('.image-builder');

        el.append('<div class="fabric-container osx" contextmenu menu-list="lists" click-menu="clickMenu(item)" menu-shown="menuShown()" > <canvas id="canvas1" fabric="fabric"></canvas> </div>');
        $compile($('#canvas1'))($scope);
    };

    $scope.setZoom = function() {
        $scope.fabric.setZoom();
        $scope.updateCanvasView($scope.currentTemplate);
    };

    $scope.canvasChanged = false;
    $scope.updateCanvasView = function(e, data) {
        if ($scope.canvasChanged) {
            Alertify.confirm('Sahnedeki mevcut tasarımdaki değişiklikleri kaybedeceksiniz. Seçtiğiniz yeni şablonun yine de uygulanmasını istiyor musunuz?')
                .then(function () {
                    $scope.setCanvasView(data);
                }, function () {

                });
        } else
            $scope.setCanvasView(data);
    };

    $scope.setCanvasView = function(data) {
        if( window.devicePixelRatio !== 1 ){
            var c = $scope.fabric.getCanvas().getElement(); // canvas = fabric.Canvas
            var w = c.width, h = c.height;
            c.setAttribute('width', w*window.devicePixelRatio);
            c.setAttribute('height', h*window.devicePixelRatio);

            c.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);
        }

        if (data && data['design'])
            $scope.currentTemplate = data;

        $scope.canvasChanged = false;
        if ($scope.fabric.canvasScale && $scope.currentTemplate) {
            $scope.fabric.getCanvas().clear();

            $scope.fabric.getCanvas().setBackgroundImage('http://alokartvizit.com/designer/' + $scope.currentTemplate['design']['page']['_bgurl'], $scope.fabric.getCanvas().renderAll.bind($scope.fabric.getCanvas()), {
                width: $scope.fabric.canvasOriginalWidth,
                height: $scope.fabric.canvasOriginalHeight,
                scaleX: $scope.fabric.canvasScale,
                scaleY: $scope.fabric.canvasScale
            });

            $scope.currentTemplate['design']['page']['layout']['group'].forEach(function(text) {
                var encodedText = text['text']['_value'].replace(/%0D/ig, "\n"),
                    decodedText = decodeURIComponent(encodedText).replace(new RegExp( '\\+', 'g' ), ' '),
                    fontColor = text.text.font._fontcolor,
                    fontFamily = $scope.fonts[text.text.font._fontface].regular;

                if (fontColor < 0)
                    fontColor = (0xFFFFFFFF + parseInt(fontColor) + 1).toString(16).slice(2);
                else
                    fontColor = Number(fontColor).toString(16);


                if (parseInt(text.text.font._fontbold) && parseInt(text.text.font._fontitalic))
                    fontFamily = $scope.fonts[text.text.font._fontface].bold_italic;
                else if (parseInt(text.text.font._fontbold))
                    fontFamily = $scope.fonts[text.text.font._fontface].bold;
                else if (parseInt(text.text.font._fontitalic))
                    fontFamily = $scope.fonts[text.text.font._fontface].italic;

                var addedText = new fabric.IText(decodedText, {
                    top: parseFloat(text['_topy'] * $scope.fabric.canvasScale, 10),
                    left: parseFloat(text['_leftx'] * $scope.fabric.canvasScale, 10),
                    fontFamily: fontFamily,
                    fontSize: parseInt(text.text.font._fontsize),
                    fontWeight: (text.text.font._fontbold == "1" ? "bold" : "normal"),
                    fontStyle: (text.text.font._fontitalic == "1" ? "italic" : "normal"),
                    textDecoration: (text.text.font._fontul == "1" ? "underline" : "none"),
                    textAlign: text.text.font._fontalign,
                    cursorColor: '#' + fontColor,
                    fill:  '#' + fontColor
                }).scale($scope.fabric.canvasScale);

                $scope.fabric.getCanvas().add(addedText);
            });
        }
    };

    $scope.objectSelected = false;
    $scope.objectProperties = {};
    $scope.propertyElStyles = {};

    $scope.menuShown = function() {
        $scope.toggleObjectProperties(false);
        $scope.$digest();
    };

    $scope.toggleObjectProperties = function(isSelected, e) {
        $scope.objectSelected = isSelected;
        if (!$scope.objectSelected)
            return;

        if (e && e['detail'] && e['detail']['text'])
            $scope.setObjectProperties({
                options: {
                    object: {
                        top: e['detail']['top'],
                        left: e['detail']['left'],
                        currentHeight: e['detail']['currentHeight'],
                        fontFamily: e['detail']['fontFamily'].toLowerCase(),
                        fontSize: e['detail']['fontSize'],
                        fontWeight: e['detail']['fontWeight'],
                        fontStyle: e['detail']['fontStyle'],
                        textAlign: e['detail']['textAlign'],
                        color: e['detail']['fill']
                    },
                    canvas: {
                        offsetTop: $scope.fabric.getCanvas()['_offset']['top'],
                        offsetLeft: $scope.fabric.getCanvas()['_offset']['left']
                    }
                }
            });
        else
            $scope.objectSelected = false;

        if ($scope.objectSelected)
            $scope.canvasChanged = true;
    };

    $scope.setObjectProperties = function(data) {
        if (data['options']) {
            $scope.objectProperties = data['options']['object'];
            var canvasProperties = data['options']['canvas'];

            $scope.setObjectFont();
            $scope.propertyElStyles = {
                'top': $scope.objectProperties['top'] + $scope.objectProperties['currentHeight'] + canvasProperties['offsetTop'] + 20 + 'px',
                'left': $scope.objectProperties['left'] + 20 + 'px'
            };
        }
    };

    $scope.setObjectFont = function() {
        for (var key in $scope.fonts) {
            var currentFont = $scope.fonts[key];
            if (currentFont['regular'] && currentFont['regular'].toLowerCase() == $scope.objectProperties['fontFamily'])
                $scope.objectProperties['fontFamily'] = currentFont;
            else if (currentFont['bold'] && currentFont['bold'].toLowerCase() == $scope.objectProperties['fontFamily'])
                $scope.objectProperties['fontFamily'] = currentFont;
            else if (currentFont['italic'] && currentFont['italic'].toLowerCase() == $scope.objectProperties['fontFamily'])
                $scope.objectProperties['fontFamily'] = currentFont;
            else if (currentFont['bold_italic'] && currentFont['bold_italic'].toLowerCase() == $scope.objectProperties['fontFamily'])
                $scope.objectProperties['fontFamily'] = currentFont;
        }
    };

    $scope.lists = [{
        name: 'Öne Getir',
        id: 0
    }, {
        name: 'Arkaya Götür',
        id: 1
    }, {
        name: 'Dönmeyi Sıfırla',
        id: 2
    }, {
        name: 'Strect',
        id: 3
    }, {
        name: 'Sil',
        id: 4
    }];

    $scope.clickMenu = function (item) {
        var selectedObject = $scope.fabric.selectedObject;

        switch (item.id) {
            case 0: 
                //One Getir
                if (selectedObject) {
                    $scope.fabric.bringToFront(); 
                    $scope.fabric.setDirty(true)
                }
                break;  
            case 1:
                //Arkaya Gotur
                if (selectedObject) {
                    $scope.fabric.sendBackwards(); 
                    $scope.fabric.setDirty(true)
                }
                break;
            case 2:
                //Donmeyi Sifirla
                if (selectedObject) {
                    selectedObject.setAngle(0);
                }
                break;
            case 3:
                //Strect
                if (selectedObject) {
                    var canvas = $scope.fabric.getCanvas();

                    selectedObject.setTop(0);
                    selectedObject.setLeft(0);
                    selectedObject.setScaleX(canvas.width / selectedObject.width);
                    selectedObject.setScaleY(canvas.height / selectedObject.height);

                    canvas.renderAll();
                }
                break;
            case 4:
                //Sil
                if (selectedObject) {
                    $scope.fabric.deleteActiveObject(); 
                    $scope.fabric.setDirty(true);
                }
                break;
            default:
                console.log('Nothing clicked');
                break;
        }
    };

    $scope.$on('canvas:created', $scope.init);

    document.addEventListener('selectionCleared', function () {
        $scope.toggleObjectProperties(false);
        $('.colorpicker').removeClass('colorpicker-visible');
    }, false);

    document.addEventListener('mouseUp', function (e) {
        $('.colorpicker').removeClass('colorpicker-visible');
        $scope.toggleObjectProperties(true, e);
        setTimeout(function() {
            $('.objectProperties').css('opacity', '1');
        }, 100);
    }, false);

    document.addEventListener('objectMoving', function (e) {
        $('.objectProperties').css('opacity', '0');
        $('.colorpicker').removeClass('colorpicker-visible');
    }, false);

    document.addEventListener('objectSelected', function (e) {
        $scope.toggleObjectProperties(true, e);
    }, false);

    $scope.$watch('fabric.canvasScale', $scope.updateCanvasView);
    $rootScope.$on('templateChange', $scope.updateCanvasView);
    $rootScope.$on('addTextToEditor', function(e, data) {
        var addedText = new fabric.IText('Yeni Metin', {
            fontSize: parseInt(data)
        }).scale($scope.fabric.canvasScale);

        $scope.fabric.getCanvas().add(addedText);
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

    $scope.updateFont = function() {
        var isBold = $scope.fabric.isBold();
        var isItalic = $scope.fabric.isItalic();

        var fontFamily = $scope.objectProperties.fontFamily;
        var selectedFont = fontFamily['regular'];

        if (isBold && isItalic && fontFamily['bold_italic'])
            selectedFont = fontFamily['bold_italic'];
        else if (isBold && fontFamily['bold'])
            selectedFont = fontFamily['bold'];
        else if (isItalic && fontFamily['italic'])
            selectedFont = fontFamily['italic'];

        $scope.fabric.setFontFamily(selectedFont);
        $scope.fabric.render();
    };

    $scope.fonts = {
        'Albany': {
            regular: "Albany-Regular", italic: "Albany-Italic", bold: "Albany-Bold", bold_italic: "Albany-BoldItalic"
        },
        'Andale Sans': {
            regular: "AndaleSans-Regular", italic: "AndaleSans-Italic", bold: "AndaleSans-Bold", bold_italic: "AndaleSans-BoldItalic"
        },
        'Bahamas': {
            regular: "BahamasPlain-Regular", bold: "BahamasBold-Regular"
        },
        'Bip Funny': {
            regular: "BIP-Regular"
        },
        'Brody': {
            regular: "Brody-Regular"
        },
        'BrodyD': {
            regular: "BrodyD-Regular"
        },
        'Buxom': {
            regular: "BuxomD-Regular"
        },
        'Candara': {
            regular: "Candara-Regular", italic: "Candara-Italic", bold: "Candara-Bold", bold_italic: "Candara-BoldItalic"
        },
        'Century Expanded': {
            regular: "CenturionOldPlain-Regular", italic: "CenturionOldItalic-Regular", bold: "CenturionOldBold-Regular"
        },
        'Century Gothic': {
            regular: "CenturyGothic-Regular", italic: "CenturyGothic-Italic", bold: "CenturyGothic-Bold", bold_italic: "CenturyGothic-BoldItalic"
        },
        'Comic Sans': {
            regular: "ComicSansMS-Regular", bold: "ComicSansMS-Bold"
        },
        'Freehand 521': {
            regular: "Freehand521BT-RegularC"
        },
        'Freestyle Script': {
            regular: "FreestyleScript-Regular"
        },
        'Futura MD BT': {
            regular: "FuturaBT-Medium"
        },
        'Helvetica Condensed': {
            regular: "Candara-Regular", italic: "Candara-Italic", bold: "Candara-Bold", bold_italic: "Candara-BoldItalic"
        },
        'Prose Antique': {
            regular: "ProseAntiquePlain-Regular", bold: "ProseAntiqueBold-Regular"
        },
        'Sonic Cut': {
            regular: "SonicCutThruBT-Heavy"
        },
        'Times New Roman': {
            regular: "Times New Roman"
        },
        'Venetian': {
            regular: "Venetian301BT-Roman", italic: "Venetian301BT-Italic", bold: "Venetian301BT-Demi", bold_italic: "Venetian301BT-DemiItalic"
        },
        'Verdana': {
            regular: "Verdana"
        },
        'Vineta BT': {
            regular: "VinetaBT-Regular"
        }
    }
});
