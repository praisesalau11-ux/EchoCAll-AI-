// ==========================================
// EchoCall AI
// File: js/contacts.js
// Part 1
// ==========================================


// ==========================================
// FIREBASE
// ==========================================

import {
    auth,
    db,
    storage
} from "./firebase.js";


// ==========================================
// FIREBASE AUTH
// ==========================================

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================
// FIRESTORE
// ==========================================

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// FIREBASE STORAGE
// ==========================================

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// ==========================================
// COUNTRIES
// ==========================================

import {
    countries
} from "../data/countries.js";


// ==========================================
// PAGE CONSTANTS
// ==========================================

const CONTACTS_COLLECTION =
    "users";

const CONTACTS_SUBCOLLECTION =
    "contacts";

const MAX_CONTACTS =
    500;

const MAX_NOTE_LENGTH =
    500;

const MAX_FILE_SIZE =
    5 * 1024 * 1024;


// ==========================================
// PAGE STATE
// ==========================================

let currentUser = null;

let currentUserData = null;

let contacts = [];

let filteredContacts = [];

let selectedContact = null;

let selectedContactId = null;

let selectedCountry = null;

let selectedContactPhoto = null;

let editingContactId = null;

let activeContactFilter = "all";

let searchQuery = "";

let contactsInitialized = false;

let contactsUnsubscribe = null;

let pendingContactAction = null;

let pendingContactActionId = null;

let countrySearchQuery = "";


// ==========================================
// DOM HELPER
// ==========================================

function getElement(id) {
    return document.getElementById(id);
}


// ==========================================
// DOM ELEMENT HELPER
// ==========================================

function getElements(selector) {
    return Array.from(
        document.querySelectorAll(selector)
    );
}


// ==========================================
// SAFE TEXT
// ==========================================

function escapeHTML(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;
}


// ==========================================
// NORMALIZE TEXT
// ==========================================

function normalizeText(value) {

    return String(value || "")
        .trim()
        .toLowerCase();
}


// ==========================================
// NORMALIZE PHONE
// ==========================================

function normalizePhone(value) {

    return String(value || "")
        .replace(/[^\d+]/g, "");
}


// ==========================================
// CREATE CONTACT ID
// ==========================================

function createContactId() {

    return (
        "contact_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );
}


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    return currentUser;
}


// ==========================================
// SHOW TOAST
// ==========================================

function showToast(
    message,
    type = "info"
) {

    const toast =
        getElement(
            "contactsToast"
        );

    const icon =
        getElement(
            "contactsToastIcon"
        );

    const messageElement =
        getElement(
            "contactsToastMessage"
        );

    if (!toast) {

        console.log(
            `Contacts Toast [${type}]:`,
            message
        );

        return;
    }

    if (messageElement) {

        messageElement.textContent =
            message;
    }

    if (icon) {

        const icons = {

            success:
                "check_circle",

            error:
                "error",

            warning:
                "warning",

            info:
                "info"

        };

        icon.textContent =
            icons[type] ||
            icons.info;
    }

    toast.classList.remove(
        "success",
        "error",
        "warning",
        "info",
        "visible",
        "active"
    );

    toast.classList.add(
        type
    );

    toast.classList.add(
        "visible"
    );

    toast.classList.add(
        "active"
    );

    clearTimeout(
        toast._hideTimer
    );

    toast._hideTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "visible",
                    "active"
                );

            },
            3200
        );
}


// ==========================================
// SHOW PAGE ERROR
// ==========================================

function showError(
    message
) {

    const errorBox =
        getElement(
            "contactsError"
        );

    const errorMessage =
        getElement(
            "contactsErrorMessage"
        );

    if (!errorBox) {

        console.error(
            "Contacts Error:",
            message
        );

        return;
    }

    if (errorMessage) {

        errorMessage.textContent =
            message;
    }

    errorBox.classList.add(
        "visible"
    );
}


// ==========================================
// HIDE PAGE ERROR
// ==========================================

function hideError() {

    const errorBox =
        getElement(
            "contactsError"
        );

    if (!errorBox) {
        return;
    }

    errorBox.classList.remove(
        "visible"
    );
}


// ==========================================
// UPDATE LOADING STATE
// ==========================================

function setLoading(
    loading
) {

    const loadingElement =
        getElement(
            "contactsLoading"
        );

    const list =
        getElement(
            "contactsList"
        );

    if (loadingElement) {

        loadingElement.style.display =
            loading
                ? ""
                : "none";
    }

    if (list && loading) {

        list.innerHTML = "";
    }
}


// ==========================================
// UPDATE CONTACT COUNTS
// ==========================================

function updateContactCounts() {

    const totalElement =
        getElement(
            "totalContactsCount"
        );

    const echoCallElement =
        getElement(
            "echoCallContactsCount"
        );

    if (totalElement) {

        totalElement.textContent =
            contacts.length;
    }

    if (echoCallElement) {

        const echoCallContacts =
            contacts.filter(
                contact =>
                    contact.isEchoCallUser === true
            );

        echoCallElement.textContent =
            echoCallContacts.length;
    }
}


// ==========================================
// GET CONTACT DISPLAY NAME
// ==========================================

function getContactDisplayName(
    contact
) {

    if (!contact) {
        return "Unknown contact";
    }

    const savedName =
        String(
            contact.name || ""
        ).trim();

    if (savedName) {
        return savedName;
    }

    const username =
        String(
            contact.username || ""
        ).trim();

    if (username) {
        return username;
    }

    const phone =
        String(
            contact.phoneNumber ||
            contact.phone ||
            ""
        ).trim();

    if (phone) {
        return phone;
    }

    return "Unknown contact";
}


// ==========================================
// GET CONTACT PHONE
// ==========================================

function getContactPhone(
    contact
) {

    if (!contact) {
        return "";
    }

    return (
        contact.phoneNumber ||
        contact.phone ||
        ""
    );
}


// ==========================================
// GET CONTACT USERNAME
// ==========================================

function getContactUsername(
    contact
) {

    if (!contact) {
        return "";
    }

    return (
        contact.username ||
        contact.echoCallUsername ||
        ""
    );
}


// ==========================================
// GET CONTACT PHOTO
// ==========================================

function getContactPhoto(
    contact
) {

    if (!contact) {
        return "";
    }

    return (
        contact.photoURL ||
        contact.photoUrl ||
        contact.profilePhoto ||
        contact.profilePicture ||
        ""
    );
}


// ==========================================
// CONTACT IS ONLINE
// ==========================================

function isContactOnline(
    contact
) {

    return (
        contact?.online === true ||
        contact?.isOnline === true ||
        contact?.onlineStatus === "online"
    );
}


// ==========================================
// FORMAT LAST SEEN
// ==========================================

