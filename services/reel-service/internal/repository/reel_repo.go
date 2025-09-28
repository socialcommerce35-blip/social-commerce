package repository

import (
	"context"
	"time"

	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type ReelRepo struct {
	collection *mongo.Collection
}

func NewReelRepo(db *mongo.Database) *ReelRepo {
	return &ReelRepo{collection: db.Collection("reels")}
}

func (r *ReelRepo) Save(ctx context.Context, reel *domain.Reel) error {
	reel.CreatedAt = time.Now()
	_, err := r.collection.InsertOne(ctx, reel)
	return err
}

func (r *ReelRepo) ListAll(ctx context.Context) ([]domain.Reel, error) {
	cur, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var reels []domain.Reel
	if err := cur.All(ctx, &reels); err != nil {
		return nil, err
	}
	return reels, nil
}

func (r *ReelRepo) ListByUser(ctx context.Context, userID string) ([]domain.Reel, error) {
	cur, err := r.collection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var reels []domain.Reel
	if err := cur.All(ctx, &reels); err != nil {
		return nil, err
	}
	return reels, nil
}
