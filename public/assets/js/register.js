$(document).ready(function () {
    var statusCode = window.location.search.replace("?errStatus=","");
    if(statusCode == 3) Swal.fire('Attention!','Something went wrong please try again!','error');
    $.getJSON("assets/resources/countries.json",
        function (data) {
            data.forEach(element => {
                $(".country").prepend(`<option value='${element.name}'>${element.name}</option>`);
            });
        }
    );

    $.getJSON("assets/resources/languages.json",
        function (data) {
            data.forEach(element => {
                $(".language").prepend(`<option value='${element.name}'>${element.name}</option>`);
            });
        }
    );
    $.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-zA-Z\s]*$/.test(value);
      }, "Please Enter Only Alphabetic Characters"); 
    $("#regForm").validate({
        rules: {
            user_name: {
                required: true
            },
            user_mail: {
                required: true,
                email: true,
                remote: {
                    url: "isEmailExist",
                    type: "post"
                 }
            },
            user_pass: {
                required: true,
                passwordCheck: true
            },
            user_re_pass: {
                required: true,
                equalTo: "#user_pass"
            },
            language: "required",
            country: "required" 
        },
        messages: {
            user_pass: {
                passwordCheck: "Please Enter Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"
            },
            user_mail: {
                remote: "Email address is already registered"
            }
        }
    });
});