function formatLastSeen(
    contact
) {

    if (
        isContactOnline(contact)
    ) {

        return "Online";
    }

    if (
        !contact ||
        !contact.lastSeen
    ) {

        return "Offline";
    }

    let date;

    try {

        if (
            typeof contact.lastSeen
                ?.toDate === "function"
        ) {

            date =
                contact.lastSeen.toDate();

        } else {

            date =
                new Date(
                    contact.lastSeen
                );
        }

    } catch {

        return "Offline";
    }

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Offline";
    }

    const now =
        new Date();

    const difference =
        now.getTime() -
        date.getTime();

    if (
        difference < 60000
    ) {

        return "Last seen just now";
    }

    if (
        difference < 3600000
    ) {

        const minutes =
            Math.floor(
                difference / 60000
            );

        return (
            `Last seen ${minutes} ` +
            `${minutes === 1 ? "minute" : "minutes"} ago`
        );
    }

    if (
        difference < 86400000
    ) {

        const hours =
            Math.floor(
                difference / 3600000
            );

        return (
            `Last seen ${hours} ` +
            `${hours === 1 ? "hour" : "hours"} ago`
        );
    }

    return (
        "Last seen " +
        date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        )
    );
}


// ==========================================
// COUNTRY HELPERS
// ==========================================

function getDefaultCountry() {

    const nigeria =
        countries.find(
            country =>
                country.code === "NG"
        );

    if (nigeria) {
        return nigeria;
    }

    return countries[0] || null;
}


// ==========================================
// FIND COUNTRY BY CODE
// ==========================================

function findCountryByCode(
    code
) {

    if (!code) {
        return null;
    }

    return countries.find(
        country =>
            String(
                country.code || ""
            ).toUpperCase() ===
            String(
                code
            ).toUpperCase()
    ) || null;
}


// ==========================================
// FIND COUNTRY BY DIAL CODE
// ==========================================

function findCountryByDialCode(
    dialCode
) {

    if (!dialCode) {
        return null;
    }

    return countries.find(
        country =>
            String(
                country.dialCode || ""
            ) ===
            String(
                dialCode
            )
    ) || null;
}


// ==========================================
// SET DEFAULT COUNTRY
// ==========================================

function setDefaultCountry() {

    selectedCountry =
        getDefaultCountry();
}


// ==========================================
// GET COUNTRY FLAG
// ==========================================

function getCountryFlag(
    country
) {

    if (!country) {
        return "🌐";
    }

    return (
        country.flag ||
        "🌐"
    );
}


// ==========================================
// GET COUNTRY NAME
// ==========================================

function getCountryName(
    country
) {

    if (!country) {
        return "";
    }

    return (
        country.name ||
        ""
    );
}


// ==========================================
// GET COUNTRY DIAL CODE
// ==========================================

function getCountryDialCode(
    country
) {

    if (!country) {
        return "";
    }

    return (
        country.dialCode ||
        ""
    );
}


// ==========================================
// GET COUNTRY CODE
// ==========================================

function getCountryCode(
    country
) {

    if (!country) {
        return "";
    }

    return (
        country.code ||
        ""
    );
}


// ==========================================
// UPDATE SELECTED COUNTRY UI
// ==========================================

function updateSelectedCountryUI() {

    const flagElement =
        getElement(
            "selectedCountryFlag"
        );

    const nameElement =
        getElement(
            "selectedCountryName"
        );

    const dialCodeElement =
        getElement(
            "selectedCountryDialCode"
        );

    const phoneCodeElement =
        getElement(
            "phoneCountryCode"
        );

    if (
        !selectedCountry
    ) {
        return;
    }

    const flag =
        getCountryFlag(
            selectedCountry
        );

    const name =
        getCountryName(
            selectedCountry
        );

    const dialCode =
        getCountryDialCode(
            selectedCountry
        );

    if (flagElement) {
        flagElement.textContent =
            flag;
    }

    if (nameElement) {
        nameElement.textContent =
            name;
    }

    if (dialCodeElement) {
        dialCodeElement.textContent =
            dialCode;
    }

    if (phoneCodeElement) {
        phoneCodeElement.textContent =
            dialCode;
    }
}


// ==========================================
// COUNTRY SEARCH
// ==========================================

function filterCountries(
    search
) {

    countrySearchQuery =
        normalizeText(
            search
        );

    if (
        !countrySearchQuery
    ) {

        return [
            ...countries
        ];
    }

    return countries.filter(
        country => {

            const name =
                normalizeText(
                    country.name
                );

            const code =
                normalizeText(
                    country.code
                );

            const dialCode =
                normalizeText(
                    country.dialCode
                );

            return (
                name.includes(
                    countrySearchQuery
                ) ||
                code.includes(
                    countrySearchQuery
                ) ||
                dialCode.includes(
                    countrySearchQuery
                )
            );
        }
    );
}


// ==========================================
// RENDER COUNTRY OPTIONS
// ==========================================

function renderCountryOptions(
    search = ""
) {

    const container =
        getElement(
            "countryOptions"
        );

    if (!container) {
        return;
    }

    const matchingCountries =
        filterCountries(
            search
        );

    if (
        matchingCountries.length === 0
    ) {

        container.innerHTML = `
            <div class="country-empty">
                No countries found
            </div>
        `;

        return;
    }

    container.innerHTML =
        matchingCountries
            .map(
                country => {

                    const code =
                        escapeHTML(
                            country.code
                        );

                    const name =
                        escapeHTML(
                            country.name
                        );

                    const dialCode =
                        escapeHTML(
                            country.dialCode
                        );

                    const flag =
                        escapeHTML(
                            country.flag
                        );

                    return `
                        <button
                            type="button"
                            class="country-option"
                            data-country-code="${code}"
                        >
                            <span class="country-option-flag">
                                ${flag}
                            </span>

                            <span class="country-option-name">
                                ${name}
                            </span>

                            <span class="country-option-dial-code">
                                ${dialCode}
                            </span>
                        </button>
                    `;
                }
            )
            .join("");
}


// ==========================================
// SELECT COUNTRY
// ==========================================

function selectCountry(
    country
) {

    if (!country) {
        return;
    }

    selectedCountry =
        country;

    updateSelectedCountryUI();

    closeCountryDropdown();
}


// ==========================================
// OPEN COUNTRY DROPDOWN
// ==========================================

function openCountryDropdown() {

    const dropdown =
        getElement(
            "countryDropdown"
        );

    if (!dropdown) {
        return;
    }

    renderCountryOptions();

    dropdown.classList.add(
        "open"
    );

    dropdown.classList.add(
        "active"
    );
}


// ==========================================
// CLOSE COUNTRY DROPDOWN
// ==========================================

function closeCountryDropdown() {

    const dropdown =
        getElement(
            "countryDropdown"
        );

    if (!dropdown) {
        return;
    }

    dropdown.classList.remove(
        "open"
    );

    dropdown.classList.remove(
        "active"
    );
}


// ==========================================
// TOGGLE COUNTRY DROPDOWN
// ==========================================

function toggleCountryDropdown() {

    const dropdown =
        getElement(
            "countryDropdown"
        );

    if (!dropdown) {
        return;
    }

    if (
        dropdown.classList.contains(
            "open"
        )
    ) {

        closeCountryDropdown();

    } else {

        openCountryDropdown();
    }
}


