import { showToast } from "./toast.js";

const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const toggleNewPassword =
    document.getElementById("toggleNewPassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const backToLogin =
    document.getElementById("backToLogin");

const email =
    sessionStorage.getItem("passwordResetEmail");

const resetToken =
    sessionStorage.getItem("passwordResetToken");


/* ==========================================
   Check reset session
========================================== */

if (!email || !resetToken) {

    showToast(
        "Your password reset session is missing or expired.",
        "error"
    );

    setTimeout(() => {

        window.location.replace("login.html");

    }, 1000);
}


/* ==========================================
   Toggle new password
========================================== */

toggleNewPassword?.addEventListener(
    "click",
    () => {

        if (newPassword.type === "password") {

            newPassword.type = "text";

            toggleNewPassword.innerHTML =
                `<span class="material-symbols-rounded">
                    visibility_off
                </span>`;

        } else {

            newPassword.type = "password";

            toggleNewPassword.innerHTML =
                `<span class="material-symbols-rounded">
                    visibility
                </span>`;

        }

    }
);


/* ==========================================
   Toggle confirm password
========================================== */

toggleConfirmPassword?.addEventListener(
    "click",
    () => {

        if (confirmPassword.type === "password") {

            confirmPassword.type = "text";

            toggleConfirmPassword.innerHTML =
                `<span class="material-symbols-rounded">
                    visibility_off
                </span>`;

        } else {

            confirmPassword.type = "password";

            toggleConfirmPassword.innerHTML =
                `<span class="material-symbols-rounded">
                    visibility
                </span>`;

        }

    }
);


/* ==========================================
   Reset password
========================================== */

resetPasswordForm?.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const password =
            newPassword.value;

        const confirm =
            confirmPassword.value;


        if (password.length < 6) {

            showToast(
                "Password must be at least 6 characters.",
                "warning"
            );

            return;
        }


        if (password !== confirm) {

            showToast(
                "Passwords do not match.",
                "warning"
            );

            return;
        }


        try {

            resetPasswordButton.disabled = true;

            resetPasswordButton.textContent =
                "Resetting...";


            const response =
                await fetch(
                    "https://echocall-ai-backend.onrender.com/api/auth/reset-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email,

                            resetToken,

                            newPassword:
                                password

                        })

                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to reset password."
                );

            }


            showToast(
                "Password reset successfully!",
                "success"
            );


            sessionStorage.removeItem(
                "passwordResetEmail"
            );

            sessionStorage.removeItem(
                "passwordResetToken"
            );


            setTimeout(() => {

                window.location.replace(
                    "login.html"
                );

            }, 1000);


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );

            showToast(
                error.message ||
                "Unable to reset password.",
                "error"
            );


            resetPasswordButton.disabled =
                false;

            resetPasswordButton.textContent =
                "Reset Password";

        }

    }
);


/* ==========================================
   Back to login
========================================== */

backToLogin?.addEventListener(
    "click",
    () => {

        sessionStorage.removeItem(
            "passwordResetEmail"
        );

        sessionStorage.removeItem(
            "passwordResetToken"
        );

        window.location.replace(
            "login.html"
        );

    }
);