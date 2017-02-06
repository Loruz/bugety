var budgedController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {

            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage
    };
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budged: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {
            var newItem;
            var ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            // Create new Items based on 'exp' or 'inc'

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }

            // Push new Items into data structure
            data.allItems[type].push(newItem);

            // Return newItem
            return newItem;
        },
        deleteItem: function (type, id) {

            var ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            var index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudged: function () {

            //calculate total income and expenses

            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budged : income - expenses

            data.budged = data.totals.inc - data.totals.exp;

            // calculate percentage of income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function () {
            return data.allItems.exp.map(function (current) {
                return current.getPercentage()
            });
        },

        getBudged: function () {
            return {
                budged: data.budged,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        test: function () {
            console.log(data)
        }
    };
})();

//****************************************************************************************************************

//****************************************************************************************************************

var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        expensesPercentage: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage'
    };

    var formatNumbers = function (number, type) {

        number = Math.abs(number);
        number = number.toFixed(2);

        var numberSplit = number.split('.');

        var int = numberSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310, output 2,310
        }

        var dec = numberSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)

            }
        },
        getDOMstrings: function () {
            return DOMStrings;
        },

        addListItem: function (obj, type) {

            var html;
            var newHtml;
            var element;

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>';
            }
            else {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__percentage"></div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>';
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type));
            newHtml = newHtml.replace('%description%', obj.description);
            //
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el)
        },

        clearFields: function () {
            var fields;
            var fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            var type;
            obj.budged > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumbers(obj.budged, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumbers(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumbers(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.expensesPercentage).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMStrings.expensesPercentage).textContent = '---';
            }
        },

        displayPercentage: function (percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);


            var nodeListForEach = function (list, callback) {

                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }

            };

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';

                }

            });
        }
    }

})();

//****************************************************************************************************************

//****************************************************************************************************************

var controller = (function (budgetCtrl, uiCtrl) {


    var setupEventListeners = function () {

        var DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem()
            }
        });

        document.querySelector(DOM.container).addEventListener('click', controlDeleteItem);


    };

    var updateBudged = function () {

        budgetCtrl.calculateBudged();

        //calculate the budged

        var budget = budgetCtrl.getBudged();


        uiCtrl.displayBudget(budget);

        //display budged


    };

    var updatePercentage = function () {
        // 1. calculate percentage

        budgetCtrl.calculatePercentage();

        // 2.read percentage from budget controller

        var percentages = budgetCtrl.getPercentages();

        // 3. update the UI
        uiCtrl.displayPercentage(percentages)
    };


    var ctrlAddItem = function () {
        //Get the field data
        var input = UIController.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //add the item to budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // add the item to UI
            uiCtrl.addListItem(newItem, input.type);
            //clear the fields
            uiCtrl.clearFields();
            updateBudged();
            updatePercentage();
        }
    };
    var controlDeleteItem = function (event) {
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            var splitId = itemID.split('-');
            var type = splitId[0];
            var ID = parseInt(splitId[1]);

            budgetCtrl.deleteItem(type, ID);
            uiCtrl.deleteListItem(itemID);
            updateBudged();
            updatePercentage();
        }
    };

    return {
        init: function () {
            uiCtrl.displayBudget({
                budged: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners()
        }
    }


})(budgedController, UIController);

controller.init();