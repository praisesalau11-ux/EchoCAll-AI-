import { showToast } from "./toast.js";

const verifyCodeForm = document.getElementById("verifyCodeForm");
const verificationCode = document.getElementById("verificationCode");
const resendCode = document.getElementById("resendCode");
const backToLogin = document.getElementById("backToLogin");

const email = sessionStorage.getItem("passwordResetEmail");

if (!email) {
    showToast("No password reset request found.", "error");

    setTimeout(() => {
        window.location.replace("login.html");
    }, 1000);
}

verificationCode?.addEventListener("input", () => {
    verificationCode.value = verificationCode.value
        .replace(/\D/g, "")
        .slice(0, 6);
});

verifyCodeForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const code = verificationCode.value.trim();

    if (!/^\d{6}$/.test(code)) {
        showToast("Enter the 6-digit code.", "warning");
        return;
    }

    try {
        showToast("Verifying code...", "success");

        const response = await fetch(
            "https://echocall-ai-backend.onrender.com/api/auth/verify-reset-code",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    code
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Invalid verification code."
            );
        }

        sessionStorage.setItem(
            "passwordResetToken",
            data.resetToken
        );

        showToast("Code verified!", "success");

        setTimeout(() => {
            window.location.replace("reset-password.html");
        }, 700);

    } catch (error) {
        console.error("Verify code error:", error);

        showToast(
            error.message || "Unable to verify code.",
            "error"
        );
    }
});

backToLogin?.addEventListener("click", () => {
    window.location.replace("login.html");
});

resendCode?.addEventListener("click", async () => {

    if (!email) {
        return;
    }

    try {
        showToast("Sending a new code...", "success");

        const response = await fetch(
            "https://echocall-ai-backend.onrender.com/api/auth/forgot-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to resend code."
            );
        }

        showToast("New verification code sent.", "success");

    } catch (error) {
        console.error("Resend code error:", error);

        showToast(
            error.message || "Unable to resend code.",
            "error"
        );
    }
});