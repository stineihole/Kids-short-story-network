//importing checkers
var myInput = document.getElementById('psw');
var letter = document.getElementById('letter');
var capital = document.getElementById('capital');
var number = document.getElementById('number');
var length = document.getElementById('length');


myInput.onfocus = function() {
    document.getElementById('message').style.display="block";
    console.log('In Onfocus');
}

myInput.onblur = function() {
    document.getElementById('message').style.display="none";
    console.log('In Onblur');
}

myInput.onkeyup = function() {
    console.log('In function Onkeyup')
    //check lowercase
    var lowerCase = /[a-z]/g;
    if (myInput.value.match(lowerCase)) {
        console.log('input', myInput.value);
        console.log('result', myInput.value.match(lowerCase))
        letter.classList.remove('invalid');
        console.log(letter.classList)
        letter.classList.add('valid');
        console.log(letter.classList)
    }
    else {
        letter.classList.add('invalid');
        letter.classList.remove('valid');
    }

    //check uppercase
    var upperCase = /[A-Z]/g;
    if (myInput.value.match(upperCase)) {
        capital.classList.remove('invalid');
        capital.classList.add('valid');
    }
    else {
        capital.classList.add('invalid');
        capital.classList.remove('valid');
    }

    //check number
    var num = /[0-9]/g;
    if (myInput.value.match(num)) {
        number.classList.remove('invalid');
        number.classList.add('valid');
    }
    else {
        number.classList.add('invalid');
        number.classList.remove('valid');
    }

    //check length
    if (myInput.value.length >= 8) {
        length.classList.remove('invalid');
        length.classList.add('valid');
    }
    else {
        length.classList.add('invalid');
        length.classList.remove('valid');
    }
}
