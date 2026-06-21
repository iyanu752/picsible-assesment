## RUN

```
npm install
npm run start:dev
```

## VALIDATE

```
npm run typecheck
npm run build
```

## ENVIRONMENT

Create a `.env` file from `.env.example` and fill in the Redis values.

The app logs the Redis lifecycle and cache strategy:

- Redis socket connected
- Redis connection ready
- Redis cache miss for dashboard:stats
- Redis cache hit for dashboard:stats
- Redis cache set for dashboard:stats with 60s TTL
- Redis cache invalidated for dashboard:stats after order writes

# THOUGHT PROCESS

Before i start writing any code, i want to document my thought process about how i would go about this assesment from a system design/architectural approach

## ROUTES

```
client/ HTTP request is made -> POST/orders/:id/stage , PATCH/orders/:id/stage, GET/orders, GET/dashboard
```

## CONTROLLERS

- orderController:

```
createOrder(), updateStage(), search()
```

- DashboardController

```
getDashboard()
```

## SERVICE

- orderService:

stage validation and business logic

- dashboardService:

compute the stats and check the cache

## DATALAYER

orderStore(database):

```
in memory map to orders[]
```

cacheStore:

```
in memory with a time to live of 60 seconds
```

## CACHING STRATEGY I PLAN TO USE

```
GET/dashboard -> 
dashboardService(redis.get(dashboard.stats)) -> is the cache hit? -> (if yes return data) -> if no compute from the realtime data and write to redis with a 60 seconds time to live and then return the data
```

I will be using a lazy loading approach that checks redis when the http request comes in, if the data is available in redis , it will return the data, if it is not available in redis, it falls back to the database to get the data, writes the data to redis then returns the data

## UPDATE TO DESIGN

While planning the system design, i figured out i missed something crucial with the write path, i was not calling a redis.del everytime an order was created and the stage was updated, this meant that the dashboard could show stale counts for up to 60 seconds after every write.

the update to the write path will look like this:

```
Order created -> Stage updated -> orderService -> redis.del('dashboard:stats)
```

we kill the cache entry

so when we try to get the dashboard stats we recompute the fresh stats and recache the data.

For the technologies i will be using, I dont want to over engineer the assesment so i will use the following:

- Nest js
- Redis
- a JSON file will serve as the database

```
( i chose this option so you would not have to no any complicated database setups on your end to test endpoints, you can npm install and start testing right away
for personal projects i would normally use supabase, Postgresql and prisma ORM or mongoDb 
)
```


## ENDPOINTS

Create an order:

```
POST /orders
```

Body:

```
{
  "customerName": "Iyanu Ahmed",
  "productName": "Custom Framed Hoodie Image",
  "quantity": 3,
  "stage": "pending"
}
```

Allowed stages:

- pending
- in_production
- quality_check
- completed
- cancelled

Update an order stage:

```
PATCH /orders/:id/stage
```

Body:

```
{
  "stage": "in_production"
}
```

List or search orders:

```
GET /orders
GET /orders?q=hoodie
```

Get dashboard stats:

```
GET /dashboard
```

Dashboard response shape:

```
{
  "totalOrders": 1,
  "totalQuantity": 3,
  "byStage": {
    "pending": 1,
    "in_production": 0,
    "quality_check": 0,
    "completed": 0,
    "cancelled": 0
  }
}
```

## ADDITIONAL QUEATION ANSWER
-Rather than calculating the dashboard stats from oders on every request, i can precompute the stats, cache them in Redis and update or invalidate them when the orders change.

-I can paginate the orders to only fetch like the first 10 rows rather than fetching millions of rows at once

-I can also start updating stats asyncronously using a queue

-I can add database indexes for filtering and searching
