var aloApp = angular.module('aloApp', [
    'ngRoute',
    'ngSanitize',
    'xml',
    'common.fabric',
    'common.fabric.utilities',
    'common.fabric.constants',
    'infinite-scroll',
    'ngFileUpload',
    'angular-growl',
    'colorpicker.module',
    'ngContextMenu',
    'Alertify'
]);


aloApp.config(['growlProvider', function(growlProvider) {
    growlProvider.onlyUniqueMessages(false);
    growlProvider.globalTimeToLive(5000);
}]);


aloApp.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $routeProvider.
        otherwise({
            redirectTo: '/'
        });

    $httpProvider.interceptors.push('xmlHttpInterceptor');
}]);
