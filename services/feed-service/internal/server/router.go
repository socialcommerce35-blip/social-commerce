package server

import (
	"context"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/socialcommerce35-blip/social-commerce/services/feed-service/internal/config"
	"github.com/socialcommerce35-blip/social-commerce/services/feed-service/internal/handler"
	"github.com/socialcommerce35-blip/social-commerce/services/feed-service/internal/middleware"
	"github.com/socialcommerce35-blip/social-commerce/services/feed-service/internal/repository"
	"github.com/socialcommerce35-blip/social-commerce/services/feed-service/internal/service"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

func NewRouter(cfg *config.Config, log *zap.Logger) chi.Router {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatal("failed to connect mongo", zap.Error(err))
	}

	db := client.Database(cfg.MongoDB)
	coll := db.Collection(cfg.ProductsCollection)

	repo := repository.NewProductRepo(coll, log)
	svc := service.NewFeedService(repo, log, cfg.RequestTimeout)
	h := handler.NewFeedHandler(svc, log)

	r := chi.NewRouter()
	r.Use(middleware.RequestLogger(log))
	r.Use(middleware.Recoverer(log))

	r.Route("/v1", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(middleware.JWTAuth(cfg.JWTSecret, log))
			r.Get("/feed", h.GetFeed)
		})
	})

	return r
}
