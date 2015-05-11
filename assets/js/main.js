var aloApp = angular.module('aloApp', [
    'ngRoute'
]);

aloApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        otherwise({
            redirectTo: '/'
        });
}]);