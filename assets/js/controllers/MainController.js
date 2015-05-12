'use strict';

angular.module('aloApp').controller('MainController', function($scope, $rootScope, $http) {
    $scope.activeView = 'template';
    $scope.currentPage = 0;
    $scope.templates = {
        records: []
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
});
