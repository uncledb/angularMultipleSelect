(function () {

    angular.module('multipleSelect').directive('multipleAutocomplete', [
        '$filter',
        '$http',
        '$timeout',
        function ($filter, $http, $timeout) {
            return {
                restrict: 'EA',
                scope: {
                    suggestionsArr: '=',
                    modelArr: '=ngModel',
                    apiUrl: '@'
                },
                templateUrl: 'multiple-autocomplete-tpl.html',
                link: function (scope, element, attr) {
                    scope.objectProperty = attr.objectProperty;
                    //dongbin 备注 比如人员需要显示手机号 //objectProperty重复的时候 显示remarkProperty
                    scope.remarkProperty = attr.remarkProperty;
                    if (scope.remarkProperty) {
                        $timeout(function () {
                            scope.repeatArr = getRepeatItemsInArray(scope.suggestionsArr, scope.objectProperty);
                        }, 2000);
                    }

                    scope.selectedItemIndex = 0;
                    scope.name = attr.name;
                    scope.isRequired = attr.required;
                    scope.errMsgRequired = attr.errMsgRequired;
                    scope.isHover = false;
                    scope.isFocused = false;
                    var getSuggestionsList = function () {
                        var url = scope.apiUrl;
                        $http({
                            method: 'GET',
                            url: url
                        }).then(function (response) {
                            scope.suggestionsArr = response.data;
                        }, function (response) {
                            console.log("*****Angular-multiple-select **** ----- Unable to fetch list");
                        });
                    };

                    if (scope.suggestionsArr == null || scope.suggestionsArr == "") {
                        if (scope.apiUrl != null && scope.apiUrl != "")
                            getSuggestionsList();
                        else {
                            console.log("*****Angular-multiple-select **** ----- Please provide suggestion array list or url");
                        }
                    }

                    if (scope.modelArr == null || scope.modelArr == "") {
                        scope.modelArr = [];
                    }
                    scope.onFocus = function () {
                        scope.isFocused = true
                    };

                    scope.onMouseEnter = function () {
                        scope.isHover = true
                    };

                    scope.onMouseLeave = function () {
                        scope.isHover = false;
                    };

                    scope.onBlur = function () {
                        scope.isFocused = false;
                    };

                    scope.onChange = function () {
                        scope.selectedItemIndex = 0;
                    };

                    scope.keyParser = function ($event) {
                        var keys = {
                            38: 'up',
                            40: 'down',
                            8: 'backspace',
                            13: 'enter',
                            9: 'tab',
                            27: 'esc'
                        };
                        var key = keys[$event.keyCode];
                        if (key == 'backspace' && scope.inputValue == "") {
                            if (scope.modelArr.length != 0)
                                scope.modelArr.pop();
                        }
                        else if (key == 'down') {
                            var filteredSuggestionArr = $filter('filter')(scope.suggestionsArr, scope.inputValue);
                            filteredSuggestionArr = $filter('filter')(filteredSuggestionArr, scope.alreadyAddedValues);
                            if (scope.selectedItemIndex < filteredSuggestionArr.length - 1)
                                scope.selectedItemIndex++;
                        }
                        else if (key == 'up' && scope.selectedItemIndex > 0) {
                            scope.selectedItemIndex--;
                        }
                        else if (key == 'esc') {
                            scope.isHover = false;
                            scope.isFocused = false;
                        }
                        else if (key == 'enter') {
                            var filteredSuggestionArr = $filter('filter')(scope.suggestionsArr, scope.inputValue);
                            filteredSuggestionArr = $filter('filter')(filteredSuggestionArr, scope.alreadyAddedValues);
                            if (scope.selectedItemIndex < filteredSuggestionArr.length)
                                scope.onSuggestedItemsClick(filteredSuggestionArr[scope.selectedItemIndex]);
                        }
                    };

                    scope.onSuggestedItemsClick = function (selectedValue) {
                        scope.modelArr.push(selectedValue);
                        scope.inputValue = "";
                    };

                    var isDuplicate = function (arr, item) {
                        var duplicate = false;
                        if (arr == null || arr == "")
                            return duplicate;

                        for (var i = 0; i < arr.length; i++) {
                            duplicate = angular.equals(arr[i], item);
                            if (duplicate)
                                break;
                        }
                        return duplicate;
                    };

                    scope.alreadyAddedValues = function (item) {
                        var isAdded = true;
                        isAdded = !isDuplicate(scope.modelArr, item);
                        //if(scope.modelArr != null && scope.modelArr != ""){
                        //    isAdded = scope.modelArr.indexOf(item) == -1;
                        //    console.log("****************************");
                        //    console.log(item);
                        //    console.log(scope.modelArr);
                        //    console.log(isAdded);
                        //}
                        return isAdded;
                    };

                    scope.removeAddedValues = function (item) {
                        if (scope.modelArr != null && scope.modelArr != "") {
                            var itemIndex = scope.modelArr.indexOf(item);
                            if (itemIndex != -1)
                                scope.modelArr.splice(itemIndex, 1);
                        }
                    };

                    scope.mouseEnterOnItem = function (index) {
                        scope.selectedItemIndex = index;
                    };

                    /**
                     * 获取重名 dongbin
                     * @param arr
                     * @param column
                     * @returns {Array}
                     */
                    function getRepeatItemsInArray(arr, column) {
                        var newArr = [];
                        var repetitionArr = [];
                        var i = 0;
                        if (column) {//对象数组
                            for (i = 0; i < arr.length; i++) {
                                if (newArr.indexOf(arr[i][column]) == -1) {
                                    newArr.push(arr[i][column])
                                } else {
                                    if (repetitionArr.indexOf(arr[i][column]) == -1) {
                                        repetitionArr.push(arr[i][column])
                                    }
                                }
                            }
                        } else {
                            for (i = 0; i < arr.length; i++) {
                                if (newArr.indexOf(arr[i]) == -1) {
                                    newArr.push(arr[i])
                                } else {
                                    if (repetitionArr.indexOf(arr[i]) == -1) {
                                        repetitionArr.push(arr[i])
                                    }
                                }
                            }
                        }
                        return repetitionArr;
                    }
                }
            };
        }
    ]);
})();