// ==========================================
// FORMAT PHONE NUMBER
// ==========================================

function formatPhoneNumber(
    phoneNumber
) {

    const phone =
        normalizePhone(
            phoneNumber
        );

    if (!phone) {
        return "";
    }

    return phone;
}


// ==========================================
// BUILD FULL PHONE NUMBER
// ========================================
function buildFullPhoneNumber(
    phoneNumber
) {

    const value =
        String(
            phoneNumber || ""
        ).trim();

    if (!value) {
        return "";
    }

    if (
        value.startsWith("+")
    ) {

        return normalizePhone(
            value
        );
    }

    const dialCode =
        getCountryDialCode(
            selectedCountry
        );

    if (!dialCode) {

        return normalizePhone(
            value
        );
    }

    const cleaned =
        value.replace(
            /^0+/,
            ""
        );

    return normalizePhone(
        dialCode +
        cleaned
    );
}
// ==========================================
// VALIDATE PHONE
// ==========================================

function validatePhoneNumber(
    phoneNumber
) {

    const normalized =
        normalizePhone(
            phoneNumber
        );

    if (!normalized) {

        return {
            valid: false,
            message:
                "Phone number is required."
        };
    }

    const digits =
        normalized.replace(
            /\D/g,
            ""
        );

    if (
        digits.length < 7 ||
        digits.length > 15
    ) {

        return {
            valid: false,
            message:
                "Enter a valid phone number."
        };
    }

    return {
        valid: true,
        message: ""
    };
}


// ==========================================
// VALIDATE CONTACT NAME
// ==========================================

function validateContactName(
    name
) {

    const value =
        String(
            name || ""
        ).trim();

    if (!value) {

        return {
            valid: true,
            message: ""
        };
    }

    if (
        value.length > 100
    ) {

        return {
            valid: false,
            message:
                "Contact name is too long."
        };
    }

    return {
        valid: true,
        message: ""
    };
}
// ==========================================
// VALIDATE USERNAME
// ==========================================

function validateUsername(
    username
) {

    const value =
        String(
            username || ""
        ).trim();

    if (!value) {

        return {
            valid: true,
            message: ""
        };
    }

    if (
        value.length > 50
    ) {

        return {
            valid: false,
            message:
                "Username is too long."
        };
    }

    return {
        valid: true,
        message: ""
    };
}


// ==========================================
// VALIDATE EMAIL
// ==========================================

function validateEmail(
    email
) {

    const value =
        String(
            email || ""
        ).trim();

    if (!value) {

        return {
            valid: true,
            message: ""
        };
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailPattern.test(
            value
        )
    ) {

        return {
            valid: false,
            message:
                "Enter a valid email address."
        };
    }

    return {
        valid: true,
        message: ""
    };
}
// ==========================================
// VALIDATE NOTES
// ==========================================

function validateNotes(
    notes
) {

    const value =
        String(
            notes || ""
        );

    if (
        value.length >
        MAX_NOTE_LENGTH
    ) {

        return {
            valid: false,
            message:
                `Notes cannot exceed ${MAX_NOTE_LENGTH} characters.`
        };
    }

    return {
        valid: true,
        message: ""
    };
}


// ==========================================
// VALIDATE CONTACT
// ==========================================

function validateContactData(
    data
) {

    const nameResult =
        validateContactName(
            data.name
        );

    if (
        !nameResult.valid
    ) {
        return nameResult;
    }

    const phoneResult =
        validatePhoneNumber(
            data.phoneNumber
        );

    if (
        !phoneResult.valid
    ) {
        return phoneResult;
    }

    const usernameResult =
        validateUsername(
            data.username
        );

    if (
        !usernameResult.valid
    ) {
        return usernameResult;
    }

    const emailResult =
        validateEmail(
            data.email
        );

    if (
        !emailResult.valid
    ) {
        return emailResult;
    }

    const notesResult =
        validateNotes(
            data.notes
        );

    if (
        !notesResult.valid
    ) {
        return notesResult;
    }

    return {
        valid: true,
        message: ""
    };
}


// ==========================================
// CREATE CONTACT DATA
// ==========================================

function createContactData(
    formData
) {

    const phoneNumber =
        buildFullPhoneNumber(
            formData.phoneNumber
        );

    return {

        contactId:
            createContactId(),

        name:
            String(
                formData.name || ""
            ).trim(),

        username:
            String(
                formData.username || ""
            ).trim(),

        phoneNumber,

        email:
            String(
                formData.email || ""
            ).trim(),

        dateOfBirth:
            String(
                formData.dateOfBirth || ""
            ).trim(),

        address:
            String(
                formData.address || ""
            ).trim(),

        jobTitle:
            String(
                formData.jobTitle || ""
            ).trim(),

        company:
            String(
                formData.company || ""
            ).trim(),

        notes:
            String(
                formData.notes || ""
            ).trim(),

        countryCode:
            getCountryCode(
                selectedCountry
            ),

        countryName:
            getCountryName(
                selectedCountry
            ),

        countryDialCode:
            getCountryDialCode(
                selectedCountry
            ),

        isEchoCallUser:
            false,

        userId:
            null,

        photoURL:
            "",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };
}
// ==========================================
// CHECK CONTACT LIMIT
// ==========================================

function hasReachedContactLimit() {

    return (
        contacts.length >=
        MAX_CONTACTS
    );
}


// ==========================================
// FIND LOCAL CONTACT BY PHONE
// ==========================================

function findLocalContactByPhone(
    phoneNumber
) {

    const normalized =
        normalizePhone(
            phoneNumber
        );

    if (!normalized) {
        return null;
    }

    return contacts.find(
        contact =>
            normalizePhone(
                getContactPhone(
                    contact
                )
            ) === normalized
    ) || null;
}


// ==========================================
// FIND LOCAL CONTACT BY USERNAME
// ==========================================

function findLocalContactByUsername(
    username
) {

    const normalized =
        normalizeText(
            username
        );

    if (!normalized) {
        return null;
    }

    return contacts.find(
        contact =>
            normalizeText(
                getContactUsername(
                    contact
                )
            ) === normalized
    ) || null;
}


// ==========================================
// FIND CONTACT BY ID
// ==========================================

function findContactById(
    contactId
) {

    if (!contactId) {
        return null;
    }

    return contacts.find(
        contact =>
            contact.id === contactId ||
            contact.contactId === contactId
    ) || null;
}


// ==========================================
// GET CONTACT DOCUMENT REFERENCE
// ==========================================

function getContactDocumentRef(
    contactId
) {

    if (
        !currentUser ||
        !contactId
    ) {
        return null;
    }

    return doc(
        db,
        CONTACTS_COLLECTION,
        currentUser.uid,
        CONTACTS_SUBCOLLECTION,
        contactId
    );
}
// ==========================================
// GET USER DOCUMENT REFERENCE
// ==========================================

