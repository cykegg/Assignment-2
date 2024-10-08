/****************************************************************************
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Assignment: 2247 / 2
* Student Name: Ahnaf Abrar Khan
* Student Email: aakhan82@myseneca.ca
* Course/Section: WEB422/ZAA
* Deployment URL: assignment-2-gtyjlb2e5-ahnaf-khans-projects-bd989811.vercel.app
*
*****************************************************************************/

let page = 1;
const perPage = 15; 
let searchName = null; 

async function loadListingsData() {
    try {
        const apiUrl = `https://assignment-1-five-lime.vercel.app/api/listings?page=${page}&perPage=${perPage}${searchName ? `&name=${searchName}` : ''}`;
        
        const response = await fetch(apiUrl);
        const data = response.ok ? await response.json() : Promise.reject(response.status);

        updateCurrentPageDisplay(); 
        updateListingsTable(data);
        
    } catch (error) {
        console.error('Error fetching listings:', error);
        handleNoListings(); 
    }
}

function updateListingsTable(data) {
    const listingsTableBody = document.querySelector('#listingsTable tbody');
    if (Array.isArray(data) && data.length) {
        listingsTableBody.innerHTML = ''; 
        const rows = data.map(createListingRow).join('');
        listingsTableBody.innerHTML = rows; 
        addRowClickEvents();
    } else {
        handleNoListings(); 
    }
}


function createListingRow(listing) {
    return `
        <tr data-id="${listing._id}">
            <td>${listing.name}</td>
            <td>${listing.room_type}</td>
            <td>${listing.address?.street || 'N/A'}</td>
            <td>${listing.summary || 'Not available'}<br/><br/>
                <strong>Accommodates:</strong> ${listing.accommodates}<br/>
                <strong>Rating:</strong> ${listing.review_scores?.review_scores_rating || 'N/A'} (${listing.number_of_reviews || 0} Reviews)
            </td>
        </tr>
    `;
}


function addRowClickEvents() {
    const rowsElements = document.querySelectorAll('#listingsTable tbody tr');
    rowsElements.forEach(row => {
        row.addEventListener('click', () => {
            const listingId = row.getAttribute('data-id');
            loadListingDetails(listingId); 
        });
    });
}


function updateCurrentPageDisplay() {
    document.getElementById('current-page').textContent = `Page ${page}`;
}


function handleNoListings() {
    if (page > 1) {
        page--;
        loadListingsData(); 
    } else {
        const listingsTableBody = document.querySelector('#listingsTable tbody');
        listingsTableBody.innerHTML = '<tr><td colspan="4"><strong>Not available</strong></td></tr>';
    }
}


async function loadListingDetails(listingId) {
    try {
        const response = await fetch(`https://assignment-1-five-lime.vercel.app/api/listings/${listingId}`);
        const listingDetails = response.ok ? await response.json() : Promise.reject(response.status);

        updateModalContent(listingDetails); 
        showModal(); 

    } catch (error) {
        console.error('Error', error);
    }
}


function updateModalContent(listingDetails) {
    const modalTitle = document.getElementById('detailsModalLabel');
    const modalBody = document.querySelector('#detailsModal .modal-body');

    modalTitle.textContent = listingDetails.name;
    modalBody.innerHTML = `
        <img id="photo" 
             onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'" 
             class="img-fluid w-100"
             src="${listingDetails.images?.picture_url || 'https://placehold.co/600x400?text=Photo+Not+Available'}">
        <br/><br/>
        ${listingDetails.neighborhood_overview || 'Not available'}<br/><br/>
        <strong>Price:</strong> ${listingDetails.price.toFixed(2)}<br/>
        <strong>Room:</strong> ${listingDetails.room_type}<br/>
        <strong>Bed:</strong> ${listingDetails.bed_type || 'N/A'} (${listingDetails.beds || 0})<br/><br/>
    `;
}

function showModal() {
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    loadListingsData(); 
    initializePagination(); 
    initializeSearch(); 
});

function initializePagination() {
    document.getElementById('previous-page').addEventListener('click', (event) => {
        event.preventDefault();
        if (page > 1) {
            page--;
            loadListingsData();
        }
    });

    document.getElementById('next-page').addEventListener('click', (event) => {
        event.preventDefault();
        page++;
        loadListingsData(); 
    });
}

function initializeSearch() {
    document.getElementById('searchForm').addEventListener('submit', (event) => {
        event.preventDefault();
        searchName = document.getElementById('name').value.trim(); 
        page = 1; 
        loadListingsData(); 
    });

    document.getElementById('clearForm').addEventListener('click', () => {
        const searchInput = document.getElementById('name');
        searchInput.value = ''; 
        searchName = null; 
        loadListingsData(); 
    });
};
