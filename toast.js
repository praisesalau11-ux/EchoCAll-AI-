// ==========================================
// EchoCall AI Toast System
// File: js/toast.js
// ==========================================

export function showToast(
    message,
    type = "success"
) {

    if (!message) {
        return;
    }


    const toastContainer =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement("div");


    toast.className =
        `toast ${type}`;


    // Don't use innerHTML for the message.
    // This prevents HTML injection.

    const text =
        document.createElement("span");

    text.textContent =
        message;


    toast.appendChild(
        text
    );


    if (toastContainer) {

        toastContainer.appendChild(
            toast
        );

    }

    else {

        document.body.appendChild(
            toast
        );

    }


    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );

        }
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                400
            );

        },
        3000
    );

}