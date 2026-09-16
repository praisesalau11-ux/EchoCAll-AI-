// =================================================
// ECHOCALL AI — INDEX PAGE JAVASCRIPT
// js/index.js
// =================================================

document.addEventListener("DOMContentLoaded", () => {

    // =================================================
    // INTRO SCREEN
    // =================================================

    const introScreen =
        document.getElementById("introScreen");


    // =================================================
    // MOBILE MENU
    // =================================================

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");


    // =================================================
    // ACTIVATE INTRO STATE
    // =================================================

    document.body.classList.add("intro-active");


    // =================================================
    // HIDE INTRO AFTER 3.2 SECONDS
    // =================================================

    setTimeout(() => {

        if (introScreen) {

            introScreen.classList.add(
                "intro-hidden"
            );

        }

        document.body.classList.remove(
            "intro-active"
        );

    }, 3200);


    // =================================================
    // MOBILE MENU TOGGLE
    // =================================================

    if (
        mobileMenuButton &&
        mobileMenu
    ) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    mobileMenu.classList.toggle(
                        "mobile-menu-open"
                    );


                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                const icon =
                    mobileMenuButton.querySelector(
                        ".material-symbols-rounded"
                    );


                if (icon) {

                    icon.textContent =
                        isOpen
                            ? "close"
                            : "menu";

                }

            }
        );


        // =================================================
        // CLOSE MOBILE MENU AFTER LINK CLICK
        // =================================================

        const mobileLinks =
            mobileMenu.querySelectorAll("a");


        mobileLinks.forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "mobile-menu-open"
                    );


                    mobileMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    const icon =
                        mobileMenuButton.querySelector(
                            ".material-symbols-rounded"
                        );


                    if (icon) {

                        icon.textContent = "menu";

                    }

                }
            );

        });

    }


    // =================================================
    // SMOOTH SCROLLING
    // =================================================

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        targetId &&
                        targetId !== "#"
                    ) {

                        const target =
                            document.querySelector(
                                targetId
                            );


                        if (target) {

                            event.preventDefault();


                            target.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        }

                    }

                }
            );

        });


    // =================================================
    // PAGE RESTORE / BFCACHE
    // =================================================

    window.addEventListener(
        "pageshow",
        (event) => {

            if (
                event.persisted &&
                introScreen
            ) {

                introScreen.classList.remove(
                    "intro-hidden"
                );


                setTimeout(() => {

                    introScreen.classList.add(
                        "intro-hidden"
                    );

                }, 800);

            }

        }
    );

});