'use strict';

angular.module('aloApp').controller('MainController', function($scope, $rootScope, $http) {
    $scope.activeView = 'template';

    $scope.getTemplates = function() {
        $http.get('assets/data.json', {
            request: -1,
            type: 1,
            page: 0
        })
            .success(function(response) {
                $scope.templates = response;
                console.log(response);
            });
    };

    $scope.getTemplate = function(record) {
        // record['UniqueID']
        $http.get('assets/template.xml')
            .success(function(response) {
                $scope.template = response;
                console.log(response);
                $rootScope.$broadcast('templateChange', {
                    record: record
                });
            });

    };

    $scope.getTemplates();
});
