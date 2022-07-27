// Target để lấy ra element
function Validator (formSelector,options ){
    // Gán giá trị mặc định cho tham số es5
    if(!options)
    {
        options = {};
    }
    function getParent (element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element =  element.parentElement;
        }
    }
    var formRules = {}
    var validatorRules ={
        //  Định nghĩa các rules
        required :  function(value){
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email : function(value){
            var tegex =  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return tegex.test(value) ?  undefined : 'Vui lòng nhập email'
        },
        min: function(min){
            return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập ${min} ký tự`
            }
        }
    }
    // Lay ra formelemnt trong DOM theo formSelector
    var formElement = document.querySelector(formSelector)

    // Chỉ xủ lý khi có formElement
    if(formElement){
        var inputs = formElement.querySelectorAll('[name][rules]')
        for(var input of inputs){
                var rules = input.getAttribute('rules').split('|')

                for(var rule of rules){
                    var isRuleHasValue = rule.includes(':')
                    var ruleInfo

                    if(isRuleHasValue){
                        ruleInfo = rule.split(':')
                        rule = ruleInfo[0];
                    }

                    var ruleFuc = validatorRules[rule]
                    if(isRuleHasValue){
                        ruleFuc = ruleFuc(ruleInfo[1])
                    }
                    
                    if(Array.isArray(formRules[input.name])){
                        formRules[input.name].push(ruleFuc)
                    }else{
                       
                       formRules[input.name] = [ruleFuc] 
                    }

                }
            //  Lắng nghe sự kiện để validate( blur, change....)
            input.onblur = handleValidate ;  
            input.oninput = handleClearError ; 
        }
        function handleValidate(event){
            var rules = formRules[event.target.name]
            var errorMessage
            rules.find(function(rule){
                errorMessage =  rule(event.target.value)
                return errorMessage
            })
            // Nếu có lỗi thì hiển thị message lỗi thì hiển thị ra website
            if(errorMessage){
                var formGroup = getParent(event.target, '.form-group')
                if(!formGroup) return;
                if(formGroup){
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage){
                        formMessage.innerText = errorMessage
                    }
                    // }else{
                    //     formMessage.innerText = '';
                    //     formGroup.classList.remove('invalid')
                    // }
                }
            }
            return !errorMessage
        }
        // Hàm Clear message lỗi
        function handleClearError (event){
            var formGroup = getParent(event.target, '.form-group')
            // contains kiểm tra xem có class nào như invalid hay không
            if(formGroup.classList.contains('invalid')){
                formElement.classList.remove('invalid');
            var formMessage = formGroup.querySelector('.form-message');
                if(formMessage){
                     formMessage.innerText = ''
                }
            }
        }
    }
    // Xử lý hành vi submit form
    formElement.onsubmit = function(event){
        event.preventDefault();
        var inputs = document.querySelectorAll('[name][rules]')
        var isValid = true;
        for(var input of inputs){
            if(!handleValidate({target: input})){
                isValid = false;

            }
        }
        //  Khi không có lõi thì submit form
        if(isValid)
        { 
            if(typeof options.onSubmit === 'function'){
                options.onSubmit();
            }
            else{
                formElement.submit();
            }

        }
    }
}
// Cách này khi submit thì chưa lấy được value , đọc lại cách 1 rồi viết lại cách lấy value
