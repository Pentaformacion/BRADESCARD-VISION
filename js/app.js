import { startLogin } from "../modules/access/login.js";

const terminal = document.getElementById("terminal");

let applicationCommand = "";

const validCommand = "CICSMPT1";

function renderMVSM() {

    terminal.innerHTML = `
<div class="terminal-screen">

<div class="terminal-content"><span class="terminal-white"> 
                   IIIIII                               (MVSM)
                     II
                     II
                     II
                     II     N   N  FFFFF   OOO   RRRR    M   M    AAA    TTTTT   IIIII   CCCC  AAAAAA
                     II     NN  N  F      O   O  R   R   MM MM   A   A     T       I    C      A    A
                     II     N N N  FFFF   O   O  RRRR    M M M   AAAAA     T       I    C      AAAAAA
                     II     N  NN  F      O   O  R  R    M   M   A   A     T       I    C      A    A 
                   IIIIII   N   N  F       OOO   R   R   M   M   A   A     T     IIIII   CCCC  A    A


                                 "Ambiente de producao - BRADESCARD / MEXICO - Nucleo Alphaville"</span>


                     <span class="terminal-cyan">TMCICM</span>                    <span class="terminal-cyan">TMNVSM</span>                    <span class="terminal-cyan">CICSMPT1</span><span class="terminal-cyan">TPXM</span>                      <span class="terminal-cyan">TSOM</span>                      <span class="terminal-cyan">ROSCOM</span>
                     <span class="terminal-cyan">VIEWM</span>                     <span class="terminal-cyan">DLM</span>


                    <span class="terminal-cyan">APLICACAO:</span>  <span id="applicationField" class="terminal-field active">${escapeHTML(applicationCommand)}</span><span class="terminal-cursor"></span>
</div>

<div class="terminal-status">
    <span class="terminal-status-left">T▮</span>
    <span class="terminal-status-center">»</span>
    <span class="terminal-status-right">0   22,41   A</span>
</div>

</div>
`;

    terminal.focus();
}

function handleKeyboard(event) {

    /*
     * Evitamos que ciertas teclas provoquen
     * comportamientos propios del navegador.
     */

    if (
        event.key === "Enter" ||
        event.key === "Backspace"
    ) {
        event.preventDefault();
    }

    if (event.key === "Enter") {
        validateApplication();
        return;
    }

    if (event.key === "Backspace") {

        applicationCommand =
            applicationCommand.slice(0, -1);

        renderMVSM();

        return;
    }

    /*
     * Solo aceptamos caracteres imprimibles.
     */

    if (
        event.key.length === 1 &&
        applicationCommand.length < 12
    ) {

        applicationCommand +=
            event.key.toUpperCase();

        renderMVSM();
    }
}

function validateApplication() {

    const command =
        applicationCommand
            .trim()
            .toUpperCase();

    if (command === validCommand) {

        showLoadingScreen();

        return;
    }

    showError(
        "APLICACAO INVALIDA - DIGITE CICSMPT1"
    );
}

function showError(message) {

    const content =
        terminal.querySelector(
            ".terminal-content"
        );

    const error =
        document.createElement("div");

    error.className = "terminal-red";

    error.style.position = "absolute";
    error.style.bottom = "55px";
    error.style.left = "28px";

    error.textContent = message;

    content.appendChild(error);

    terminal.focus();
}

function showLoadingScreen() {

    terminal.innerHTML = `
<div class="terminal-screen">

<div class="terminal-content">

<span class="terminal-green">
DFHCE3549 Initializing CICS sign-on...
</span>

</div>

<div class="terminal-status">
    <span>T▮</span>
    <span>»</span>
    <span>0   1,5   A</span>
</div>

</div>
`;

    /*
     * Desconectamos MVSM.
     * A partir de aquí login.js controla
     * el teclado.
     */

    terminal.removeEventListener(
        "keydown",
        handleKeyboard
    );

    setTimeout(() => {

        startLogin({
            terminal,

            onSuccess: (user) => {

                /*
                 * BLOQUE 3
                 *
                 * Aquí conectaremos ASRS.
                 */

                showASRSPlaceholder(user);
            }
        });

    }, 450);
}

function showASRSPlaceholder(user) {

    terminal.innerHTML = `
<div class="terminal-screen">

<div class="terminal-content">

<span class="terminal-cyan">
ASRS (     )
            IBI SERVICES MEXICO " MPT1 "
            ASM STATUS SETTING
</span>


<span class="terminal-green">
USER: ${escapeHTML(user.userid)}
</span>


<span class="terminal-white">
ASRS CARGADO CORRECTAMENTE
</span>

<span class="terminal-green">
SIGUIENTE BLOQUE:
CURRENT STATUS ( A )
</span>

</div>

<div class="terminal-status">
    <span>T▮</span>
    <span>»</span>
    <span>0   8,27   A</span>
</div>

</div>
`;
}

function escapeHTML(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

terminal.addEventListener(
    "keydown",
    handleKeyboard
);

terminal.addEventListener(
    "click",
    () => terminal.focus()
);

/*
 * Arranque del emulador
 */

renderMVSM();
