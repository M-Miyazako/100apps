// Calendar Application
class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.events = this.loadEvents();
        this.editingEvent = null;
        this.reminderIntervals = new Map();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCalendar();
        this.updateTodayEvents();
        this.setupReminders();
        this.requestNotificationPermission();
    }

    bindEvents() {
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());

        // Event management
        document.getElementById('addEventBtn').addEventListener('click', () => this.showEventModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideEventModal());
        document.getElementById('closeDetailsModal').addEventListener('click', () => this.hideEventDetailsModal());
        document.getElementById('cancelEvent').addEventListener('click', () => this.hideEventModal());
        document.getElementById('eventForm').addEventListener('submit', (e) => this.handleEventSubmit(e));
        document.getElementById('deleteEvent').addEventListener('click', () => this.deleteEvent());

        // Event details modal
        document.getElementById('editEventBtn').addEventListener('click', () => this.editEventFromDetails());
        document.getElementById('deleteEventBtn').addEventListener('click', () => this.deleteEventFromDetails());

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchEvents());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchEvents();
        });

        // Close modals on outside click
        document.getElementById('eventModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') this.hideEventModal();
        });
        document.getElementById('eventDetailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventDetailsModal') this.hideEventDetailsModal();
        });
    }

    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update month/year display
        document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;

        // Clear previous calendar
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Create calendar grid
        const today = new Date();
        const todayStr = this.formatDate(today);

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayElement = this.createDayElement(currentDate, month, todayStr);
            calendarDays.appendChild(dayElement);
        }
    }

    createDayElement(date, currentMonth, todayStr) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        const dateStr = this.formatDate(date);
        const dayNumber = date.getDate();
        const isOtherMonth = date.getMonth() !== currentMonth;
        const isToday = dateStr === todayStr;

        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        if (isToday) {
            dayElement.classList.add('today');
        }

        dayElement.innerHTML = `
            <div class="day-number">${dayNumber}</div>
            <div class="day-events" id="events-${dateStr}"></div>
        `;

        // Add click event
        dayElement.addEventListener('click', () => this.selectDate(date));

        // Add events for this day
        this.renderDayEvents(dateStr);

        return dayElement;
    }

    renderDayEvents(dateStr) {
        const eventsContainer = document.getElementById(`events-${dateStr}`);
        if (!eventsContainer) return;

        const dayEvents = this.events.filter(event => event.date === dateStr);
        eventsContainer.innerHTML = '';

        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event-dot ${event.category}`;
            eventElement.textContent = event.title;
            eventElement.title = `${event.title} - ${event.time || 'All day'}`;
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEventDetails(event);
            });
            eventsContainer.appendChild(eventElement);
        });
    }

    selectDate(date) {
        this.selectedDate = date;
        
        // Remove previous selection
        document.querySelectorAll('.day.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Add selection to current day
        const dateStr = this.formatDate(date);
        const dayElement = document.querySelector(`#events-${dateStr}`).parentElement;
        dayElement.classList.add('selected');

        // Show event modal with selected date
        this.showEventModal(date);
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    }

    showEventModal(date = null) {
        const modal = document.getElementById('eventModal');
        const form = document.getElementById('eventForm');
        
        // Reset form
        form.reset();
        
        // Set date if provided
        if (date) {
            document.getElementById('eventDate').value = this.formatDate(date);
        } else if (this.selectedDate) {
            document.getElementById('eventDate').value = this.formatDate(this.selectedDate);
        }

        // Update modal title and buttons
        if (this.editingEvent) {
            document.getElementById('modalTitle').textContent = 'Edit Event';
            document.getElementById('saveEvent').textContent = 'Update Event';
            document.getElementById('deleteEvent').style.display = 'block';
            this.populateEventForm(this.editingEvent);
        } else {
            document.getElementById('modalTitle').textContent = 'Add Event';
            document.getElementById('saveEvent').textContent = 'Save Event';
            document.getElementById('deleteEvent').style.display = 'none';
        }

        modal.classList.add('show');
    }

    hideEventModal() {
        document.getElementById('eventModal').classList.remove('show');
        this.editingEvent = null;
    }

    showEventDetailsModal(event) {
        const modal = document.getElementById('eventDetailsModal');
        const content = document.getElementById('eventDetailsContent');
        
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        content.innerHTML = `
            <div class="event-details">
                <h4>${event.title}</h4>
                <p><strong>Date:</strong> ${dateStr}</p>
                <p><strong>Time:</strong> ${event.time || 'All day'}</p>
                <p><strong>Category:</strong> ${event.category}</p>
                ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                <p><strong>Reminder:</strong> ${this.getReminderText(event.reminder)}</p>
            </div>
        `;

        // Store event for editing/deleting
        this.editingEvent = event;
        modal.classList.add('show');
    }

    hideEventDetailsModal() {
        document.getElementById('eventDetailsModal').classList.remove('show');
        this.editingEvent = null;
    }

    showEventDetails(event) {
        this.showEventDetailsModal(event);
    }

    editEventFromDetails() {
        this.hideEventDetailsModal();
        this.showEventModal();
    }

    deleteEventFromDetails() {
        if (confirm('Are you sure you want to delete this event?')) {
            this.deleteEvent();
            this.hideEventDetailsModal();
        }
    }

    populateEventForm(event) {
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time || '';
        document.getElementById('eventCategory').value = event.category;
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventReminder').value = event.reminder || 'none';
    }

    handleEventSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const eventData = {
            id: this.editingEvent ? this.editingEvent.id : this.generateId(),
            title: document.getElementById('eventTitle').value.trim(),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            category: document.getElementById('eventCategory').value,
            description: document.getElementById('eventDescription').value.trim(),
            reminder: document.getElementById('eventReminder').value
        };

        if (!eventData.title || !eventData.date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (this.editingEvent) {
            this.updateEvent(eventData);
        } else {
            this.addEvent(eventData);
        }

        this.hideEventModal();
    }

    addEvent(eventData) {
        this.events.push(eventData);
        this.saveEvents();
        this.renderCalendar();
        this.updateTodayEvents();
        this.setupEventReminder(eventData);
        this.showNotification('Event added successfully');
    }

    updateEvent(eventData) {
        const index = this.events.findIndex(e => e.id === eventData.id);
        if (index !== -1) {
            // Clear old reminder
            this.clearEventReminder(this.events[index]);
            
            this.events[index] = eventData;
            this.saveEvents();
            this.renderCalendar();
            this.updateTodayEvents();
            this.setupEventReminder(eventData);
            this.showNotification('Event updated successfully');
        }
    }

    deleteEvent() {
        if (this.editingEvent) {
            if (confirm('Are you sure you want to delete this event?')) {
                this.clearEventReminder(this.editingEvent);
                this.events = this.events.filter(e => e.id !== this.editingEvent.id);
                this.saveEvents();
                this.renderCalendar();
                this.updateTodayEvents();
                this.hideEventModal();
                this.showNotification('Event deleted successfully');
            }
        }
    }

    updateTodayEvents() {
        const today = this.formatDate(new Date());
        const todayEvents = this.events.filter(event => event.date === today);
        const container = document.getElementById('todayEvents');

        if (todayEvents.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No events today</p></div>';
            return;
        }

        container.innerHTML = todayEvents.map(event => `
            <div class="event-item ${event.category}" onclick="window.calendar.showEventDetails(${JSON.stringify(event).replace(/"/g, '&quot;')})">
                <div class="event-title">${event.title}</div>
                <div class="event-time">${event.time || 'All day'}</div>
            </div>
        `).join('');
    }

    searchEvents() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        
        if (!query) {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }

        const results = this.events.filter(event => 
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.category.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            this.showNotification('No events found', 'warning');
            return;
        }

        // Show results in today's events section temporarily
        const container = document.getElementById('todayEvents');
        const originalTitle = container.previousElementSibling.textContent;
        
        container.previousElementSibling.textContent = `Search Results (${results.length})`;
        container.innerHTML = results.map(event => `
            <div class="event-item ${event.category}" onclick="window.calendar.showEventDetails(${JSON.stringify(event).replace(/"/g, '&quot;')})">
                <div class="event-title">${event.title}</div>
                <div class="event-time">${event.date} ${event.time || 'All day'}</div>
            </div>
        `).join('');

        // Reset after 10 seconds
        setTimeout(() => {
            container.previousElementSibling.textContent = originalTitle;
            this.updateTodayEvents();
        }, 10000);
    }

    setupReminders() {
        this.events.forEach(event => {
            this.setupEventReminder(event);
        });
    }

    setupEventReminder(event) {
        if (!event.reminder || event.reminder === 'none') return;

        const eventDateTime = new Date(`${event.date}T${event.time || '00:00'}`);
        const reminderTime = new Date(eventDateTime.getTime() - (parseInt(event.reminder) * 60000));
        const now = new Date();

        if (reminderTime > now) {
            const timeUntilReminder = reminderTime.getTime() - now.getTime();
            
            // Clear existing reminder
            this.clearEventReminder(event);
            
            // Set new reminder
            const timeoutId = setTimeout(() => {
                this.showEventNotification(event);
            }, timeUntilReminder);
            
            this.reminderIntervals.set(event.id, timeoutId);
        }
    }

    clearEventReminder(event) {
        if (this.reminderIntervals.has(event.id)) {
            clearTimeout(this.reminderIntervals.get(event.id));
            this.reminderIntervals.delete(event.id);
        }
    }

    showEventNotification(event) {
        const reminderText = this.getReminderText(event.reminder);
        
        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification(`Event Reminder: ${event.title}`, {
                body: `${reminderText} - ${event.time || 'All day'}`,
                icon: '/favicon.ico'
            });
        }

        // In-app notification
        const notification = document.createElement('div');
        notification.className = 'notification-alert';
        notification.innerHTML = `
            <strong>Event Reminder</strong><br>
            ${event.title} - ${reminderText}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Add to notifications list
        this.addToNotificationsList(event);
    }

    addToNotificationsList(event) {
        const container = document.getElementById('notificationsList');
        const notification = document.createElement('div');
        notification.className = 'notification-item';
        notification.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-time">Reminder: ${this.getReminderText(event.reminder)}</div>
        `;
        
        container.insertBefore(notification, container.firstChild);
        
        // Keep only last 5 notifications
        while (container.children.length > 5) {
            container.removeChild(container.lastChild);
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    getReminderText(reminder) {
        switch (reminder) {
            case '5': return '5 minutes before';
            case '15': return '15 minutes before';
            case '30': return '30 minutes before';
            case '60': return '1 hour before';
            case '1440': return '1 day before';
            default: return 'No reminder';
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification-alert ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Utility methods
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Local storage methods
    saveEvents() {
        localStorage.setItem('calendar-events', JSON.stringify(this.events));
    }

    loadEvents() {
        const stored = localStorage.getItem('calendar-events');
        return stored ? JSON.parse(stored) : [];
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new CalendarApp();
});

// Add some sample events for demonstration
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const hasEvents = localStorage.getItem('calendar-events');
        if (!hasEvents) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const sampleEvents = [
                {
                    id: 'sample1',
                    title: 'Team Meeting',
                    date: window.calendar.formatDate(today),
                    time: '10:00',
                    category: 'work',
                    description: 'Weekly team standup meeting',
                    reminder: '15'
                },
                {
                    id: 'sample2',
                    title: 'Dentist Appointment',
                    date: window.calendar.formatDate(tomorrow),
                    time: '14:30',
                    category: 'health',
                    description: 'Regular checkup',
                    reminder: '60'
                },
                {
                    id: 'sample3',
                    title: 'Birthday Party',
                    date: window.calendar.formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)),
                    time: '19:00',
                    category: 'social',
                    description: 'John\'s birthday celebration',
                    reminder: '1440'
                }
            ];
            
            window.calendar.events = sampleEvents;
            window.calendar.saveEvents();
            window.calendar.renderCalendar();
            window.calendar.updateTodayEvents();
            window.calendar.setupReminders();
        }
    }, 100);
});