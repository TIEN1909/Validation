// Thư viện validator
// Đối tượng `Validation`
// bug email
function Validator (options){
    var selectorRules ={};
    function getParent (element, selector){
        while(element.parentElement){
            // Hàm matches xem thử thẻ div ngoài có thẻ form-group hay không
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    // Hàm thực hiện validate
    function validate(inputElement, rule){
        const errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        // Lấy ra các rule của selector
        const rules = selectorRules[rule.selector];
        var errorMessage;
        // Lặp qua từng rule
        for(var i = 0 ; i < rules.length ; ++i){
            switch(inputElement.type){
                case 'checkbox':
                case 'radio':
                    errorMessage =  rules[i](
                        // Nối chuổi để nối checked
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage =  rules[i](inputElement.value);
            }
            // Kiểm tra nếu nó lỗi thì dừng lại
            if(errorMessage) break;
        }
        if(errorMessage){
           errorElement.innerText = errorMessage;
          getParent(inputElement,options.formGroupSelector).classList.add('invalid')
        }else{
            errorElement.innerText = '';
           getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
        }
        // Chuyển về dạng bolean : true|false
        return !!errorMessage;
    }
    function importInput(inputElement){
        const errorElement =getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        errorElement.innerText = '';
        getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
    }
    // Lấy element cuat form khi cần validate
    const formElement =  document.querySelector(options.form);

    if(formElement){
        // Lắng nghe sự kiện submit và bỏ đi hành vi mặc định của form
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormInValid = false;
            // Lặp qua từng rule và validate
            options.rules.forEach(function(rule){
                const inputElement = formElement.querySelector(rule.selector);
               
                const isInValid = validate(inputElement,rule);
                if(isInValid){
                    isFormInValid = true;
                }
            });
                if(!isFormInValid){
                    // Trường hợp submit với javascript
                    if( typeof options.onSubmit === 'function'){
                        const enableInputs = formElement.querySelectorAll('[name]');
                        const formValues = Array.from(enableInputs).reduce(function(values,input){
                            switch(input.type){
                                case 'checkbox':
                                    if(!input.matches(':checked')){
                                        if(!Array.isArray(values[input.name])){
                                            values[input.name] = '';
                                        }
                                        return values;
                                    } 
                                    if(!Array.isArray(values[input.name])){
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                    break;
                                case 'radio':
                                    values[input.name] = formElement.querySelector('input[name ="' + input.name + '"]:checked').value; 
                                    break;
                                case 'file':
                                    values[input.name] = input.files;
                                    break;
                                default:
                                    values[input.name] = input.value 
                            }
                            return values; 
                        },{});
                        options.onSubmit(formValues);
                    }
                    // Trường hợp submit hành vi mặt định
                    else{
                        formElement.submit();
                    }
                }
        }
        // Lặp qua các rule và xử lý lắng nghe xự kiến blur, input...
        options.rules.forEach(function(rule){
                    // Lưu lại các rule cho mỗi input
                    if(Array.isArray(selectorRules[rule.selector])){
                        selectorRules[rule.selector].push(rule.test);
                    }else{
                        selectorRules[rule.selector] = [rule.test]
                    }
            const inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
                // xử lý trường hợp blur khỏi input
                inputElement.onblur= function(){
                    validate(inputElement,rule);
                 }
                 // Xử lý mỗi khi người dùng nhập vào input
                 inputElement.oninput = function(){
                     importInput(inputElement); 
                 }
            })
        });

    }
}
// Định nghĩa rules
// Nguyên tắt đặt ra cho từng rules:
// 1. Khi có lỗi thì trả ra Message lỗi
// 2. Khi hợp lệ -> Không trả ra cái gì cả(undefined)
Validator.isRequired = function(selector,message){
   return{
        selector: selector,
        test : function(value){
            return value ? undefined :  message || 'Vui lòng nhập trường này'
        }
   }
}
Validator.isEmail = function(selector, message){
    return {
        selector : selector,
        test: function(value){
            const checkMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return checkMail.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }

}
Validator.isPassword = function(selector,min, message){
    return {
        selector : selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Mật khẩu nhỏ nhất là ${min} ký tự `
        }
    }

}
Validator.isConfirmation = function(selector,getConfirmation,message){
    return {
        selector : selector,
        test: function(value){
            return value === getConfirmation() ? undefined : message || 'Gía trị nhập vào không chính xác'
        }
    }

}