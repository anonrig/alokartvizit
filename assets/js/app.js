var aloApp = angular.module('aloApp', [
    'ngRoute',
    'ngSanitize',
    'xml',
    'common.fabric',
    'common.fabric.utilities',
    'common.fabric.constants',
    'infinite-scroll',
    'ngFileUpload'
]);

aloApp.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $routeProvider.
        otherwise({
            redirectTo: '/'
        });

    $httpProvider.interceptors.push('xmlHttpInterceptor');
}]);
