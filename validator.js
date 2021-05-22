
// Đối tượng
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement) {
                if (element.parentElement.matches(selector)) {
                    return element.parentElement
                }
                element = element.parentElement
            }
        }
    }

    var selectorRules = {

    }

    // Hmaf thực hiện validate
    function validate(inputElement, rule) {
        // var errowElement = getParent(inputElement, '.form-group')
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;
    
    
        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector]
        
    
        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break;
        }
    
        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }
    
  

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)

    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true

            // Lặp qua từng rule và validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                // Submit với javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {       
                        values[input.name] = input.value
                        switch(input.type) {
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                } else {
                    // hành vi mặc định
                    formElement.submit()
                }              
                console.log(formValues);
            }           
        }
        

        // Lặp qua mỗi rule và xử lý
        options.rules.forEach(function(rule) {

            // luưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            
            Array.from(inputElements).forEach(function(inputElement) {
                if (inputElement) {
                    // Xử lý trường hợp blur ra ngoài
                    inputElement.onblur = function() {
                        validate(inputElement, rule)
                    }
                    // Trường hợp người dùng bắt đầu nhập value
                    inputElement.oninput = function() {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message')
                        errorElement.innerText = ''
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }
                }
            })   
        })
    }
}

// Địng nghĩa rules
// nguyên tắc các rules:
// 1. khi có lỗi => trả ra mess lỗi
// 2. khi hợp leek => ko trả gì
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : `${message}`
        },
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : `${message}`
        },
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isComfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị không chính xác';
        }
    }
}