function getUserDocumentRef(
    userId
) {

    if (!userId) {
        return null;
    }

    return doc(
        db,
        CONTACTS_COLLECTION,
        userId
    );
}


// ==========================================
// LOOK UP ECHOCALL USER
// ==========================================

async function lookupEchoCallUser(
    phoneNumber
) {

    const normalized =
        normalizePhone(
            phoneNumber
        );

    if (!normalized) {
        return null;
    }

    try {

        const usersRef =
            collection(
                db,
                CONTACTS_COLLECTION
            );

        const usersQuery =
            query(
                usersRef,
                where(
                    "phoneNumber",
                    "==",
                    normalized
                ),
                limit(1)
            );

        const snapshot =
            await getDocs(
                usersQuery
            );

        if (
            snapshot.empty
        ) {
            return null;
        }

        const userDoc =
            snapshot.docs[0];

        return {
            id:
                userDoc.id,

            ...userDoc.data()

        };

    } catch (error) {

        console.error(
            "Contacts: Failed to lookup EchoCall user:",
            error
        );

        return null;
    }
}


// ==========================================
// MERGE ECHOCALL USER DATA
// ==========================================

function mergeEchoCallUserData(
    contact,
    userData
) {

    if (
        !contact ||
        !userData
    ) {
        return contact;
    }

    return {

        ...contact,

        isEchoCallUser:
            true,

        userId:
            userData.uid ||
            userData.id ||
            contact.userId ||
            null,

        username:
            userData.username ||
            userData.echoCallUsername ||
            contact.username ||
            "",

        photoURL:
            userData.photoURL ||
            userData.photoUrl ||
            contact.photoURL ||
            "",

        online:
            userData.online === true ||
            userData.isOnline === true,

        isOnline:
            userData.online === true ||
            userData.isOnline === true,

        lastSeen:
            userData.lastSeen ||
            contact.lastSeen ||
            null

    };
}
// ==========================================
// REFRESH ECHOCALL CONTACT
// ==========================================

async function refreshEchoCallContact(
    contact
) {

    if (!contact) {
        return contact;
    }

    const phoneNumber =
        getContactPhone(
            contact
        );

    if (!phoneNumber) {
        return contact;
    }

    const userData =
        await lookupEchoCallUser(
            phoneNumber
        );

    if (!userData) {
        return contact;
    }

    return mergeEchoCallUserData(
        contact,
        userData
    );
}


// ==========================================
// REFRESH ALL ECHOCALL CONTACTS
// ==========================================

async function refreshEchoCallContacts() {

    if (
        contacts.length === 0
    ) {
        return;
    }

    const refreshedContacts =
        await Promise.all(
            contacts.map(
                contact =>
                    refreshEchoCallContact(
                        contact
                    )
            )
        );

    contacts =
        refreshedContacts;

    applyContactFilters();

    renderContacts();

    updateContactCounts();
}


// ==========================================
// LOAD CONTACTS
// ==========================================

async function loadContacts() {

    if (
        !currentUser
    ) {

        contacts = [];

        filteredContacts = [];

        renderContacts();

        updateContactCounts();

        return;
    }

    setLoading(true);

    hideError();

    try {

        const contactsRef =
            collection(
                db,
                CONTACTS_COLLECTION,
                currentUser.uid,
                CONTACTS_SUBCOLLECTION
            );

        const contactsQuery =
            query(
                contactsRef,
                orderBy(
                    "createdAt",
                    "desc"
                )
            );

        const snapshot =
            await getDocs(
                contactsQuery
            );

        contacts =
            snapshot.docs.map(
                contactDoc => ({

                    id:
                        contactDoc.id,

                    ...contactDoc.data()

                })
            );

        applyContactFilters();

        renderContacts();

        updateContactCounts();

    } catch (error) {

        console.error(
            "Contacts: Failed to load contacts:",
            error
        );

        showError(
            "Unable to load your contacts. Please try again."
        );

    } finally {

        setLoading(false);
    }
}
// ==========================================
// APPLY CONTACT FILTERS
// ==========================================

function applyContactFilters() {

    let result =
        [...contacts];

    if (
        activeContactFilter ===
        "echoCall"
    ) {

        result =
            result.filter(
                contact =>
                    contact.isEchoCallUser === true
            );
    }

    if (
        activeContactFilter ===
        "offline"
    ) {

        result =
            result.filter(
                contact =>
                    !isContactOnline(
                        contact
                    )
            );
    }

    if (
        searchQuery
    ) {

        const normalizedSearch =
            normalizeText(
                searchQuery
            );

        result =
            result.filter(
                contact => {

                    const name =
                        normalizeText(
                            getContactDisplayName(
                                contact
                            )
                        );

                    const username =
                        normalizeText(
                            getContactUsername(
                                contact
                            )
                        );

                    const phone =
                        normalizeText(
                            getContactPhone(
                                contact
                            )
                        );

                    const email =
                        normalizeText(
                            contact.email
                        );

                    return (
                        name.includes(
                            normalizedSearch
                        ) ||
                        username.includes(
                            normalizedSearch
                        ) ||
                        phone.includes(
                            normalizedSearch
                        ) ||
                        email.includes(
                            normalizedSearch
                        )
                    );
                }
            );
    }

    filteredContacts =
        result;
}


// ==========================================
// SORT CONTACTS
// ==========================================

function sortContacts(
    list
) {

    return [
        ...list
    ].sort(
        (a, b) => {

            const aName =
                normalizeText(
                    getContactDisplayName(
                        a
                    )
                );

            const bName =
                normalizeText(
                    getContactDisplayName(
                        b
                    )
                );

            return aName.localeCompare(
                bName
            );
        }
    );
}
// ==========================================
// RENDER CONTACTS
// ==========================================

function renderContacts() {

    const container =
        getElement(
            "contactsList"
        );

    const emptyState =
        getElement(
            "contactsEmpty"
        );

    if (!container) {
        return;
    }

    const sortedContacts =
        sortContacts(
            filteredContacts
        );

    if (
        sortedContacts.length === 0
    ) {

        container.innerHTML = "";

        if (emptyState) {

            emptyState.style.display =
                "";
        }

        return;
    }

    if (emptyState) {

        emptyState.style.display =
            "none";
    }

    container.innerHTML =
        sortedContacts
            .map(
                contact =>
                    renderContactCard(
                        contact
                    )
            )
            .join("");
}


// ==========================================
// RENDER CONTACT CARD
// ==========================================

