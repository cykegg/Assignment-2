let page = 1;

const perPage = 15;

let searchName = null;

function loadListingsData() {
    let apiUrl = `/api/listings?page=${page}&perPage=${perPage}`;
    if (searchName) {
        apiUrl += `&name=${encodeURIComponent(searchName)}`;
    }

    fetch(apiUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok');
        })
        .then(data => {
            if (data.listings.length) {
                populateListingsTable(data.listings);
            } else {
                if (page > 1) {
                    page--;
                    loadListingsData();
                } else {
                    populateListingsTable([]);
                }
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            if (page > 1) {
                page--;
                loadListingsData();
            } else {
                populateListingsTable([]);
            }
        });
}

function populateListingsTable(listings) {
    const tableBody = document.querySelector('#listingsTable tbody');
    tableBody.innerHTML = '';

    if (listings.length > 0) {
        const rows = listings.map(listing => {
            return `
                <tr data-id="${listing._id}">
                    <td>${listing.name}</td>
                    <td>${listing.room_type}</td>
                    <td>${listing.address?.street || 'N/A'}</td>
                    <td>${listing.summary ? listing.summary.replace(/<br\s*\/?>/g, '<br/>') : 'No summary available'}</td>
                </tr>
            `;
        }).join('');
        tableBody.innerHTML = rows;

        document.querySelectorAll('#listingsTable tbody tr').forEach(row => {
            row.addEventListener('click', () => {
                const listingId = row.getAttribute('data-id');
                fetchListingDetails(listingId);
            });
        });
    } else {
        tableBody.innerHTML = '<tr><td colspan="4"><strong>No data available</strong></td></tr>';
    }

    document.getElementById('current-page').textContent = page;
}

function fetchListingDetails(listingId) {
    fetch(`/api/listings/${listingId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(listing => {
            showModal(listing);
        })
        .catch(error => {
            console.error('Error fetching listing details:', error);
        });
}

function showModal(listing) {
    const modalTitle = document.querySelector('#detailsModal .modal-title');
    const modalBody = document.querySelector('#detailsModal .modal-body');

    modalTitle.textContent = listing.name;
    modalBody.innerHTML = `
        <img id="photo"
            onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'"
            class="img-fluid w-100"
            src="${listing.images?.picture_url || 'https://placehold.co/600x400?text=Photo+Not+Available'}"
        >
        <br/><br/>
        ${listing.neighborhood_overview || 'No neighborhood overview available.'}<br/><br/>
        <strong>Price:</strong> ${listing.price.toFixed(2)}<br/>
        <strong>Room:</strong> ${listing.room_type}<br/>
        <strong>Bed:</strong> ${listing.bed_type}<br/>
        <strong>Beds:</strong> ${listing.beds || 0}<br/><br/>
    `;

    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    loadListingsData();

    document.getElementById('previous-page').addEventListener('click', (e) => {
        e.preventDefault();
        if (page > 1) {
            page--;
            loadListingsData();
        }
    });

    document.getElementById('next-page').addEventListener('click', (e) => {
        e.preventDefault();
        page++;
        loadListingsData();
    });

    document.getElementById('searchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        searchName = document.getElementById('name').value.trim();
        page = 1;
        loadListingsData();
    });

    document.getElementById('clearForm').addEventListener('click', () => {
        document.getElementById('name').value = '';
        searchName = null;
        loadListingsData();
    });
});
