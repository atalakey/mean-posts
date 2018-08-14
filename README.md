# mean-posts

A MEAN stack web application. A client side Angular driven application and a backend application powered by NodeJS, Express and Mongo DB.

In the app the user can create, edit and delete posts.

## App description (the app has three major components)

### Authentication Component
Allows the user to signup and login using an email address and a password.

### Header Component
Display links to navigate the app.

### Posts Component
Allows the user to view all posts, create a new post and edit or delete an existing post.

## App Demo:

![]()

## Installation

Be sure to have all the listed prerequisites installed.

### Prerequisites:
```
You must have @angular/cli, NodeJS and Mongo DB installed.
```

### To install the prerequisites (macOS only)
```
1. Install Homebrew:

    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

2. Install Mongo DB:

    brew install mongodb

3. Install NodeJS:

    brew install node

4. Install Angular CLI globally:

    npm install -g @angular/cli
```

### To use the application:
``` 
1. Clone the project:

    git clone https://github.com/atalakey/mean-posts.git ~/Desktop/mean-posts

2. Navigate to where you cloned the project:

    cd ~/Desktop/mean-posts

3. Install App dependencies:

    npm install

4. Navigate to where you cloned the project and into the backend directory:

    cd ~/Desktop/mean-posts/backend

5. Install App dependencies:

    npm install
```

## Run the App

Be sure to have Mongo DB up and running.

### Angular frontend

```
ng serve
```

### NodeJS Express backend

```
nodemon server.js
```

# Disclaimer:
This app is for demo purposes only.
