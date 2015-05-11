var aloApp = angular.module('aloApp', [
    'ngRoute',
    'ngSanitize'
]);

aloApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        otherwise({
            redirectTo: '/'
        });
}]);