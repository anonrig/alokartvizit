'use strict';

angular.module('aloApp').controller('EditorController', function($scope, $rootScope, $http, $compile, $location, Fabric, FabricConstants, FabricCanvas, Keypress, Alertify) {
    $scope.fabric = {};
    $scope.FabricConstants = FabricConstants;

    $scope.editorMode = $location.search()['editor_mode'] || 1;
    $scope.uniqueId = $location.search()['unique_id'];
    $scope.productId = $location.search()['no'];
    $scope.isNew = $location.search()['isnew'] == '1';
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

        $scope.fabric.setCanvasSize(992, 602);

        var canvasWidth = $scope.fabric.canvasOriginalWidth;
        var containerWidth = $('.editor').width() - 60;

        if (canvasWidth > containerWidth) {
            var percent = containerWidth * 100 / canvasWidth;
            $scope.fabric.canvasScale = parseInt(percent) / 100;
            $scope.fabric.setZoom();
        }

        if ($scope.uniqueId && $scope.uniqueId.length) {
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
        $scope.setCanvasView($scope.currentTemplate);
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

    $scope.createImages = function(){
        var return_val = [];
        $.each(FabricCanvas.getCanvasList(), function(id) {
            return_val.push(FabricCanvas.getCanvasImagesById(id));
        });
        return return_val;
    };

    $scope.saveDesign = function() {
        alertify.set({
            buttonFocus: "none",
            labels: {
                ok: "Tamam",
                cancel: "İptal"
            }
        });

        alertify.confirm('Tasarımınız kaydedilecektir ve editörden çıkılacaktır.Devam etmek istiyor musunuz?', function (e) {
            $("#alertify-cancel").blur();
            $("#alertify-ok").blur();
            if (e) {
                $http.post('http://alokartvizit.com/designer/fabrics/ajax.php', JSON.stringify({
                    request: null,
                    is_new: $scope.isNew,
                    str_xml: $scope.fabric.getJSON(),
                    page_count: 0,
                    product_id: $scope.productId,
                    unique_id: $scope.uniqueId,
                    operation: 'save',
                    member_type: $scope.editorMode == '2' ? 'admin' : 'customer',
                    images: $scope.createImages()
                })).success(function(data) {
                    console.log(data)
                    if (typeof data.error == "undefined") {
                        if(data.success == true)
                            window.location = data['redirect_url'];
                    } else
                        console.log('Kaydetme Hatası')
                });

            }
            return false;
        });
    };

    $scope.setCanvasView = function(data) {
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

            $scope.currentTemplate['design']['page']['layout']['group'].forEach(function(text, index) {
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
                    angle: text['angle'] || 0,
                    top: parseFloat(text['_topy'] * $scope.fabric.canvasScale, 10),
                    left: parseFloat(text['_leftx'] * $scope.fabric.canvasScale, 10),
                    fontFamily: fontFamily,
                    fontSize: parseInt(text.text.font._fontsize),
                    fontWeight: (text.text.font._fontbold == "1" ? "bold" : "normal"),
                    fontStyle: (text.text.font._fontitalic == "1" ? "italic" : "normal"),
                    textDecoration: (text.text.font._fontul == "1" ? "underline" : "none"),
                    textAlign: text.text.font._fontalign,
                    cursorColor: '#' + fontColor,
                    fill:  '#' + fontColor,
                    layoutIndex: index,
                    originalData: text
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


    $scope.el = null;
    $scope.object = null, $scope.lastActive = null, $scope.object1 = null, $scope.object2 = null;
    $scope.cntObj = 0;
    $scope.selection_object_left = 0;
    $scope.selection_object_top = 0;

    $scope.selectedCropObject = {};
    $scope.startClip = false;
    $scope.cropType  = '';

    $scope.clipObject = function(type) {
        $scope.startClip = true;
        $scope.cropType = type;
        var canvas = $scope.fabric.getCanvas();

        canvas.remove($scope.el);
        if (canvas.getActiveObject()) {
            $scope.selectedCropObject = canvas.getActiveObject();

            if ($scope.cropType == 'rect')
                $scope.el = new fabric.Rect({
                    fill: 'rgba(0,0,0,0.3)',
                    originX: 'left',
                    originY: 'top',
                    stroke: '#ccc',
                    strokeDashArray: [2, 2],
                    opacity: 1,
                    width: 1,
                    height: 1,
                    borderColor: '#36fd00',
                    cornerColor: 'green',
                    hasRotatingPoint: false
                });
            else if ($scope.cropType == 'circle') {
                var width = $scope.selectedCropObject.get('width');
                var height = $scope.selectedCropObject.get('height');
                $scope.el = new fabric.Circle({
                    width: width,
                    height: height,
                    left: 0,
                    top: 0,
                    angle: 0,
                    startAngle: 0,
                    endAngle: Math.PI,
                    stroke: '#ccc',
                    strokeDashArray: [2, 2],
                    fill: 'rgba(0,0,0,0.3)'
                });
            }

            $scope.el.left = canvas.getActiveObject().left;
            $scope.selection_object_left = canvas.getActiveObject().left;
            $scope.selection_object_top = canvas.getActiveObject().top;
            $scope.el.top = canvas.getActiveObject().top;
            $scope.el.width = canvas.getActiveObject().width * canvas.getActiveObject().scaleX;
            $scope.el.height = canvas.getActiveObject().height * canvas.getActiveObject().scaleY;

            canvas.add($scope.el);
            canvas.setActiveObject($scope.el);
        }
    };


    $scope.cropObject = function() {
        var canvas = $scope.fabric.getCanvas();
        var object = canvas.getActiveObject();

        if ($scope.selectedCropObject) {
            var eLeft = $scope.el.get('left');
            var eTop = $scope.el.get('top');
            var left = eLeft - $scope.selectedCropObject.left;
            var top = eTop - $scope.selectedCropObject.top;

            left *= 1;
            top *= 1;

            var eWidth = $scope.el.get('width');
            var eHeight = $scope.el.get('height');
            var eScaleX = $scope.el.get('scaleX');
            var eScaleY = $scope.el.get('scaleY');
            var radius = $scope.el.get('radius');
            var width = eWidth * 1;
            var height = eHeight * 1;

            $scope.selectedCropObject.clipTo = function (ctx) {
                if ($scope.cropType == 'rect')
                    ctx.rect(-(eWidth / 2) + left, -(eHeight / 2) + top, parseInt(width * eScaleX), parseInt(eScaleY * height));
                else if ($scope.cropType == 'circle')
                    ctx.arc(left, top, radius, 0, Math.PI * 2, true);
            };

            $scope.selectedCropObject.selectable = true;

            $scope.disabled = true;

            canvas.remove($scope.el);
            $scope.lastActive = $scope.selectedCropObject;
            canvas.renderAll();
            $scope.startClip = false;
        }
    };

    $scope.propertyType = 'text';
    $scope.toggleObjectProperties = function(isSelected, e) {
        $scope.objectSelected = isSelected;
        if (!$scope.objectSelected)
            return;

        if (e && e['detail'] && e['detail']['text']) {
            $scope.propertyType = 'text';
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
        }
        else if (e && e['detail'] && !e['detail']['text']) {
            $scope.propertyType = 'image';
            $scope.setObjectProperties({
                options: {
                    object: {
                        top: e['detail']['top'],
                        left: e['detail']['left'],
                        currentHeight: e['detail']['currentHeight']
                    },
                    canvas: {
                        offsetTop: $scope.fabric.getCanvas()['_offset']['top'],
                        offsetLeft: $scope.fabric.getCanvas()['_offset']['left']
                    }
                }
            });
        }
        else
            $scope.objectSelected = false;

        if ($scope.objectSelected)
            $scope.canvasChanged = true;
    };

    $scope.setObjectProperties = function(data) {
        if (data['options']) {
            $scope.objectProperties = data['options']['object'];
            var canvasProperties = data['options']['canvas'];
            var propertyWidgetWidth = $('.objectProperties').width();

            var margin = ($('.image-builder').width() - $('.fabric-container').width()) / 2;
            margin = margin > 20 ? margin : 20;

            var top = $scope.objectProperties['top'] + $scope.objectProperties['currentHeight'] + canvasProperties['offsetTop'] + 20;
            var left = $scope.objectProperties['left'] + margin;

            if (left > window.innerWidth - (propertyWidgetWidth * 2))
                left = window.innerWidth - (propertyWidgetWidth * 2);

            if (left < margin)
                left = margin;

            $scope.setObjectFont();
            $scope.propertyElStyles = {
                'top': top + 'px',
                'left': left + 'px'
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
        var index = e['detail']['layoutIndex'];
        $scope.selectedObject = e['detail'];
        if ($scope.currentTemplate['design']['page']['layout']['group'][index]) {
            $scope.currentTemplate['design']['page']['layout']['group'][index] = e['detail']['originalData'];
            $scope.currentTemplate['design']['page']['layout']['group'][index]['_leftx'] = parseFloat(e['detail']['left'] / $scope.fabric.canvasScale, 10);
            $scope.currentTemplate['design']['page']['layout']['group'][index]['_topy'] = parseFloat(e['detail']['top'] / $scope.fabric.canvasScale, 10);
        }


    }, false);

    document.addEventListener('objectRotated', function (e) {
        $scope.selectedObject = e['detail'];
        var index = e['detail']['layoutIndex'];
        $scope.currentTemplate['design']['page']['layout']['group'][index] = e['detail']['originalData'];
        $scope.currentTemplate['design']['page']['layout']['group'][index]['angle'] = e['detail']['angle'];
    });

    document.addEventListener('objectSelected', function (e) {
        $scope.selectedObject = e['detail'];
        $scope.toggleObjectProperties(true, e);
    }, false);

    $rootScope.$on('templateChange', $scope.updateCanvasView);
    $rootScope.$on('addTextToEditor', function(e, data) {
        var nextIndex = $scope.currentTemplate['design']['page']['layout']['group'].length;
        var newText = {
            _leftx: 0,
            _topy: 0,
            text: {
                _value: 'Yeni Metin',
                font: {
                    _fontalign: 'left',
                    _fontbold: '0',
                    _fontcolor: '-14738921',
                    _fontface: 'Times New Roman',
                    _fontitalic: '0',
                    _fontsize: parseInt(data),
                    _fontul: '0'
                }
            },
            layoutIndex: nextIndex
        };

        var addedText = new fabric.IText('Yeni Metin', {
            fontSize: parseInt(data),
            layoutIndex: nextIndex,
            originalData: newText
        }).scale($scope.fabric.canvasScale);

        $scope.fabric.getCanvas().add(addedText);
        $scope.currentTemplate['design']['page']['layout']['group'].push(newText);
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
