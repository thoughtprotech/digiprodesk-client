# Orion UI Demo Documentation

## Overview

The Orion UI Demo provides an interface for different user roles—Guest, Host, and Admin—to interact with the platform. The application allows users to log in, switch themes, and access various features depending on their role.

---

## Feature List

### Common Features:

- **Login and Logout**: Users can log in to the platform and log out when done.
- **Theme Switch**: Users can switch between light and dark themes via the menu in the top right corner.

---

## Feature List by Route

### /login (Common Route):

- A universal login page accessible by all users (admin, host, guest).

### /settings (Common Route):

- Users can manage their personal settings such as updating passwords, notification preferences, and profile details.

### /watchCenter (Host Route):

- Hosts can view live video feeds from selected locations.
- Hosts can add and remove locations as required.

### /call (Host Route):

- Host can manage incoming calls and see calls on hold.
- Host can attend calls, mute mic and camera, and capture documents during a call.
- Host can filter calls by status (incoming, hold).
- Active calls can be put on hold, with notifications displayed on the guest screen.
- Right panel can be collapsed for a more streamlined view.
- Call statistics (total calls, incoming calls, calls on hold) are shown and color-coded for clarity.
- Host can capture required documents during a call. During this the host will enter the booking id associated with the documents and can also enter any notes if needed.

### /admin (Admin Routes):

- **/admin/dashboard**: Analytical dashboard for admins to monitor data.
- **/admin/users**: User management page for admins to control access and roles.
- **/admin/locations**: Location management page for configuring guest screens (UI and features to be implemented).
- **/admin/documents**: Page where all documents captured during calls can be managed. Admins can search, view, and organize documents associated with specific bookings or users.
