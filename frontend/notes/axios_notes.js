// # config object
// * A config object is just a JavaScript object that tells Axios 
// how to make the request.

// axios.put("/put", {...})
// second argument is the config object
// {
//     params: { rating: 1600 },
//     headers: { Authorization: "Bearer token" },
//     data: {name: "kumar utkarsh"},
//     timeout: 5000
// }
// Axios converts this into an HTTP request: URL + Headers + Body



// 1. params ---------------------------------------------------
axios.get("/get", {
    params: { rating: 1600 }
});
// becomes: GET /get?rating=1600
// express side we can do
app.get("/get", (req, res) => {
    console.log(req.query);
});
// which will return
{ rating: "1600" }
// or
const rating = Number(req.query.rating);


// 2. headers ------------------------------------------------------
axios.get("/get", {
    headers: {
        Authorization: "Bearer token"
    }
});
// becomes: Authorization: Bearer token
// on express side we can do
app.get("/get", (req, res) => {
    console.log(req.headers.authorization);
});


// 3. data -------------------------------------------------------
// Only works in POST / PUT / PATCH
axios.post("/add_user", {
    name: "kumar utkarsh"
});
// on express side we can do
app.post("/add_user", (req, res) => {
    console.log(req.body);
});
// output will be
{ name: "kumar utkarsh" }


// 4. timeout
axios.get("/get", {
    timeout: 5000
});
// If server doesn’t respond in 5 sec → error
// Express
// Express does nothing with this
// This is client-side only











// get

// different ways of sending axios.get request

// 1. simplest, no parameters just hit the route
axios.get("/get");


// 2. get with query parameters
axios.get("/get", {
    params: {
        rating: 1600,
        user_id: 0
    }
});
// converts to: /get?rating=1600&user_id=0
// express side: 
// req.query.rating
// req.query.user_id


// 3. GET using URL string (manual query)
axios.get("/get?rating=1600&user_id=0");

// 4. with dynamic URL
axios.get(`/user/${userId}`);

// 🚫 Important: GET does NOT use body
// 👉 GET should NOT send body (some browsers ignore it)
axios.get("/get", {
    data: { rating: 1600 }
});
axios.get("/get", {
    rating: 1600 
});

// this is wrong



// post

// delete
