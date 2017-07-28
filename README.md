# NodeBook
A collaborative text editor with easy to edit and share documents.
**Created July, 2017**

## Table of Contents
- [About](#about)
- [Installation Instructions](#installation-instructions)
- [Built With](#built-with)
- [Features](#features)

## Team
- [Caroline Okun](https://github.com/carokun)
- [Teresa Liu](https://github.com/teresaliu20)
- [Sophia Torrance](https://github.com/sophiagrace)
- [Andrew Ong](https://github.com/crestwood204)

## About
NodeBook is a desktop app that allows for sharing documents and live collaboration. The text editor has numerous styles and fonts built in as well as search capabilities and access to revision history. 

## Installation Instructions:
#### Prerequisites:
Requires Node.js
1. Download the repository
2. Run ```npm install``` to download the node modules
3. Run ```npm run webpack``` to bundle the code
4. Run ```npm run server``` to run the server
5. Run ```npm start``` to launch a new window
   - You can launch multiple windows to test the collaborative functionality

## Built With
- Electron
- Frontend
  - React.js
  - Draft.js
  - LESS
  - HTML/CSS
- Backend
  - Socket.io
  - Express
  - MongoDB

## Features

### Login and Register Page
When you first open the app you will be prompted with a login screen. For first time users, navigate to the register page and input your creditials before logging in!

### Documents List
Your account will open to a preview of all your existing documents which are stored in MongoDB between sessions.

![screen shot 2017-07-28 at 10 25 07 am](https://user-images.githubusercontent.com/23001355/28729742-5ab769c8-7382-11e7-99e4-fa7df3958d60.png)

To search through the documents by title or content, type into the search bar on the upper right hand corner.

![screen shot 2017-07-28 at 10 03 08 am](https://user-images.githubusercontent.com/23001355/28730128-b24877b2-7383-11e7-809b-231c83df0ed0.png)

To navigate to a specific document, simply click the document's preview. 

### Document View

We built our editor component on top of the Draft.js library. The document editor allows for typing and text decoration, including font size, color, and alignment, all of which are accessible from the top toolbar. There are keyboard shortcuts built in for common commands such as bolding (⌘B), italicizing (⌘I), and saving the document (⌘S). Some of the available effects are demoed in the picture below. The document will also autosave every 30 seconds so users don't lose their work!

![screen shot 2017-07-28 at 10 06 39 am](https://user-images.githubusercontent.com/23001355/28730148-c79e9fec-7383-11e7-8a15-05a4a9501119.png)

There is a search bar on the top right of the screen that allows users to search through their documents, highlighting the matching words and phrases.

![screen shot 2017-07-28 at 10 03 23 am](https://user-images.githubusercontent.com/23001355/28730139-bb46c440-7383-11e7-9d2e-4391eae871e1.png)

We also implemented live collaboration for shared documents using sockets. A preview of the collaborative features is shown below, to see more navigate to [Installation Instructions](#installation-instructions) and download the repo!

![ezgif com-video-to-gif](https://user-images.githubusercontent.com/23001355/28731442-c9152f12-7388-11e7-83b0-c29743ec24eb.gif)

### Revision History

To see all of your past versions of a given document, navigate to the revision history page. There will be list of every saved version, sorted by date, on the right side of the screen. Click on one of the dates to see the old state of your document as well as add and remove differences between your old and current document.

![screen shot 2017-07-28 at 10 25 27 am](https://user-images.githubusercontent.com/22362476/28729339-ffb98c28-7380-11e7-92f1-8210d346b6c9.png)

