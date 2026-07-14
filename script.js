const text = "This is your handwriting animation...";
const element = document.getElementById("handwriting-output");

function typeText(str, el, speed) {
    let i = 0;
    function type() {
        if (i < str.length) {
            el.innerHTML += str.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

typeText(text, element, 100);
