---
applyTo: '**'
---
Objective

The goal of this application, Song Sorter, is to provide a highly efficient and intuitive way for Spotify users to organize their "Liked Songs" playlist. Unlike the tedious process of manual sorting on the Spotify app, Song Sorter presents users with one song at a time, allowing them to quickly sort it into one or more designated "target" playlists. This approach transforms a daunting, hours-long task into a simple, engaging, and rewarding experience. The ultimate objective is to help users reclaim control of their music library, turning a monolithic collection of songs into a perfectly curated and accessible collection.

Key Features

    Spotify Integration: Securely connect with a user's Spotify account to access their "Liked Songs" and existing playlists.

    Intuitive Sorting Interface: Present one song at a time with its artwork and details. A play button allows users to listen to a 30-second preview.

    Multi-Select Sorting: Allow users to add a single song to one or more of their target playlists with a simple tap.

    Dynamic Playlist Management: Easily create new playlists on the fly and designate them as a target.

    Progress Tracking: Show a clear, visual representation of how many songs have been sorted and how many remain.

    Continuous Sync: The app will periodically sync with Spotify to account for any changes in the user's "Liked Songs" or playlists, ensuring that the sorting queue remains accurate.

    "Skip" Option: Provides the ability to skip a song and keep it in the "Liked Songs" list for later sorting.

Technical Approach

1. Core Logic

The application will not rely on Spotify's data alone to track the sorting process. Instead, it will use a dedicated backend database to manage the state of each song.

    Initial Sync: Upon a user's first login, the app will fetch all of their "Liked Songs" from Spotify and store their unique IDs in a user_songs table within our database.

    Target Playlists: The user will designate which of their Spotify playlists are to be used for sorting. This will be tracked with a flag (is_target) in a separate playlists database table.

    Sorting Queue: The app will build the list of songs to be sorted by comparing the user's "Liked Songs" against the contents of all their "target" playlists. Songs in "Liked Songs" that are not found in any of the target playlists are considered "unsorted" and are displayed in the queue.

    Sorting an Item: When a user sorts a song, the app will call the Spotify API to add the song to the selected playlists. It will then immediately update its own database to reflect that the song has been attributed to those playlists.



This is the backend for the project in nestJs, i have not thought about data storage yet. 
I follow a hexagonal architecture, so the business logic is in the domain layer, and the infrastructure layer is responsible for data storage and external APIs.
