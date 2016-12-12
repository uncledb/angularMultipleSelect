angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("multiple-autocomplete-tpl.html","<div class=\"ng-ms form-item-container\" ng-init=\"ph = \'\'\">\n	<ul class=\"list-inline\"\n			ng-mouseenter=\"ph=\'请输入或选择\'\"\n			ng-mouseleave=\"ph=\'\'\">\n		<li ng-if=\"isSingleChoose && modelArr\">\n            <span ng-if=\"objectProperty == undefined || objectProperty == \'\'\"\n									ng-mouseover=\"showDeleleIcon = true\" ng-mouseleave=\"showDeleleIcon = false\"\n						>\n				{{modelArr}}\n                <span ng-show=\"showDeleleIcon\" class=\"remove\" ng-click=\"removeAddedValues(modelArr)\">\n                    <i class=\"glyphicon glyphicon-remove\"></i>\n                </span>&nbsp;\n			</span>\n            <span ng-if=\"objectProperty != undefined && objectProperty != \'\' && modelArr[objectProperty]\"\n									ng-mouseover=\"showDeleleIcon = true\" ng-mouseleave=\"showDeleleIcon = false\"\n						>\n				{{modelArr[objectProperty]}} {{repeatArr && (repeatArr.indexOf(modelArr[objectProperty]) !== -1 ? \'(\' + (modelArr[remarkProperty] || \'无\') + \')\' : \'\' ) }}\n                <span ng-show=\"showDeleleIcon\" class=\"remove\" ng-click=\"removeAddedValues(modelArr)\">\n                     <i class=\"glyphicon glyphicon-remove\"></i>\n                </span>&nbsp;\n			</span>\n		</li>\n		<li ng-if=\"!isSingleChoose && modelArr\" ng-repeat=\"item in modelArr track by $index\">\n			<span ng-if=\"objectProperty == undefined || objectProperty == \'\'\"\n						ng-mouseover=\"showDeleleIcon = true\" ng-mouseleave=\"showDeleleIcon = false\"\n			>\n				{{item}}<span ng-show=\"showDeleleIcon\" class=\"remove\" ng-click=\"removeAddedValues(item)\">\n                <i class=\"glyphicon glyphicon-remove\"></i></span>&nbsp;\n			</span>\n            <span ng-if=\"objectProperty != undefined && objectProperty != \'\'\"\n									ng-mouseover=\"showDeleleIcon = true\" ng-mouseleave=\"showDeleleIcon = false\"\n						>\n				{{item[objectProperty]}} {{repeatArr && (repeatArr.indexOf(item[objectProperty]) !== -1 ? \'(\' + (item[remarkProperty] || \'无\') + \')\' : \'\' ) }}\n                <span ng-show=\"showDeleleIcon\" class=\"remove\" ng-click=\"removeAddedValues(item)\">\n                <i class=\"glyphicon glyphicon-remove\"></i></span>&nbsp;\n			</span>\n		</li>\n		<li>\n			<input name=\"{{name}}\" ng-model=\"inputValue\" placeholder=\"{{ph}}\"\n						 ng-keydown=\"keyParser($event)\"\n						 style=\"width: 100px;\"\n						 err-msg-required=\"{{errMsgRequired}}\"\n						 ng-focus=\"onFocus()\" ng-blur=\"onBlur()\" ng-required=\"!modelArr.length && isRequired\"\n						 ng-change=\"onChange()\">\n		</li>\n	</ul>\n\n	<div class=\"autocomplete-list\"\n			 ng-show=\"isFocused || isHover\"\n			 ng-mouseenter=\"onMouseEnter()\"\n			 ng-mouseleave=\"onMouseLeave()\">\n		<ul\n				ng-if=\"objectProperty == undefined || objectProperty == \'\'\"\n				infinite-scroll=\"loadMore()\"\n				infinite-scroll-parent=\"true\">\n			<li ng-class=\"{\'autocomplete-active\' : selectedItemIndex == $index}\"\n					ng-repeat=\"suggestion in suggestionsArr | filter : inputValue | filter : alreadyAddedValues\"\n					ng-click=\"onSuggestedItemsClick(suggestion)\" ng-mouseenter=\"mouseEnterOnItem($index)\">\n				{{suggestion}}\n			</li>\n		</ul>\n		<ul ng-if=\"objectProperty != undefined && objectProperty != \'\'\"\n				infinite-scroll=\"loadMore()\"\n				infinite-scroll-parent=\"true\">\n			<li ng-class=\"{\'autocomplete-active\' : selectedItemIndex == $index}\"\n					ng-repeat=\"suggestion in suggestionsArr | filter : inputValue | filter : alreadyAddedValues track by $index\"\n					ng-click=\"onSuggestedItemsClick(suggestion)\" ng-mouseenter=\"mouseEnterOnItem($index)\">\n				{{suggestion[objectProperty]}}<span\n				ng-if=\"repeatArr && repeatArr.indexOf(suggestion[objectProperty])!== -1\">({{suggestion[remarkProperty] || \'无\'}})</span>\n			</li>\n		</ul>\n		<span ng-show=\"busy\">正在加载...</span>\n	</div>\n\n</div>\n");}]);
(function () {
    //declare all modules and their dependencies.
    angular.module('multipleSelect', [
        'templates',
	      'infinite-scroll'
    ]).config(function () {

    });
}
)();
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
					apiUrl: '@',
					apiParams: '@',
					isSingleChoose: '='
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

					if (scope.apiParams) {
						scope.apiParams = JSON.parse(scope.apiParams);
					} else {
						scope.apiParams = {key: '', pagenum: 1, countperpage: 50};
					}
					var getSuggestionsList = function () {
						if (scope.busy) {
							return false;
						}
						scope.busy = true;

						var url = scope.apiUrl || '/';
						$http({
							method: 'GET',
							url: url,
							params: {param: JSON.stringify(scope.apiParams)}
						}).then(function (response) {
							response = response.data;
							if (angular.isArray(scope.suggestionsArr)) {
								scope.suggestionsArr.concat(response);
							} else {
								scope.suggestionsArr = response;
							}
							scope.apiParams.pagenum += 1;
							scope.busy = false;
						}, function (response) {
							// console.log("*****Angular-multiple-select **** ----- Unable to fetch list");
						});
					};

					if (scope.suggestionsArr == null || scope.suggestionsArr == "") {
						if (scope.apiUrl != null && scope.apiUrl != "")
							getSuggestionsList();
						else {
							// console.log("*****Angular-multiple-select **** ----- Please provide suggestion array list or url");
						}
					}
					scope.busy = false;
					scope.loadMore = getSuggestionsList;

					if (scope.modelArr == null || scope.modelArr == "") {
						if (!scope.isSingleChoose) {
							scope.modelArr = [];
						}
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
							if (scope.isSingleChoose) {
								scope.modelArr = null;
							} else {
								if (scope.modelArr.length != 0)
									scope.modelArr.pop();
							}
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
						if (scope.isSingleChoose) {
							scope.modelArr = selectedValue;
							scope.isHover = false;
							scope.isFocused = false;
							// console.log(scope.modelArr);

						} else {
							scope.modelArr.push(selectedValue);
						}
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
						if (scope.isSingleChoose) {
							scope.modelArr = null;
						} else {
							if (scope.modelArr != null && scope.modelArr != "") {
								var itemIndex = scope.modelArr.indexOf(item);
								if (itemIndex != -1)
									scope.modelArr.splice(itemIndex, 1);
							}
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