# API notes: Juice Shop

Flow: Login -> Products -> Add to Basket -> Basket.
Stand: http://localhost:3000, Juice Shop.
Source: Chrome DevTools, Network tab.
Token is written as <token>.

## Registration

Method: POST
URL: /api/Users/
Headers: Content-Type: application/json

Request body:

    {
      "email": "aqa@shop.test",
      "password": "Test@12345",
      "passwordRepeat": "Test@12345",
      "securityQuestion": {
        "id": 1,
        "question": "Your eldest siblings middle name?",
        "createdAt": "2026-10-11T19:43:22.347Z",
        "updatedAt": "2026-10-11T19:43:22.347Z"
      },
      "securityAnswer": "Test"
    }

Status: 201

Response body:

    {
      "status": "success",
      "data": {
        "username": "",
        "role": "customer",
        "deluxeToken": "",
        "lastLoginIp": "0.0.0.0",
        "profileImage": "/assets/public/images/uploads/default.svg",
        "isActive": true,
        "id": 34,
        "email": "aqa@shop.test",
        "updatedAt": "2026-10-11T21:05:55.632Z",
        "createdAt": "2026-10-11T21:05:55.632Z",
        "deletedAt": null
      }
    }

## Login

Method: POST
URL: /rest/user/login
Headers: Content-Type: application/json

Request body:

    {
      "email": "aqa@shop.test",
      "password": "Test@12345"
    }

Status: 200

Response body:

    {
      "authentication": {
        "token": "<token>",
        "bid": 9,
        "umail": "aqa@shop.test"
      }
    }

Note: bid is the basket id. It is in the response and also inside the token payload (field "bid").

Login with a wrong password:

Request body:

    {
      "email": "aqa@shop.test",
      "password": "WrongPass123!"
    }

Status: 401

Response body (plain text, not JSON):

    Invalid email or password.

## Products

Method: GET
URL: /rest/products/search?q=
Headers: none, works without a token

Request body: none

Status: 200

Response body (46 products, the first one is shown):

    {
      "status": "success",
      "data": [
        {
          "id": 1,
          "name": "Apple Juice (1000ml)",
          "description": "The all-time classic.",
          "price": 1.99,
          "deluxePrice": 0.99,
          "image": "apple_juice.jpg",
          "createdAt": "2026-10-11 19:43:23.978 +00:00",
          "updatedAt": "2026-10-11 19:43:23.978 +00:00",
          "deletedAt": null
        }
      ]
    }

Note: the UI always sends an empty q and filters the list in the browser.
Typing "Apple" in the search field sends no request.

## Add to Basket

Method: POST
URL: /api/BasketItems/
Headers: Authorization: Bearer <token>, Content-Type: application/json

Request body:

    {
      "ProductId": 1,
      "BasketId": "9",
      "quantity": 1
    }

Status: 200

Response body:

    {
      "status": "success",
      "data": {
        "id": 9,
        "ProductId": 1,
        "BasketId": "9",
        "quantity": 1,
        "updatedAt": "2026-10-11T21:07:30.556Z",
        "createdAt": "2026-10-11T21:07:30.556Z"
      }
    }

Note: data.id is the id of the basket item. It is used to change or delete it.

## Basket

Method: GET
URL: /rest/basket/9
Headers: Authorization: Bearer <token>

Request body: none

Status: 200

Response body:

    {
      "status": "success",
      "data": {
        "id": 9,
        "coupon": null,
        "UserId": 34,
        "createdAt": "2026-10-11T21:06:44.046Z",
        "updatedAt": "2026-10-11T21:06:44.046Z",
        "Products": [
          {
            "id": 1,
            "name": "Apple Juice (1000ml)",
            "description": "The all-time classic.",
            "price": 1.99,
            "deluxePrice": 0.99,
            "image": "apple_juice.jpg",
            "createdAt": "2026-10-11T19:43:23.978Z",
            "updatedAt": "2026-10-11T19:43:23.978Z",
            "deletedAt": null,
            "BasketItem": {
              "ProductId": 1,
              "BasketId": 9,
              "id": 9,
              "quantity": 1,
              "createdAt": "2026-10-11T21:07:30.556Z",
              "updatedAt": "2026-10-11T21:07:30.556Z"
            }
          }
        ]
      }
    }

Note: the quantity is in Products[i].BasketItem.quantity.

## Change quantity

Sent when the same product is added again or "+" / "-" is pressed in the basket.

Method: PUT
URL: /api/BasketItems/9
Headers: Authorization: Bearer <token>, Content-Type: application/json

Request body:

    {
      "quantity": 2
    }

Status: 200

Response body:

    {
      "status": "success",
      "data": {
        "ProductId": 1,
        "BasketId": 9,
        "id": 9,
        "quantity": 2,
        "createdAt": "2026-10-11T21:07:30.556Z",
        "updatedAt": "2026-10-11T21:07:36.220Z"
      }
    }

## Delete from basket

Method: DELETE
URL: /api/BasketItems/9
Headers: Authorization: Bearer <token>

Request body: none

Status: 200

Response body:

    {
      "status": "success",
      "data": {}
    }

## Logout

Method: GET
URL: /rest/saveLoginIp
Headers: Authorization: Bearer <token>

Request body: none

Status: 200

Response body:

    {
      "id": 34,
      "username": "",
      "email": "aqa@shop.test",
      "password": "<password hash>",
      "role": "customer",
      "deluxeToken": "",
      "lastLoginIp": "",
      "profileImage": "/assets/public/images/uploads/default.svg",
      "totpSecret": "",
      "isActive": true,
      "createdAt": "2026-10-11T21:05:55.632Z",
      "updatedAt": "2026-10-11T21:08:46.757Z",
      "deletedAt": null
    }

Note: this is the only request sent on logout. The token is deleted in the browser, the server is not asked to cancel it.

## Forgot password: security question

Sent when the email is typed on the Forgot Password page.

Method: GET
URL: /rest/user/security-question?email=aqa@shop.test
Headers: none, works without a token

Request body: none

Status: 200

Response body:

    {
      "question": {
        "id": 1,
        "question": "Your eldest siblings middle name?",
        "createdAt": "2026-10-11T19:43:22.347Z",
        "updatedAt": "2026-10-11T19:43:22.347Z"
      }
    }

## Forgot password: reset password

Method: POST
URL: /rest/user/reset-password
Headers: Content-Type: application/json, works without a token

Request body:

    {
      "email": "aqa@shop.test",
      "answer": "Test",
      "new": "12345",
      "repeat": "12345"
    }

Status: 200

Response body:

    {
      "user": {
        "id": 34,
        "username": "",
        "email": "aqa@shop.test",
        "password": "<password hash>",
        "role": "customer",
        "deluxeToken": "",
        "lastLoginIp": "",
        "profileImage": "/assets/public/images/uploads/default.svg",
        "totpSecret": "",
        "isActive": true,
        "createdAt": "2026-10-11T21:05:55.632Z",
        "updatedAt": "2026-10-11T22:23:37.480Z",
        "deletedAt": null
      }
    }

Note: after this request the login with the new password "12345" returns 200.

Reset with a wrong answer to the security question:

Request body:

    {
      "email": "aqa@shop.test",
      "answer": "Tes",
      "new": "12345",
      "repeat": "12345"
    }

Status: 401

Response body (plain text, not JSON):

    Wrong answer to security question.
