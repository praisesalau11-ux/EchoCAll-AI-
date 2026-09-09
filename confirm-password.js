import { showToast } from "./toast.js";

const verifyCodeForm =
    document.getElementById("verifyCodeForm");

const verificationCode =
    document.getElementById("verificationCode");

const resendCode =
    document.getElementById("resendCode");

const backToLogin =
    document.getElementById("backToLogin");

const email =
    sessionStorage.getItem("passwordResetEmail");


// ==========================================
// Check email
// ==========================================

if (!email) {

    showToast(
        "No password reset request found.",
        "error"
    );

    setTimeout(() => {

        window.location.href = "./login.html";

    }, 1000);
}


// ==========================================
// OTP INPUT
// ==========================================

verificationCode?.addEventListener(
    "input",
    () => {

        verificationCode.value =
            verificationCode.value
                .replace(/\D/g, "")
                .slice(0, 6);

    }
);


// ==========================================
// VERIFY CODE
// ==========================================

verifyCodeForm?.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const code =
            verificationCode.value.trim();


        if (!/^\d{6}$/.test(code)) {

            showToast(
                "Enter the 6-digit code.",
                "warning"
            );

            return;
        }


        try {

            const button =
                verifyCodeForm.querySelector(
                    "button[type='submit']"
                );


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Verifying...";

            }


            const response =
                await fetch(
                    "https://echocall-ai-backend.onrender.com/api/auth/verify-reset-code",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email: email,

                            code: code

                        })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success ||
                !data.resetToken
            ) {

                throw new Error(
                    data.message ||
                    "Invalid verification code."
                );

            }


            // ==================================
            // SAVE RESET SESSION
            // ==================================

            sessionStorage.setItem(
                "passwordResetEmail",
                email
            );

            sessionStorage.setItem(
                "passwordResetToken",
                data.resetToken
            );


            console.log(
                "Verification successful."
            );


            // ==================================
            // SHOW PASSWORD FORM
            // ==================================

            showPasswordResetForm();


        }

        catch (error) {

            console.error(
                "Verify code error:",
                error
            );


            showToast(
                error.message ||
                "Unable to verify code.",
                "error"
            );


            const button =
                verifyCodeForm.querySelector(
                    "button[type='submit']"
                );


            if (button) {

                button.disabled = false;

                button.textContent =
                    "Verify Code";

            }

        }

    }
);


// ==========================================
// SHOW PASSWORD RESET FORM
// ==========================================

function showPasswordResetForm() {

    verifyCodeForm.innerHTML = `

        <div class="input-group">

            <label for="newPassword">
                New password
            </label>

            <input
                type="password"
                id="newPassword"
                placeholder="Enter new password"
                autocomplete="new-password"
                minlength="6"
                required
            >

        </div>


        <div class="input-group">

            <label for="confirmPassword">
                Confirm new password
            </label>

            <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                autocomplete="new-password"
                minlength="6"
                required
            >

        </div>


        <p class="password-hint">
            Use at least 6 characters.
        </p>


        <button
            type="submit"
            class="primary-btn"
            id="resetPasswordButton"
        >
            Reset Password
        </button>

    `;


    // Change page heading
    const heading =
        document.querySelector("h1");

    if (heading) {

        heading.textContent =
            "Create a new password";

    }


    // Change subtitle
    const subtitle =
        document.querySelector(".subtitle");

    if (subtitle) {

        subtitle.textContent =
            "Enter a new password for your EchoCall AI account.";

    }


    // Hide resend code
    if (resendCode) {

        resendCode.style.display =
            "none";

    }


    // Change back button
    if (backToLogin) {

        backToLogin.innerHTML = `
            <span class="material-symbols-rounded">
                arrow_back
            </span>
            Back to Login
        `;

    }


    // ==================================
    // PASSWORD FORM
    // ==================================

    const newPassword =
        document.getElementById(
            "newPassword"
        );

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );

    const resetPasswordButton =
        document.getElementById(
            "resetPasswordButton"
        );


    verifyCodeForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const password =
                newPassword.value;

            const confirm =
                confirmPassword.value;


            // ==================================
            // VALIDATE PASSWORD
            // ==================================

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


            const resetToken =
                sessionStorage.getItem(
                    "passwordResetToken"
                );


            if (!resetToken) {

                showToast(
                    "Your reset session has expired. Request a new code.",
                    "error"
                );

                return;
            }


            try {

                resetPasswordButton.disabled =
                    true;

                resetPasswordButton.textContent =
                    "Resetting...";


                // ==================================
                // RESET PASSWORD
                // ==================================

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

                                email:
                                    email,

                                resetToken:
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


                // ==================================
                // SUCCESS
                // ==================================

                showToast(
                    "Password reset successfully!",
                    "success"
                );


                // Remove reset session
                sessionStorage.removeItem(
                    "passwordResetEmail"
                );

                sessionStorage.removeItem(
                    "passwordResetToken"
                );


                // ==================================
                // RETURN TO LOGIN
                // ==================================

                setTimeout(() => {

                    window.location.href =
                        "./login.html";

                }, 1000);

            }


            catch (error) {

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

}


// ==========================================
// RESEND CODE
// ==========================================

resendCode?.addEventListener(
    "click",
    async () => {

        if (!email) {

            showToast(
                "No email found.",
                "error"
            );

            return;
        }


        try {

            resendCode.disabled =
                true;

            resendCode.textContent =
                "Sending...";


            const response =
                await fetch(
                    "https://echocall-ai-backend.onrender.com/api/auth/forgot-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email: email

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
                    "Unable to resend code."
                );

            }


            showToast(
                "New verification code sent.",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Resend code error:",
                error
            );


            showToast(
                error.message ||
                "Unable to resend code.",
                "error"
            );

        }

        finally {

            resendCode.disabled =
                false;

            resendCode.textContent =
                "Resend Code";

        }

    }
);


// ==========================================
// BACK TO LOGIN
// ==========================================

backToLogin?.addEventListener(
    "click",
    () => {

        sessionStorage.removeItem(
            "passwordResetEmail"
        );

        sessionStorage.removeItem(
            "passwordResetToken"
        );


        window.location.href =
            "./login.html";

    }
);