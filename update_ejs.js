const fs = require('fs');
let html = fs.readFileSync('views/index.ejs', 'utf8');

// Replace settings
html = html.replace(/RK STEEL FURNITURE/g, '<%= settings.businessName %>');
html = html.replace(/RK Steel Furniture/g, '<%= settings.businessName %>');
html = html.replace(/Strong • Stylish • Durable/g, '<%= settings.tagline1 %>');
html = html.replace(/Better Furniture, Better Life/g, '<%= settings.tagline2 %>');
html = html.replace(/\+91 9334940647/g, '<%= settings.phone %>');
html = html.replace(/9334940647/g, '<%= settings.whatsapp.replace(/[^0-9]/g, "") %>');
html = html.replace(/Assam, Lanka/g, '<%= settings.location %>');

// Replace Products with a loop
const productGridRegex = /<div class="product-grid">([\s\S]*?)<\/section>/;
const productGridReplacement = `<div class="product-grid">
                <% products.forEach(product => { %>
                <div class="product-card">
                    <div class="product-image">
                        <img src="/assets/<%= product.image %>" alt="<%= product.name %>">
                        <% if (product.featured) { %><span class="badge badge-gold">Featured</span><% } %>
                    </div>
                    <div class="product-info">
                        <h3><%= product.name %></h3>
                        <p><%= product.description %></p>
                        <% if (settings.freeDelivery === 'true') { %><p class="delivery-product-badge"><i class="fa-solid fa-truck"></i> Free Delivery within <%= settings.deliveryRadius %></p><% } %>
                        <p class="product-price">Starting From <strong><%= product.price %></strong></p>
                        <a href="https://wa.me/<%= settings.whatsapp.replace(/[^0-9]/g, "") %>?text=<%= encodeURIComponent(product.whatsappMsg) %>" class="btn btn-outline-gold" target="_blank">View More</a>
                    </div>
                </div>
                <% }) %>
            </div>
        </div>
    </section>`;
html = html.replace(productGridRegex, productGridReplacement);

// Section Visibility Wrapper
html = html.replace(/<section id="showroom"/, '<% if (sections.showroom && sections.showroom.isVisible) { %><section id="showroom"');
html = html.replace(/<!-- About Us Section -->/, '<% } %>\n\n    <!-- About Us Section -->');

fs.writeFileSync('views/index.ejs', html);
console.log('EJS Updated');
