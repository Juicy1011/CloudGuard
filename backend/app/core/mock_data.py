MOCK_MICROSERVICES = [
    {
        "id": "c7a1b2",
        "name": "auth-service",
        "image": "cloudguard/auth:v2.4",
        "status": "Up 48 hours",
        "ports": "8081/tcp"
    },
    {
        "id": "f9d3e4",
        "name": "payment-gateway",
        "image": "cloudguard/payments:v1.1",
        "status": "Up 12 hours",
        "ports": "8443/tcp"
    },
    {
        "id": "a5c6d7",
        "name": "inventory-db",
        "image": "postgres:15-alpine",
        "status": "Up 10 days",
        "ports": "5432/tcp"
    },
    {
        "id": "b2e1f0",
        "name": "order-processor",
        "image": "cloudguard/orders:latest",
        "status": "Up 5 hours",
        "ports": "3000/tcp"
    },
    {
        "id": "e4a9c8",
        "name": "redis-cache",
        "image": "redis:7.0-bullseye",
        "status": "Up 24 hours",
        "ports": "6379/tcp"
    },
    {
        "id": "d1f5b6",
        "name": "nginx-ingress",
        "image": "nginx:stable-alpine",
        "status": "Up 2 weeks",
        "ports": "80/tcp, 443/tcp"
    },
    {
        "id": "a1b2c3",
        "name": "notification-service",
        "image": "cloudguard/notifications:v1.0",
        "status": "Up 3 days",
        "ports": "8082/tcp"
    },
    {
        "id": "d4e5f6",
        "name": "user-profile",
        "image": "cloudguard/profiles:v2.0",
        "status": "Up 6 hours",
        "ports": "8083/tcp"
    },
    {
        "id": "g7h8i9",
        "name": "recommendation-engine",
        "image": "cloudguard/recs:latest",
        "status": "Up 1 day",
        "ports": "50051/tcp"
    },
    {
        "id": "j0k1l2",
        "name": "search-indexer",
        "image": "elasticsearch:8.10.2",
        "status": "Up 5 days",
        "ports": "9200/tcp"
    }
]
