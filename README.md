#NWEN304 Online shopping portal for clothing: Boutique Clothes 


##How to use your system(both for the web application and with REST API):

##What the interface is (both for the web application and with REST API):
##There are two interfaces in our system. 
-Web Application:
 - Administrator user for the site 
 - Basic user ie. customers

- REST Interface: 
 - The client uses REST Api methods such as GET/POST/PUT/DELETE to access data from Mongodb. 
 - Mongodb sends back JSON data to the client. 

###Admin Users: 
Pre set admin user in mongodb: 
- email: user1@gmail.com | password: User1234!@#$

After the admin logins, they are directed to the home page. The admin user has different capabilities compared to the basic user. The admin user can view the home page, carts, add products, admin products. 

Add Products: 
- Admin can add new clothing items to the products by inputing the name of the item, price, description and weather which will then add the product to the admin products page as well as the home page. 

Admin Products: 
 - In this page, the admin can select a product to edit/update and delete a product from the applicaiton as well. 


###Basic user: 
- Has no login

The basic user only has access to the home page and the carts page. This gives them the capabilty of viewing details of the product and adding it to their cart.

##What error handling has been implemented in your system(both for the web
application and with REST API):