function renderContactCard(
    contact
) {

    const id =
        escapeHTML(
            contact.id ||
            contact.contactId ||
            ""
        );

    const name =
        escapeHTML(
            getContactDisplayName(
                contact
            )
        );

    const username =
        escapeHTML(
            getContactUsername(
                contact
            )
        );

    const phone =
        escapeHTML(
            getContactPhone(
                contact
            )
        );

    const photo =
        escapeHTML(
            getContactPhoto(
                contact
            )
        );

    const status =
        escapeHTML(
            formatLastSeen(
                contact
            )
        );

    const online =
        isContactOnline(
            contact
        );

    const avatar =
        photo
            ? `
                <img
                    src="${photo}"
                    alt="${name}"
                    class="contact-avatar-image"
                >
            `
            : `
                <div class="contact-avatar-fallback">
                    ${escapeHTML(
                        name
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>
            `;

    return `
        <article
            class="contact-card"
            data-contact-id="${id}"
        >

            <button
                type="button"
                class="contact-card-main"
                data-action="open-contact"
                data-contact-id="${id}"
            >

                <div class="contact-avatar">
                    ${avatar}
                </div>

                <div class="contact-card-info">

                    <div class="contact-card-name-row">

                        <h3 class="contact-card-name">
                            ${name}
                        </h3>

                        ${
                            contact.isEchoCallUser
                                ? `
                                    <span
                                        class="contact-verified"
                                        title="EchoCall user"
                                    >
                                        ✓
                                    </span>
                                `
                                : ""
                        }

                    </div>

                    ${
                        username
                            ? `
                                <p class="contact-card-username">
                                    @${username}
                                </p>
                            `
                            : ""
                    }

                    <p class="contact-card-phone">
                        ${phone}
                    </p>

                    <p
                        class="contact-card-status ${
                            online
                                ? "online"
                                : "offline"
                        }"
                    >
                        ${status}
                    </p>

                </div>

            </button>

            <button
                type="button"
                class="contact-card-more"
                data-action="contact-more"
                data-contact-id="${id}"
                aria-label="More options"
            >
                <span class="material-symbols-rounded">
                    more_vert
                </span>
            </button>

        </article>
    `;
}


// ==========================================
// APPLY CONTACT SEARCH
// ==========================================

function handleContactSearch(
    value
) {

    searchQuery =
        String(
            value || ""
        ).trim();

    applyContactFilters();

    renderContacts();
}


// ==========================================
// SET CONTACT FILTER
// ==========================================

function setContactFilter(
    filter
) {

    activeContactFilter =
        filter || "all";

    getElements(
        "[data-contact-filter]"
    ).forEach(
        button => {

            const isActive =
                button.dataset.contactFilter ===
                activeContactFilter;

            button.classList.toggle(
                "active",
                isActive
            );

        }
    );

    applyContactFilters();

    renderContacts();
}


// ==========================================
// OPEN ADD CONTACT MODAL
// ==========================================

function openAddContactModal() {

    editingContactId =
        null;

    selectedContactPhoto =
        null;

    const modal =
        getElement(
            "addContactModal"
        );

    if (!modal) {
        return;
    }

    const form =
        getElement(
            "contactForm"
        );

    if (form) {
        form.reset();
    }

    setDefaultCountry();

    updateSelectedCountryUI();

    clearContactFormErrors();

    modal.classList.add(
        "open"
    );

    modal.classList.add(
        "active"
    );

    document.body.classList.add(
        "modal-open"
    );

    const nameInput =
        getElement(
            "contactName"
        );

    if (nameInput) {

        setTimeout(
            () => nameInput.focus(),
            100
        );
    }
}
// ==========================================
// CLOSE ADD CONTACT MODAL
// ==========================================

function closeAddContactModal() {

    const modal =
        getElement(
            "addContactModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "open"
    );

    modal.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "modal-open"
    );

    editingContactId =
        null;

    selectedContactPhoto =
        null;
}


// ==========================================
// CLEAR CONTACT FORM ERRORS
// ==========================================

function clearContactFormErrors() {

    getElements(
        ".contact-field-error"
    ).forEach(
        element => {

            element.textContent =
                "";

            element.classList.remove(
                "visible"
            );

        }
    );

    getElements(
        ".contact-input-error"
    ).forEach(
        element => {

            element.classList.remove(
                "contact-input-error"
            );

        }
    );
}


// ==========================================
// SHOW CONTACT FORM ERROR
// ==========================================

function showContactFormError(
    message,
    fieldId = null
) {

    if (fieldId) {

        const input =
            getElement(
                fieldId
            );

        if (input) {

            input.classList.add(
                "contact-input-error"
            );

        }
    }

    const errorBox =
        getElement(
            "contactFormError"
        );

    if (errorBox) {

        errorBox.textContent =
            message;

        errorBox.classList.add(
            "visible"
        );
    }
}
// --------------------------------------
// USERNAME
// --------------------------------------

    if (username) {

        const usernameElement =
            document.createElement(
                "p"
            );


        usernameElement.className =
            "contact-card-username";


        usernameElement.textContent =
            `@${username}`;


        content.appendChild(
            usernameElement
        );

    }


// --------------------------------------
// PHONE
// --------------------------------------

    if (phone) {

        const phoneElement =
            document.createElement(
                "p"
            );


        phoneElement.className =
            "contact-card-phone";


        phoneElement.textContent =
            phone;


        content.appendChild(
            phoneElement
        );

    }


// --------------------------------------
// STATUS
// --------------------------------------

    const statusElement =
        document.createElement(
            "p"
        );


    statusElement.className =
        "contact-card-status";


    if (online) {

        statusElement.classList.add(
            "online"
        );

    }

    else {

        statusElement.classList.add(
            "offline"
        );

    }


    statusElement.textContent =
        lastSeen;


    content.appendChild(
        statusElement
    );


// --------------------------------------
// ECHOCALL USER BADGE
// --------------------------------------

    if (
        contact.isEchoCallUser === true
    ) {

        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            "contact-echo-badge";


        badge.textContent =
            "EchoCall";


        content.appendChild(
            badge
        );

    }


// --------------------------------------
// MORE BUTTON
// --------------------------------------

    const moreButton =
        document.createElement(
            "button"
        );


    moreButton.type =
        "button";


    moreButton.className =
        "contact-card-more";


    moreButton.setAttribute(
        "aria-label",
        "Contact options"
    );


    moreButton.dataset.action =
        "contact-more";


    moreButton.dataset.contactId =
        contact.id;


    moreButton.innerHTML =
        `
            <span class="material-symbols-rounded">
                more_vert
            </span>
        `;


// --------------------------------------
// CARD ASSEMBLY
// --------------------------------------

    card.appendChild(
        avatar
    );


    card.appendChild(
        content
    );


    card.appendChild(
        moreButton
    );


// --------------------------------------
// CARD CLICK
// --------------------------------------

    card.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    ".contact-card-more"
                )
            ) {

                return;

            }


            openContactDetails(
                contact.id
            );

        }
    );


// --------------------------------------
// KEYBOARD SUPPORT
// --------------------------------------

    card.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                openContactDetails(
                    contact.id
                );

            }

        }
    );


    return card;

}


// ==========================================
// GET INITIALS
// ==========================================

function getInitials(
    name
) {

    const value =
        String(
            name || ""
        ).trim();


    if (!value) {

        return "?";

    }


    const parts =
        value
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (
        parts.length === 1
    ) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0]
            .charAt(0)
            .toUpperCase() +

        parts[
            parts.length - 1
        ]
            .charAt(0)
            .toUpperCase()
    );

}


