var aloApp = angular.module('aloApp', [
    'ngRoute',
    'ngSanitize',
    'xml'
]);

aloApp.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $routeProvider.
        otherwise({
            redirectTo: '/'
        });

    $httpProvider.interceptors.push('xmlHttpInterceptor');
}]);