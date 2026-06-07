// Next Five Upcoming Events
// CONFIGURATION: Replace these with your actual keys
const CALENDAR_ID = 'YOUR_CALENDAR_ID@group.calendar.google.com';
const API_KEY = 'YOUR_GOOGLE_API_KEY';

const now = new Date().toISOString();
const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${now}&maxResults=5&singleEvents=true&orderBy=startTime`;

async function fetchUpcomingEvents() {
    const listElement = document.getElementById('events-list');
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        listElement.innerHTML = '';
        
        if (!data.items || data.items.length === 0) {
            listElement.innerHTML = '<li class="no-events">No upcoming events</li>';
            return;
        }
        
        data.items.forEach(event => {
            const eventDateTime = event.start.dateTime || event.start.date;
            const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = new Date(eventDateTime).toLocaleDateString('en-US', options);
            
            const li = document.createElement('li');
            li.className = 'event-item';
            li.innerHTML = `
                <span class="event-title">${event.summary}</span>
                <span class="event-date">${formattedDate}</span>
            `;
            listElement.appendChild(li);
        });
        
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        listElement.innerHTML = '<li class="no-events">Unable to load events at this time.</li>';
    }
}

document.addEventListener('DOMContentLoaded', fetchUpcomingEvents);