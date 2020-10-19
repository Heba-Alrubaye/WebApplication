# NWEN304 Online shopping portal for clothing: Boutique Clothes 


## How to use your system(both for the web application and with REST API):
- git clone the project
- Need to run 'npm install' to download the necessary packages
- Then run node app.js to run the application from the terminal 

The project is hosted in heroku: 

### Using the application: 

### Register:

### Login:

### HomePage:
The guest user, basic user(ie. customer) and admin can view this page. This is where the basic user will add the products to the cart form as well as view the details of the product. The admin user can do the same actions, but the 
guest user can only view the details of the product. 

### Add Products:
Admin can add new clothing items to the products by inputing the name of the item, price, description and weather which will then add the product to the admin products page as well as the home page. 

### Admin Products: 
 In this page, the admin can view all the products. They can select a product to edit/update and delete a product from the application as well. 

### Recommendations:
The add recommendation page to suggest clothes depends on weather (Clear, Snow, Cloud, Rain), when this page render, 
we get all recommendation clothes, each item contains details button and add to cart button.

### Carts: 
The carts page can be accessed by both the admin and basic user. They can add items from the HomePage to the cart if they want to purchase it and then press the buy items button in the cart page. There is a seperate carts collection in mongodb where the products are being created when the add to cart button is pressed on the home page clothing item.


### Logout: 
Press logout and return to sign in page.

## What the interface is (both for the web application and with REST API):
### There are three interfaces in our system. 
-Web Application:
 - Administrator user for the site 
 - Basic user ie. customers
 - Guest user

- REST Interface: 
 - The client uses REST Api methods such as GET/POST/PUT/DELETE to access data from Mongodb. 
 - Mongodb sends back data to the client. 

### Admin Users: 
Pre set admin user in mongodb: 
- email: user1@gmail.com | password: User1234!@#$

After the admin logins, they are directed to the home page. The admin user has different capabilities compared to the basic user. The admin user can view the home page, carts, add products, admin products. 

Add Products: 
- Admin can add new clothing items to the products by inputing the name of the item, price, description and weather which will then add the product to the admin products page as well as the home page. 

Admin Products: 
 - In this page, the admin can select a product to edit/update and delete a product from the applicaiton as well. 


### Basic user: 
- Has no login

The basic user only has access to the home page and the carts page. This gives them the capabilty of viewing details of the product and adding it to their cart.

## What error handling has been implemented in your system(both for the web application and with REST API):
