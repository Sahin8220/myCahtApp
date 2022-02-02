$(document).ready(function () {
    var statusCode = window.location.search.replace("?errStatus=","");
    if(statusCode == 1) Swal.fire('Good job!','You registered succesfully! Please make login.','success');
    if(statusCode == 3) Swal.fire('Attention!','Your email address or password is wrong!','error');
});