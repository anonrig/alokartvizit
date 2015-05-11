'use strict';

angular.module('aloApp').controller('MainController', function($scope, $http) {
    $scope.activeView = 'template';

    $scope.getTemplates = function() {
        $http.get('http://signa.dev/assets/data.json', {
            request: -1,
            type: 1,
            page: 0
        })
            .success(function(response) {
                $scope.templates = response;
                console.log(response);
            });
    };

    $scope.getTemplate = function(id) {
        $http.get('http://signa.dev/assets/template.xml')
            .success(function(response) {
                $scope.template = response;
                console.log(response);
            });
    };

    $scope.getTemplates();
});
