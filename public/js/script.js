document.addEventListener('DOMContentLoaded', () => {
    
    // Header Scroll Effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.add('scrolled'); // Always keep background on mobile
            if(window.innerWidth > 991) {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Initial check for scroll
    if (window.scrollY > 50 || window.innerWidth <= 991) {
        header.classList.add('scrolled');
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100; // offset for fixed header
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // WhatsApp Enquiry Form Submission
    const enquiryForm = document.getElementById('enquiry-form');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const product = document.getElementById('product').value;
            const message = document.getElementById('message').value;
            
            const whatsappNumber = '919334940647';
            
            let whatsappMessage = `Hello RK Steel Furniture,%0A%0AI would like to enquire about:%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Product:* ${product}`;
            
            if (message) {
                whatsappMessage += `%0A*Message:* ${message}`;
            }
            
            whatsappMessage += `%0A%0APlease share the price, available designs and details.`;
            
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
            
            window.open(whatsappUrl, '_blank');
            enquiryForm.reset();
        });
    }
});

// Product-specific WhatsApp Enquiry
    const productButtons = document.querySelectorAll('.product-card .btn-outline-gold');
    productButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const productCard = btn.closest('.product-card');
            const name = productCard.querySelector('h3').innerText;
            const price = productCard.querySelector('.product-price strong').innerText;
            const desc = productCard.querySelector('p:not(.product-price)').innerText;

            const message = `Hello RK Steel Furniture,\n\nI am interested in this product:\n\nProduct: ${name}\nPrice: ${price}\n\nDetails:\n${desc}\n\nPlease share more details, availability and final price.\n\nThank you.`;
            
            const url = `https://wa.me/919334940647?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });
    });
