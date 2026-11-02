// place files you want to import through the `$lib` alias in this folder.

// Shared company information components
export const site = {
    name: "Heritage Café",
    location: "Friendswood, TX",
    logo: "/images/logo-placeholder.svg",
    address: "15825 Hope Village Rd Ste b, Friendswood, TX 77546",
    phone: "(832) 569-4556",
    email: "heritagecafeo@gmail.com",
    facebook: "https://www.facebook.com/heritagecafeFTX/",
    hours: [
        {days: "Monday-Saturday", time: "8:00am - 8:00pm"},
        {days: "Sunday", time: "8:30am - 8:00pm"}
    ]
};

// Update link destinations for actual site pages if needed (will have placeholders for now)
export const navigation = [
    { label: "Home", href: "/"},
    { label: "About Us", href: "/about"},
    { label: "Menu", href: "/menu"},
    { label: "Order Here", href: "/order"},
    { label: "Contact Us", href: "/contact"},
];