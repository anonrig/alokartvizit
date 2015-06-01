'use strict';

angular.module('aloApp').controller('MainController', function($scope, $rootScope, $http, Upload) {
    $scope.activeView = 'template';
    $scope.currentPage = 0;
    $scope.templates = {
        records: []
    };

    $scope.uploadedImages = [];
    $scope.uploadedBgImages = [];

    $scope.setActiveView = function(view) {
        $scope.activeView = view;
    };

    $scope.getTemplates = function() {
        $http.post('http://alokartvizit.com/designer/fabrics/ajax.php', {
            request: -1,
            type: 1,
            page: $scope.currentPage
        }).success(function(response) {
            $scope.templates.records = $scope.templates.records.concat(response.records);
        });
    };

    $scope.incrementCurrentPage = function() {
        $scope.currentPage += 1;
    };

    $scope.getTemplate = function(record) {
        $http.post('http://alokartvizit.com/designer/fabrics/ajax.php', {
            request: 1,
            uniqueid: record
        }).success(function(response) {
            $scope.template = response;
            $rootScope.$broadcast('templateChange', response);
        });

    };

    $scope.getTemplates($scope.currentPage);

    $scope.loadMore = function() {
        $scope.incrementCurrentPage();
        $scope.getTemplates();
    };

    $scope.addTextToEditor = function(fontSize) {
        $rootScope.$broadcast('addTextToEditor', fontSize);
    };

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.progressPercentage = 0;
    $scope.upload = function (files) {
        var url = 'upload/url';
        //if ($scope.activeView == 'background')
        //    url = 'http://alokartvizit.com/designer/fabrics/upload_form/upload.php?imageType=bg';

        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: url,
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + $scope.progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    if ($scope.activeView == 'background')
                        $scope.uploadedBgImages.push(data);
                    else
                        $scope.uploadedImages.push(data);

                    console.log($scope.uploadedBgImages)
                    console.log($scope.uploadedImages)
                });
            }
        }
    };

    $scope.addBackgroundToEditor = function(image) {
        $rootScope.$broadcast('addBackgroundToEditor', image);
    };

    $scope.addImageToEditor = function(image) {
        $rootScope.$broadcast('addImageToEditor', image);
    };
});
