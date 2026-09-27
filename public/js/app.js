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

            // Send analytics event without blocking UI
            fetch('/api/analytics/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'SEARCH_FIT',
                    bodyShape: bodyShape,
                    preferredStyle: preferredStyle
                })
            }).catch(err => console.error('Analytics log error:', err));
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}