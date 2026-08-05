// ==========================
// EchoCall AI Toast System
// ==========================

export function showToast(message, type = "success") {

    let toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 400);

    }, 3000);

}