// ==========================================
// SHOW EMPTY STATE
// ==========================================

function showEmptyState() {

    const list =
        getElement(
            "contactsList"
        );

    const empty =
        getElement(
            "contactsEmpty"
        );

    const noResults =
        getElement(
            "contactsNoResults"
        );


    if (list) {

        list.innerHTML =
            "";

    }


    if (empty) {

        empty.style.display =
            "";

    }


    if (noResults) {

        noResults.style.display =
            "none";

    }

}


// ==========================================
// HIDE EMPTY STATE
// ==========================================

function hideEmptyState() {

    const empty =
        getElement(
            "contactsEmpty"
        );


    if (empty) {

        empty.style.display =
            "none";

    }

}


// ==========================================
// CONTACT SEARCH
// ==========================================

function handleContactSearch(
    value
) {

    searchQuery =
        String(
            value || ""
        ).trim();


    applyContactFilters();

}


// ==========================================
// CLEAR CONTACT SEARCH
// ==========================================

function clearContactSearch() {

    searchQuery =
        "";


    const searchInput =
        getElement(
            "contactSearch"
        );


    if (searchInput) {

        searchInput.value =
            "";

    }


    applyContactFilters();

}


// ==========================================
// SET CONTACT FILTER
// ==========================================

function setContactFilter(
    filter
) {

    activeContactFilter =
        filter ||
        "all";


    getElements(
        "[data-contact-filter]"
    ).forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.contactFilter ===
                    activeContactFilter
            );

        }
    );


    applyContactFilters();

}


// ==========================================
// OPEN ADD CONTACT MODAL
// ==========================================

function openAddContactModal() {

    editingContactId =
        null;


    selectedContactPhoto =
        null;


    const modal =
        getElement(
            "addContactModal"
        );


    if (!modal) {

        console.warn(
            "Contacts: addContactModal not found."
        );

        return;

    }


    const form =
        getElement(
            "contactForm"
        );


    if (form) {

        form.reset();

    }


    clearContactFormErrors();


    setDefaultCountry();

    updateSelectedCountryUI();


    const title =
        getElement(
            "contactModalTitle"
        );


    if (title) {

        title.textContent =
            "Add Contact";

    }


    const submitButton =
        getElement(
            "saveContactButton"
        );


    if (submitButton) {

        submitButton.textContent =
            "Save Contact";

    }


    modal.classList.add(
        "open"
    );


    modal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );


    const nameInput =
        getElement(
            "contactName"
        );


    if (nameInput) {

        setTimeout(
            () => {

                nameInput.focus();

            },
            100
        );

    }

}


// ==========================================
// CLOSE ADD CONTACT MODAL
// ==========================================

function closeAddContactModal() {

    const modal =
        getElement(
            "addContactModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "open"
    );


    modal.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "modal-open"
    );


    editingContactId =
        null;


    selectedContactPhoto =
        null;


    clearContactFormErrors();

}


// ==========================================
// OPEN EDIT CONTACT MODAL
// ==========================================

function openEditContactModal(
    contactId
) {

    const contact =
        findContactById(
            contactId
        );


    if (!contact) {

        showToast(
            "Contact not found.",
            "error"
        );

        return;

    }


    editingContactId =
        contact.id;


    selectedContactPhoto =
        null;


    const modal =
        getElement(
            "addContactModal"
        );


    if (!modal) {

        return;

    }


    const form =
        getElement(
            "contactForm"
        );


    if (form) {

        form.reset();

    }


    clearContactFormErrors();


// --------------------------------------
// NAME
// --------------------------------------

    const nameInput =
        getElement(
            "contactName"
        );


    if (nameInput) {

        nameInput.value =
            contact.name ||
            "";

    }


// --------------------------------------
// USERNAME
// --------------------------------------

    const usernameInput =
        getElement(
            "contactUsername"
        );


    if (usernameInput) {

        usernameInput.value =
            contact.username ||
            "";

    }


// --------------------------------------
// PHONE
// --------------------------------------

    const phoneInput =
        getElement(
            "contactPhone"
        );


    if (phoneInput) {

        let phone =
            contact.phoneNumber ||
            contact.phone ||
            "";


        const dialCode =
            contact.countryDialCode ||
            "";


        if (
            dialCode &&
            phone.startsWith(
                dialCode
            )
        ) {

            phone =
                phone.slice(
                    dialCode.length
                );

        }


        phoneInput.value =
            phone;

    }


// --------------------------------------
// EMAIL
// --------------------------------------

    const emailInput =
        getElement(
            "contactEmail"
        );


    if (emailInput) {

        emailInput.value =
            contact.email ||
            "";

    }


// --------------------------------------
// DATE OF BIRTH
// --------------------------------------

    const dobInput =
        getElement(
            "contactDateOfBirth"
        );


    if (dobInput) {

        dobInput.value =
            contact.dateOfBirth ||
            "";

    }


// --------------------------------------
// ADDRESS
// --------------------------------------

    const addressInput =
        getElement(
            "contactAddress"
        );


    if (addressInput) {

        addressInput.value =
            contact.address ||
            "";

    }


// --------------------------------------
// JOB TITLE
// --------------------------------------

    const jobInput =
        getElement(
            "contactJobTitle"
        );


    if (jobInput) {

        jobInput.value =
            contact.jobTitle ||
            "";

    }


// --------------------------------------
// COMPANY
// --------------------------------------

    const companyInput =
        getElement(
            "contactCompany"
        );


    if (companyInput) {

        companyInput.value =
            contact.company ||
            "";

    }


// --------------------------------------
// NOTES
// --------------------------------------

    const notesInput =
        getElement(
            "contactNotes"
        );


    if (notesInput) {

        notesInput.value =
            contact.notes ||
            "";

    }


// --------------------------------------
// COUNTRY
// --------------------------------------

    const country =
        findCountryByCode(
            contact.countryCode
        );


    selectedCountry =
        country ||
        findCountryByDialCode(
            contact.countryDialCode
        ) ||
        getDefaultCountry();


    updateSelectedCountryUI();


// --------------------------------------
// MODAL TITLE
// --------------------------------------

    const title =
        getElement(
            "contactModalTitle"
        );


    if (title) {

        title.textContent =
            "Edit Contact";

    }


// --------------------------------------
// SUBMIT BUTTON
// --------------------------------------

    const submitButton =
        getElement(
            "saveContactButton"
        );


    if (submitButton) {

        submitButton.textContent =
            "Save Changes";

    }


// --------------------------------------
// OPEN
// --------------------------------------

    modal.classList.add(
        "open"
    );


    modal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );

}


// ==========================================
// GET CONTACT FORM DATA
// ==========================================

