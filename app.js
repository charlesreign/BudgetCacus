
//BUDGET CONTROLLER
var budgetController =(function(){

    //function constructor for Expenses
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentages =function(){
        return this.percentage
    }

     //function constructor for Income
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;

    };

    //creating an array to store all the EXPENSE and INCOME
    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    }
    
    return{
        addItem: function(type,des,val){

            //creating a variable that declare an instance of the EXPENSE constructor
            var newItem, ID;
            
            if(data.allItems[type].length > 0){
                //giving a unique ID to each element in the array
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            

            //create a new item base on inc or exp type
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }

            //push the new item in the data structure and return the new element
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type,id){
            var ids, index;

            //map is also an array kind in javascript that always returns a new array
            ids = data.allItems[type].map(function(current){
                return current.id; 
            });

            index = ids.indexOf(id);

            if(index !== -1){
                //splice is a method for removing values from an array
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget:function(){
            //calculate the total income and expenses
            calculateTotal('exp');
            calculateTotal('inc')

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp

            if(data.totals.inc > 0){
            //calculate the percentage of income that we spent
            data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
        }
        else{
            data.percentage = -1;
        }

        },

        calculatePercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calPercentage(data.totals.inc);

            });
        },

        getPercentages:function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentages()
            });
            return allPerc;

        },

        getBudget:function(){
            return{
                budget:data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage:data.percentage
            }

        },

        testing : function(){
            console.log(data);
            
        }
        
    };
    
    
})();

//USER INTERFACE CONTROLLER
var uiController=(function(){
    //using the DRY principle to arrange all of our classes
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budgetLable:'.budget__value',
        incomeLable: '.budget__income--value',
        expenseLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month',


    };

    var formatNumber = function(num, type){
        // + or - before a number
        //exactly teo decimal points
        //comma separating thousands
        var numSplit, int, dec;

        num = Math.abs(num)
        //getting the number to exactly two decimal points using the toFixed method
        num = num.toFixed(2)
        numSplit = num.split('.')

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length - 3, 3)
        }
        dec = numSplit[1];
        

        return (type==='exp' ? '-' : '+') + ' ' + int + '.'+ dec;

    };

    var NodeListForEach = function(list,callback){
        for(var i =0; i < list.length; i++){
            callback(list[i],i);
        }

    };
    
    //getting the inputs and data from the userinterface
    return{
        getInput: function() {

            return{
                //getting the type of operator selected
            type: document.querySelector(DOMStrings.inputType).value,
            description: document.querySelector(DOMStrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function(obj, type){
            var html,newTHML,element;
            //create HTML string with a placeholder text
            if(type ==='inc'){
            element = DOMStrings.incomeContainer;
            html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description% </div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type ==='exp'){
            element = DOMStrings.expenseContainer;
            html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
             //replace the placeholder with some actual data
             newTHML = html.replace('%id%',obj.id);
             newTHML = newTHML.replace('%description%',obj.description);
             newTHML = newTHML.replace('%value%', formatNumber(obj.value,type));

            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newTHML)
        },

        deleteListItem:function(selectorID){
            var el = document.getElementById(selectorID); 
            el.parentNode.removeChild(el);

        },

        clearFields:function(){
            var fields,fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ','+ DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
             
            fieldsArr.forEach(function(current,index,array){
                current.value="";
            });
            fieldsArr[0].focus();

        },

        displayBudget:function(obj){
            obj.budget > 0 ? type = 'inc': type = 'exp';

            document.querySelector(DOMStrings.budgetLable).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLable).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expenseLable).textContent = formatNumber(obj.totalExp,'exp');
            

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLable).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMStrings.percentageLable).textContent = obj.percentage + '---';
            }
        },

        displayPercentages:function(percentages){

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            NodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%'
                }
                else{
                    current.textContent = '---'

                }
                

            })
        },

        displayMonth:function(){
            var now, year, month, months;
            now = new Date();
            monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = monthNames[month] + ' '+ year;

        },

        changeType:function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue
            );

            NodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus')
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red')

        },

        //trying to get access to the DOMStrings object
        getDOMString:function(){
            return DOMStrings;
        }
    }

})();

//ALL THE MODULES CONTROLLER
var controller = (function(budgetCntrl, uictrl){

    //creating a function that will keep all the eventListeners
    var setUpEventListener = function(){
        //getting the DOMString object in this module
        var DOM = uiController
        .getDOMString();

        document.querySelector(DOM.inputBtn).addEventListener('click',cntrlAddItem);

        //writting the event listener when the ENTER KEY is pressed
        document.addEventListener('keypress',function(event) {
            if(event.keyCode == 13 || event.which == 13){
                cntrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',cntrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', uictrl.changeType);

    };

    var updateBudget = function(){

        //calculate the budget
        budgetCntrl.calculateBudget();

        //return the budget
        var budget = budgetCntrl.getBudget();

        //display the item on the userinterface
        uictrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        //calculate the percentages
        budgetCntrl.calculatePercentages();

        //Read percentages from budget controller
        var percentages = budgetCntrl.getPercentages();

        //update the userinterface with the new percentages
        uiController.displayPercentages(percentages)
        
    }

    var cntrlAddItem = function(){
        var input,newItem;
        //getting input data
        input = uiController.getInput();

        //this code makes sure that the input fields are not empty
        if(input.description !=="" && !isNaN(input.value) && input.value > 0){

             //add the item to the budgetController
        newItem = budgetCntrl.addItem(input.type, input.description, input.value)

        //add the item to userinterface
        uictrl.addListItem(newItem,input.type);

        //clear the fields
        uiController.clearFields();

        //calculate and update budget
        updateBudget();

        //calculate the updated percentages 
        updatePercentages();

        }
        
    };

    var cntrlDeleteItem = function(event){
        var itemID, splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            //using the split method that all strings have access to in javascript
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCntrl.deleteItem(type,ID);

            //2.Delete from the userinterface
            uictrl.deleteListItem(itemID);
 
            //3.Update and show new budget
            updateBudget();

            //4. Calculate the updated percentages
            updatePercentages();

        }
    }

    return{
        init: function(){
            console.log('The application is working');
            uictrl.displayMonth();
            uictrl.displayBudget({budget:0,
                totalInc: 0,
                totalExp: 0,
                percentage: ''});
            setUpEventListener();
        }
    };

})(budgetController,uiController);

controller.init();

//modules can also receieve arguments because ther are just function expressions
//am passing the uiController module and the budgetController modules as an argument to the controller
//keyCode and which are the number associated with every key on the keyboard
