# Random Hadith Fetcher

This project is a simple web application that fetches Hadiths (sayings of the Prophet Muhammad) from an Open API source and displays them in English.

![image](https://github.com/user-attachments/assets/d7ab6b27-8a47-424b-abcc-bcfaeacd6bd6)

## Features

- Fetches Hadiths from four sources: Sahih Bukhari, Sahih Muslim, Abu Dawud, Ibn Majah, Al-Tirmidhi
- Displays the Hadith text in English
- Allows the user to filter the hadith book
- Next button to fetch the next random hadith.
- New background for every hadith
- Skeleton Container for when hadith is being fetched as a loading screen.
- Smooth Transitions with Background and Hadith
- Filter to remove or add the content displayed such as chapter, book and etc.
- Snapshot the hadith with the background to be used to shared on social media platforms.
- Copy the hadith on screen to clipboard which can be pasted anywhere.
- Website is responsive to all devices with all functionality working from any device that you use.
- Hadith's are now shareable through a URL which can be used to fetch that specific hadith. 

## Upcoming Features
- Match the background with the context of the hadith using API

## Bug
- Filtering the hadith book will not search the hadith of the book it's been filtered to but the book previously set. This will need to be fixed so that the hadith of the book is fetched when new book has been chosen. [FIXED]
- Null values given to some of the hadith content on the card. I want it to not display rather than be given a null value. 