function getContactFormData() {

    const nameInput =
        getElement(
            "contactName"
        );

    const usernameInput =
        getElement(
            "contactUsername"
        );

    const phoneInput =
        getElement(
            "contactPhone"
        );

    const emailInput =
        getElement(
            "contactEmail"
        );

    const dobInput =
        getElement(
            "contactDateOfBirth"
        );

    const addressInput =
        getElement(
            "contactAddress"
        );

    const jobInput =
        getElement(
            "contactJobTitle"
        );

    const companyInput =
        getElement(
            "contactCompany"
        );

    const notesInput =
        getElement(
            "contactNotes"
        );


    return {

        name:
            nameInput?.value ||
            "",

        username:
            usernameInput?.value ||
            "",

        phoneNumber:
            phoneInput?.value ||
            "",

        email:
            emailInput?.value ||
            "",

        dateOfBirth:
            dobInput?.value ||
            "",

        address:
            addressInput?.value ||
            "",

        jobTitle:
            jobInput?.value ||
            "",

        company:
            companyInput?.value ||
            "",

        notes:
            notesInput?.value ||
            ""

    };

}


// ==========================================
// CLEAR CONTACT FORM
// ==========================================

function clearContactForm() {

    const form =
        getElement(
            "contactForm"
        );


    if (form) {

        form.reset();

    }


    editingContactId =
        null;


    selectedContactPhoto =
        null;


    setDefaultCountry();

    updateSelectedCountryUI();

    clearContactFormErrors();

}


// ==========================================
// SAVE CONTACT
// ==========================================

async function saveContact() {

    if (!currentUser) {

        showToast(
            "Please sign in before adding a contact.",
            "error"
        );

        return;

    }


    const formData =
        getContactFormData();


    const validation =
        validateContactData(
            formData
        );


    if (
        !validation.valid
    ) {

        showContactFormError(
            validation.message
        );

        return;

    }


// --------------------------------------
// CONTACT LIMIT
// --------------------------------------

    if (
        !editingContactId &&
        hasReachedContactLimit()
    ) {

        showContactFormError(
            `You can save up to ${MAX_CONTACTS} contacts.`
        );

        return;

    }


// --------------------------------------
// PHONE
// --------------------------------------

    const fullPhoneNumber =
        buildFullPhoneNumber(
            formData.phoneNumber
        );


    const existingPhone =
        findLocalContactByPhone(
            fullPhoneNumber
        );


    if (
        existingPhone &&
        existingPhone.id !==
            editingContactId
    ) {

        showContactFormError(
            "This phone number is already saved in your contacts.",
            "contactPhone"
        );

        return;

    }


// --------------------------------------
// USERNAME
// --------------------------------------

    if (
        formData.username
    ) {

        const existingUsername =
            findLocalContactByUsername(
                formData.username
            );


        if (
            existingUsername &&
            existingUsername.id !==
                editingContactId
        ) {

            showContactFormError(
                "This EchoCall username is already saved.",
                "contactUsername"
            );

            return;

        }

    }


// --------------------------------------
// ECHOCALL LOOKUP
// --------------------------------------

    let echoCallUser =
        null;


    try {

        echoCallUser =
            await lookupEchoCallUser(
                fullPhoneNumber
            );

    }

    catch (error) {

        console.warn(
            "Contacts: EchoCall lookup failed:",
            error
        );

    }


// --------------------------------------
// EDIT EXISTING
// --------------------------------------

    if (
        editingContactId
    ) {

        await updateExistingContact(
            editingContactId,
            formData,
            fullPhoneNumber,
            echoCallUser
        );

        return;

    }


// --------------------------------------
// CREATE NEW
// --------------------------------------

    await createNewContact(
        formData,
        fullPhoneNumber,
        echoCallUser
    );

}


// ==========================================
// CREATE NEW CONTACT
// ==========================================

async function createNewContact(
    formData,
    fullPhoneNumber,
    echoCallUser
) {

    const contactData =
        createContactData(
            formData
        );


    contactData.phoneNumber =
        fullPhoneNumber;


    if (
        echoCallUser
    ) {

        const merged =
            mergeEchoCallUserData(
                contactData,
                echoCallUser
            );


        Object.assign(
            contactData,
            merged
        );

    }


// --------------------------------------
// PHOTO
// --------------------------------------

    if (
        selectedContactPhoto
    ) {

        try {

            contactData.photoURL =
                await uploadContactPhoto(
                    selectedContactPhoto,
                    contactData.contactId
                );

        }

        catch (error) {

            console.error(
                "Contacts: Photo upload failed:",
                error
            );


            showToast(
                "Contact saved, but the photo could not be uploaded.",
                "warning"
            );

        }

    }


// --------------------------------------
// SAVE TO FIRESTORE
// --------------------------------------

    try {

        const contactRef =
            getContactDocumentRef(
                contactData.contactId
            );


        if (!contactRef) {

            throw new Error(
                "Unable to create contact reference."
            );

        }


        await addDoc(
            collection(
                db,
                CONTACTS_COLLECTION,
                currentUser.uid,
                CONTACTS_SUBCOLLECTION
            ),
            contactData
        );


        showToast(
            echoCallUser
                ? "EchoCall contact saved."
                : "Contact saved.",
            "success"
        );


        closeAddContactModal();


        await loadContacts();

    }

    catch (error) {

        console.error(
            "Contacts: Failed to create contact:",
            error
        );


        showContactFormError(
            "Unable to save this contact. Please try again."
        );

    }

}


// ==========================================
// UPDATE EXISTING CONTACT
// ==========================================

