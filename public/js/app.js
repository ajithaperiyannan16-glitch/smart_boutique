document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial catalog fetch on load
    fetchProducts();

    // 2. Event Listener for Smart Fit Search Form
    const matchForm = document.getElementById('smartMatchForm');
    if (matchForm) {
        matchForm.addEventListener('submit', handleSmartMatch);
    }

    // 3. Event Listener for Appointment Form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
});

/**
 * Helper function to send user actions from webpage to MySQL database
 */
function sendDataToAnalytics(eventType, bodyShape = null, preferredStyle = null, productId = null) {
    fetch('/api/analytics/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            eventType: eventType,
            bodyShape: bodyShape,
            preferredStyle: preferredStyle,
            productId: productId
        })
    })
    .then(response => response.json())
    .then(data => console.log('Analytics Event Inserted:', data))
    .catch(error => console.error('Analytics Logging Error:', error));
}

/**
 * Fetch and display default product list
 */
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const result = await response.json();

        if (result.success) {
            renderProducts(result.data);
        }
    } catch (error) {
        console.error('Error fetching catalog products:', error);
    }
}

/**
 * Handle algorithmic fit search and record user preferences to analytics_events
 */
async function handleSmartMatch(event) {
    event.preventDefault();

    const bodyShape = document.getElementById('bodyShape').value;
    const preferredStyle = document.getElementById('preferredStyle').value;

    try {
        const response = await fetch('/api/smart-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bodyShape, preferredStyle })
        });

        const result = await response.json();

        if (result.success) {
            renderProducts(result.data);

            // Insert SEARCH_FIT event into MySQL analytics table
            sendDataToAnalytics('SEARCH_FIT', bodyShape, preferredStyle, null);
        }
    } catch (error) {
        console.error('Error executing Smart Match search:', error);
    }
}

/**
 * Handle bespoke booking transaction and log event
 */
async function handleBooking(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const bodyShape = document.getElementById('bodyShape') ? document.getElementById('bodyShape').value : 'Rectangle';
    const appointmentDate = document.getElementById('appointmentDate').value;
    const serviceType = document.getElementById('serviceType').value;

    try {
        const response = await fetch('/api/appointments/bespoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, bodyShape, appointmentDate, serviceType })
        });

        const result = await response.json();

        if (result.success) {
            alert('Your bespoke appointment has been confirmed!');

            // Insert BOOK_FITTING event into MySQL analytics table
            sendDataToAnalytics('BOOK_FITTING', bodyShape, serviceType, null);

            event.target.reset();
        } else {
            alert('Booking failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting appointment:', error);
    }
}

/**
 * Render catalog products dynamically with view-tracking click handlers
 */
function renderProducts(products) {
    const container = document.getElementById('productContainer');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p class="no-results">No boutique items match your selected criteria.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="sendDataToAnalytics('VIEW_PRODUCT', '${product.recommended_shape}', null, ${product.id})">
            <img src="${product.image_url}" alt="${product.title}">
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <div class="price-tag">$${product.price}</div>
                <div class="fit-badge">Fit: ${product.fit_type} | Recommended: ${product.recommended_shape}</div>
            </div>
        </div>
    `).join('');
}