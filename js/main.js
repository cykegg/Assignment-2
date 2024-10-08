// Global variables
let page = 1;
const perPage = 10;
let searchName = null;
const apiUrl = "https://https://assignment-1-five-lime.vercel.app/api/listings";

// Function to load listings data
function loadListingData() {
    let url = `${apiUrl}?page=${page}&perPage=${perPage}`;
    
    // Add searchName to query if it exists
    if (searchName) {
        url += `&name=${searchName}`;
    }

    // Fetch data from the API
    fetch(url)
        .then(res => res.ok ? res.json() : Promise.reject(res.status))
        .then(data => {
            const listingsTable = document.querySelector('#listingsTable tbody');
            listingsTable.innerHTML = ""; // Clear the table content

            // Check if data is available
            if (data.length) {
                const rows = data.map(listing => `
                    <tr data-id="${listing._id}">
                        <td>${listing.name}</td>
                        <td>${listing.room_type}</td>
                        <td>${listing.address.street}, ${listing.address.city}, ${listing.address.country}</td>
                        <td>
                            ${listing.summary || ''}<br/><br/>
                            <strong>Accommodates:</strong> ${listing.accommodates}<br/>
                            <strong>Rating:</strong> ${listing.review_scores.review_scores_rating || 'N/A'} (${listing.number_of_reviews || 0} Reviews)
                        </td>
                    </tr>
                `).join('');
                listingsTable.innerHTML = rows;

                // Add click events to newly added <tr> elements
                document.querySelectorAll('#listingsTable tbody tr').forEach(row => {
                    row.addEventListener('click', () => {
                        const listingId = row.getAttribute('data-id');
                        fetch(`${apiUrl}/${listingId}`)
                            .then(res => res.ok ? res.json() : Promise.reject(res.status))
                            .then(data => {
                                const modalTitle = document.querySelector('#detailsModal .modal-title');
                                const modalBody = document.querySelector('#detailsModal .modal-body');
                                
                                modalTitle.textContent = data.name;

                                modalBody.innerHTML = `
                                    <img id="photo" class="img-fluid w-100" 
                                        src="${data.images.picture_url}" 
                                        onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'">
                                    <br/><br/>
                                    ${data.neighborhood_overview || ''}<br/><br/>
                                    <strong>Price:</strong> ${data.price.toFixed(2)}<br/>
                                    <strong>Room:</strong> ${data.room_type}<br/>
                                    <strong>Bed:</strong> ${data.bed_type} (${data.beds || 1})<br/>
                                `;
                                
                                // Show modal
                                const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
                                modal.show();
                            })
                            .catch(err => console.error('Error fetching listing details:', err));
                    });
                });
            } else {
                // No listings available
                if (page > 1) {
                    page--; // Prevent paging further
                    loadListingData();
                } else {
                    listingsTable.innerHTML = `<tr><td colspan="4"><strong>No data available</td></tr>`;
                }
            }

            // Update current page
            document.getElementById('current-page').textContent = page;
        })
        .catch(err => {
            console.error('Error fetching listings:', err);
            const listingsTable = document.querySelector('#listingsTable tbody');
            listingsTable.innerHTML = `<tr><td colspan="4"><strong>Error fetching data. Please try again later.</td></tr>`;
        });
}

// Event listener for previous page button
document.getElementById('previous-page').addEventListener('click', (e) => {
    e.preventDefault();
    if (page > 1) {
        page--;
        loadListingData();
    }
});

// Event listener for next page button
document.getElementById('next-page').addEventListener('click', (e) => {
    e.preventDefault();
    page++;
    loadListingData();
});

// Event listener for search form submit
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    searchName = document.getElementById('name').value;
    page = 1; // Reset to the first page
    loadListingData();
});

// Event listener for clear form button
document.getElementById('clearForm').addEventListener('click', () => {
    document.getElementById('name').value = ""; // Clear the search field
    searchName = null; // Reset the search
    page = 1; // Reset to the first page
    loadListingData(); // Reload data without filters
});

// Initial load of listings when DOM is ready
document.addEventListener('DOMContentLoaded', loadListingData);