async function updateExistingContact(
    contactId,
    formData,
    fullPhoneNumber,
    echoCallUser
) {

    const contact =
        findContactById(
            contactId
        );


    if (!contact) {

        showToast(
            "Contact not found.",
            "error"
        );

        return;

    }


    const updates = {

        name:
            String(
                formData.name || ""
            ).trim(),

        username:
            String(
                formData.username || ""
            ).trim(),

        phoneNumber:
            fullPhoneNumber,

        email:
            String(
                formData.email || ""
            ).trim(),

        dateOfBirth:
            String(
                formData.dateOfBirth || ""
            ).trim(),

        address:
            String(
                formData.address || ""
            ).trim(),

        jobTitle:
            String(
                formData.jobTitle || ""
            ).trim(),

        company:
            String(
                formData.company || ""
            ).trim(),

        notes:
            String(
                formData.notes || ""
            ).trim(),

        countryCode:
            getCountryCode(
                selectedCountry
            ),

        countryName:
            getCountryName(
                selectedCountry
            ),

        countryDialCode:
            getCountryDialCode(
                selectedCountry
            ),

        updatedAt:
            serverTimestamp()

    };
  // --------------------------------------
// ECHOCALL USER DATA
// --------------------------------------

    if (
        echoCallUser
    ) {

        updates.isEchoCallUser =
            true;

        updates.userId =
            echoCallUser.uid ||
            echoCallUser.id ||
            null;

        updates.online =
            echoCallUser.online === true ||
            echoCallUser.isOnline === true;

        updates.isOnline =
            echoCallUser.online === true ||
            echoCallUser.isOnline === true;

        updates.lastSeen =
            echoCallUser.lastSeen ||
            null;


        if (
            echoCallUser.username ||
            echoCallUser.echoCallUsername
        ) {

            updates.username =
                echoCallUser.username ||
                echoCallUser.echoCallUsername;

        }


        if (
            echoCallUser.photoURL ||
            echoCallUser.photoUrl
        ) {

            updates.photoURL =
                echoCallUser.photoURL ||
                echoCallUser.photoUrl;

        }

    }


// --------------------------------------
// PHOTO UPLOAD
// --------------------------------------

    if (
        selectedContactPhoto
    ) {

        try {

            updates.photoURL =
                await uploadContactPhoto(
                    selectedContactPhoto,
                    contactId
                );

        }

        catch (error) {

            console.error(
                "Contacts: Failed to upload updated photo:",
                error
            );

            showToast(
                "Contact updated, but the new photo could not be uploaded.",
                "warning"
            );

        }

    }


// --------------------------------------
// UPDATE FIRESTORE
// --------------------------------------

    try {

        const contactRef =
            getContactDocumentRef(
                contactId
            );


        if (!contactRef) {

            throw new Error(
                "Unable to locate contact reference."
            );

        }


        await updateDoc(
            contactRef,
            updates
        );


        showToast(
            "Contact updated.",
            "success"
        );


        closeAddContactModal();


        await loadContacts();

    }

    catch (error) {

        console.error(
            "Contacts: Failed to update contact:",
            error
        );


        showContactFormError(
            "Unable to update this contact. Please try again."
        );

    }

}
// ==========================================
// UPLOAD CONTACT PHOTO
// ==========================================

async function uploadContactPhoto(
    file,
    contactId
) {

    if (!file) {

        return "";

    }


    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        throw new Error(
            "Profile photo must be 5 MB or smaller."
        );

    }


    if (
        !file.type ||
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Please select a valid image file."
        );

    }


    if (
        !currentUser ||
        !contactId
    ) {

        throw new Error(
            "Unable to upload contact photo."
        );

    }


    const extension =
        file.name
            ?.split(".")
            .pop()
            ?.toLowerCase() ||
        "jpg";


    const storagePath =
        `users/${currentUser.uid}/contacts/${contactId}/profile.${extension}`;


    const storageRef =
        ref(
            storage,
            storagePath
        );


    await uploadBytes(
        storageRef,
        file
    );


    return await getDownloadURL(
        storageRef
    );

}


// ==========================================
// HANDLE CONTACT PHOTO SELECT
// ==========================================

function handleContactPhotoSelect(
    file
) {

    if (!file) {

        return;

    }


    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        showContactFormError(
            "Profile photo must be 5 MB or smaller."
        );

        return;

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showContactFormError(
            "Please select a valid image file."
        );

        return;

    }


    selectedContactPhoto =
        file;


    previewContactPhoto(
        file
    );

}


// ==========================================
// PREVIEW CONTACT PHOTO
// ==========================================

function previewContactPhoto(
    file
) {

    const preview =
        getElement(
            "contactPhotoPreview"
        );


    if (!preview) {

        return;

    }


    const url =
        URL.createObjectURL(
            file
        );


    preview.src =
        url;


    preview.classList.add(
        "visible"
    );


    preview.onload =
        () => {

            URL.revokeObjectURL(
                url
            );

        };

}


// ==========================================
// REMOVE CONTACT PHOTO
// ==========================================

function removeContactPhoto() {

    selectedContactPhoto =
        null;


    const input =
        getElement(
            "contactPhoto"
        );


    if (input) {

        input.value =
            "";

    }


    const preview =
        getElement(
            "contactPhotoPreview"
        );


    if (preview) {

        preview.removeAttribute(
            "src"
        );

        preview.classList.remove(
            "visible"
        );

    }

}


// ==========================================
// OPEN CONTACT DETAILS
// ==========================================

function openContactDetails(
    contactId
) {

    const contact =
        findContactById(
            contactId
        );


    if (!contact) {

        showToast(
            "Contact not found.",
            "error"
        );

        return;

    }


    selectedContact =
        contact;


    selectedContactId =
        contact.id;


    renderContactDetails(
        contact
    );


    const modal =
        getElement(
            "contactDetailsModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "open"
    );


    modal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );

}
// ==========================================
// CLOSE CONTACT DETAILS
// ==========================================

function closeContactDetails() {

    const modal =
        getElement(
            "contactDetailsModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "open"
    );


    modal.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "modal-open"
    );


    selectedContact =
        null;


    selectedContactId =
        null;

}


// ==========================================
// RENDER CONTACT DETAILS
// ==========================================

function renderContactDetails(
    contact
) {

    if (!contact) {

        return;

    }


    const name =
        getContactDisplayName(
            contact
        );


    const username =
        getContactUsername(
            contact
        );


    const phone =
        getContactPhone(
            contact
        );


    const photo =
        getContactPhoto(
            contact
        );


    const nameElement =
        getElement(
            "contactDetailsName"
        );


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    const usernameElement =
        getElement(
            "contactDetailsUsername"
        );


    if (usernameElement) {

        usernameElement.textContent =
            username
                ? `@${username}`
                : "";

    }


    const phoneElement =
        getElement(
            "contactDetailsPhone"
        );


    if (phoneElement) {

        phoneElement.textContent =
            phone;

    }


    const emailElement =
        getElement(
            "contactDetailsEmail"
        );


    if (emailElement) {

        emailElement.textContent =
            contact.email ||
            "";

    }


    const addressElement =
        getElement(
            "contactDetailsAddress"
        );


    if (addressElement) {

        addressElement.textContent =
            contact.address ||
            "";

    }


    const companyElement =
        getElement(
            "contactDetailsCompany"
        );


    if (companyElement) {

        companyElement.textContent =
            contact.company ||
            "";

    }


    const jobElement =
        getElement(
            "contactDetailsJobTitle"
        );


    if (jobElement) {

        jobElement.textContent =
            contact.jobTitle ||
            "";

    }


    const notesElement =
        getElement(
            "contactDetailsNotes"
        );


    if (notesElement) {

        notesElement.textContent =
            contact.notes ||
            "";

    }


//  --------------------------------------
// PHOTO
// --------------------------------------

    const photoElement =
        getElement(
            "contactDetailsPhoto"
        );


    if (photoElement) {

        if (photo) {

            photoElement.src =
                photo;

            photoElement.classList.remove(
                "fallback"
            );

        }

        else {

            photoElement.removeAttribute(
                "src"
            );

            photoElement.classList.add(
                "fallback"
            );

        }

    }


// --------------------------------------
// STATUS
// --------------------------------------

    const statusElement =
        getElement(
            "contactDetailsStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            formatLastSeen(
                contact
            );


        statusElement.classList.toggle(
            "online",
            isContactOnline(
                contact
            )
        );

    }

}


// ==========================================
// END PART 2
// ==========================================