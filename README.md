# sivart-ci
---
A Body-less Head-only CI Dashboard built with MEAN stack and Socket.IO for Realtime monitoring.

####View Streams
![Sivart-CI Main View](http://i.imgur.com/5XaqeqO.png)

####Expand Stream

![enter image description here](http://i.imgur.com/7LMk7na.png)

### How to Run
---
#### Install
Once repo is cloned, run `npm install` in repo folder to install all dependencies. Note that MongoDB is currently accessed from [Modulus.io](https://modulus.io/) and Database URL and Path are used from `sivart-ci\configuration.json`, in case you want to make any database changes, change variables accordingly.

#### Start
Once dependencies are installed, run `npm start` and and open `localhost:4000` in your web browser. In case you want to use different ports, change the same in `configuration.json`.

#### REST API to Create Sample Records

While the URL given in configuration points  to MongoDB instance with some sample records available (which may not be permanent). So in case you're planning to make database changes, Sivart-CI already has REST endpoints available for required CRUD operations that you can manually use to create compliant _Changelist_ records.

* `GET /api/changelists`
Gets all the available changelists from configured MongoDB server.
```json
[
  {
    "_id": "56589a208cc3ec6c2ede72a3",
    "changeListName": "432464",
    "owner": "JTuck",
    "timeStarted": 1400299920000,
    "__v": 0,
    "functionalTest": {
      "total": 16321,
      "passCount": 0,
      "duration": 0
    },
    "unitTest": {
      "total": 345,
      "passCount": 0,
      "duration": 0
    },
    "build": {
      "timeCompleted": 0
    },
    "activity": {
      "phase": 0,
      "status": 0
    }
  }
  ...
  ...
 ]
```
* `POST /api/changelist`
Creates a Changelist item on server and returns `id` and `status` of operation.
**Request Body**
```json
{
    "changeListName": "432464",
    "owner": "JTuck",
    "timeStarted": 1400299920000,
    "activity": {
        "status": 1,
        "phase": 0
    },
    "build": {
        "timeCompleted": 0
    },
    "unitTest": {
        "total": 345,
        "passCount": 0,
        "duration": 0
    },
    "functionalTest": {
        "total": 16321,
        "passCount": 0,
        "duration": 0
    }
}
```
**Response**
```json
{
  "status": 1,
  "id": "56589a938cc3ec6c2ede72a4",
  "changeListName": "432463"
}
```
* `PUT /api/changelist/:changelist_id`
Updates a Changelist item on server for provided `changelist_id`.
**Request  Body**
```json
{
    "activity": {
        "status": 0,
        "phase": 0
    }
}
```
**Response**
```json
{
  "status": 1,
  "id": "56589a938cc3ec6c2ede72a4",
  "changeListName": "432463"
}
```
* `DELETE /api/changelist/:changelist_id`
Deletes a Changelist item on server for provided `changelist_id`.
**Response**
```json
{
	status: 1
}
```
### Technologies Used
---
- ExpressJS - Node HTTP Server.
- Modulus - MongoDB Hosting Provider.
- Mongoose - ODM for MongoDB.
- Morgan - Logging for NodeJS applications.
- Socket.IO - Socket support for NodeJS and WebSocket in Browser.
- GruntJS - Build automation and Compass support.

###Author
---
[Kushal Pandya](https://doublslash.com)
