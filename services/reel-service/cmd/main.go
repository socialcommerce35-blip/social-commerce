package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/infra"
	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/repository"
	transport "github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/transport/rest"
	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/usecase"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	cfg := infra.LoadConfig()

	// MongoDB
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatal("mongo error:", err)
	}
	db := client.Database("reel-service")

	// GCS
	fmt.Println(cfg)
	gcsClient, err := infra.NewGCSClient(context.Background(), cfg.GCSBucketName, cfg.GCSCredsFile)
	if err != nil {
		log.Fatal("gcs error:", err)
	}

	// Dependencies
	repo := repository.NewReelRepo(db)
	uc := usecase.NewReelUsecase(repo, gcsClient)

	// Router
	router := transport.NewRouter(uc, cfg.JWTSecret)

	log.Println("Reel service running on port", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatal(err)
	}
}
