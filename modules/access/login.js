import { validateTrainingUser } from "../../data/users.js";

let userid = "";
let password = "";

let activeField = "userid";

let errorMessage = "";

export function startLogin({
    terminal,
    onSuccess
}) {

    userid = "";
    password = "";

    activeField = "userid";
    errorMessage = "";

    function render() {

        const hiddenPassword =
            "*".repeat(password.length);

        terminal.innerHTML = `
<div class="terminal-screen">

<div class="terminal-content">

<div class="login-header">
    <span class="terminal-cyan">Signon to CICS</span>
    <span class="terminal-green">APPLID A30CMPT1</span>
</div>

<span class="terminal-white">WELCOME TO CICS TS 5.1</span>


<span class="terminal-green">Type your userid and password, then press ENTER:</span>


<span class="terminal-green">        Userid . . . .</span> <span class="terminal-field ${activeField === "userid" ? "active" : ""}">${escapeHTML(userid)}${activeField === "userid" ? '<span class="terminal-cursor"></span>' : ""}</span>
<span class="terminal-green">        Password . . .</span> <span class="terminal-field ${activeField === "password" ? "active" : ""}">${hiddenPassword}${activeField === "password" ? '<span class="terminal-cursor"></span>' : ""}</span>
<span class="terminal-green">        Language . . .</span> _
<span class="terminal-green">        New Password .</span> _


${errorMessage
    ? `<span class="terminal-red">${escapeHTML(errorMessage)}</span>`
    : ""}

</div>

<div class="login-footer-message">
    <span class="terminal-red">
DFHCE3520 Please type your userid.
    </span>

    <span class="terminal-cyan">
F3=Exit
    </span>
</div>

<div class="terminal-status">
    <span>T▮</span>
    <span>»T</span>
    <span>0   11,26   A</span>
</div>

</div>
`;

        terminal.focus();
    }

    function keyboard(event) {

        if (
            event.key === "Enter" ||
            event.key === "Backspace" ||
            event.key === "Tab"
        ) {
            event.preventDefault();
        }

        if (event.key === "Tab") {

            activeField =
                activeField === "userid"
                    ? "password"
                    : "userid";

            render();
            return;
        }

        if (event.key === "ArrowDown") {

            activeField = "password";

            render();
            return;
        }

        if (event.key === "ArrowUp") {

            activeField = "userid";

            render();
            return;
        }

        if (event.key === "Backspace") {

            if (activeField === "userid") {

                userid =
                    userid.slice(0, -1);

            } else {

                password =
                    password.slice(0, -1);
            }

            errorMessage = "";

            render();

            return;
        }

        if (event.key === "Enter") {

            /*
             * Si todavía estamos escribiendo
             * el usuario, ENTER pasa a password.
             */

            if (
                activeField === "userid" &&
                userid.length > 0 &&
                password.length === 0
            ) {

                activeField = "password";

                render();

                return;
            }

            validate();

            return;
        }

        if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
        ) {

            if (activeField === "userid") {

                if (userid.length < 12) {

                    userid +=
                        event.key.toUpperCase();
                }

            } else {

                if (password.length < 16) {

                    password += event.key;
                }
            }

            errorMessage = "";

            render();
        }
    }

    function validate() {

        if (!userid.trim()) {

            errorMessage =
                "DFHCE3520 Please type your userid.";

            activeField = "userid";

            render();

            return;
        }

        if (!password) {

            errorMessage =
                "DFHCE3521 Please type your password.";

            activeField = "password";

            render();

            return;
        }

        const user =
            validateTrainingUser(
                userid,
                password
            );

        if (!user) {

            errorMessage =
                "DFHCE3540 INVALID USERID OR PASSWORD";

            password = "";
            activeField = "password";

            render();

            return;
        }

        terminal.removeEventListener(
            "keydown",
            keyboard
        );

        showSuccessfulSignon(user);
    }

    function showSuccessfulSignon(user) {

        terminal.innerHTML = `
<div class="terminal-screen">

<div class="terminal-content">
<span class="terminal-green">TSS7000I ${escapeHTML(user.userid)} Last-Used 01 Oct 2026  System=MVSM Facility=CICSMPT1</span>
<span class="terminal-green">TSS7001I Count=00001 Mode=Fail Locktime=None Name=${escapeHTML(user.name)}</span>


<span class="terminal-green terminal-cursor"></span>
</div>

<div class="terminal-status">
    <span>T▮     X SYSTEM</span>
    <span>»</span>
    <span>0   1,2   A</span>
</div>

</div>
`;

        /*
         * Esta pantalla ahora espera ASRS.
         */

        let command = "";

        function commandKeyboard(event) {

            if (
                event.key === "Enter" ||
                event.key === "Backspace"
            ) {
                event.preventDefault();
            }

            if (event.key === "Backspace") {

                command =
                    command.slice(0, -1);

                renderCommand();

                return;
            }

            if (event.key === "Enter") {

                if (
                    command
                        .trim()
                        .toUpperCase() === "ASRS"
                ) {

                    terminal.removeEventListener(
                        "keydown",
                        commandKeyboard
                    );

                    onSuccess(user);

                    return;
                }

                command = "";

                renderCommand(
                    "INVALID TRANSACTION"
                );

                return;
            }

            if (
                event.key.length === 1 &&
                command.length < 8
            ) {

                command +=
                    event.key.toUpperCase();

                renderCommand();
            }
        }

        function renderCommand(error = "") {

            terminal.innerHTML = `
<div class="terminal-screen">

<div class="terminal-content">
<span class="terminal-green">TSS7000I ${escapeHTML(user.userid)} Last-Used 01 Oct 2026  System=MVSM Facility=CICSMPT1</span>
<span class="terminal-green">TSS7001I Count=00001 Mode=Fail Locktime=None Name=${escapeHTML(user.name)}</span>


<span class="terminal-green">${escapeHTML(command)}</span><span class="terminal-cursor"></span>

${error
    ? `<span class="terminal-red">${error}</span>`
    : ""}
</div>

<div class="terminal-status">
    <span>T▮     X SYSTEM</span>
    <span>»</span>
    <span>0   1,2   A</span>
</div>

</div>
`;

            terminal.focus();
        }

        terminal.addEventListener(
            "keydown",
            commandKeyboard
        );

        renderCommand();
    }

    terminal.addEventListener(
        "keydown",
        keyboard
    );

    render();
}

function escapeHTML(value = "") {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
